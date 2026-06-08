import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const BASE = 'https://shopatshams.com.pk'
const DELAY = 600

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

interface ShopifyProduct {
  id: number; title: string; handle: string; vendor: string; product_type: string
  body_html: string; tags: string[]; variants: ShopifyVariant[]; images: ShopifyImage[]
  options: { name: string; values: string[] }[]
}
interface ShopifyVariant { id: number; title: string; price: string; sku: string; available: boolean; compare_at_price: string | null; grams: number }
interface ShopifyImage { id: number; src: string; position: number }
interface ShopifyCollection { id: number; title: string; handle: string }

async function fetchProducts(page: number): Promise<ShopifyProduct[]> {
  const url = `${BASE}/products.json?limit=250&page=${page}`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) { console.error(`HTTP ${res.status} on page ${page}`); return [] }
  const data = await res.json() as any
  return data.products ?? []
}

async function fetchCollections(page: number): Promise<ShopifyCollection[]> {
  const url = `${BASE}/collections.json?limit=250&page=${page}`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) return []
  const data = await res.json() as any
  return data.collections ?? []
}

async function scrapeCollections() {
  console.log('📁 Scraping collections...')
  let page = 1; let total = 0
  while (true) {
    const cols = await fetchCollections(page)
    if (!cols.length) break
    for (const c of cols) {
      await prisma.collection.upsert({
        where: { shopifyId: String(c.id) },
        update: { title: c.title, handle: c.handle },
        create: { shopifyId: String(c.id), title: c.title, handle: c.handle },
      })
      total++
    }
    console.log(`  Collections page ${page}: ${cols.length} items`)
    if (cols.length < 250) break
    page++; await sleep(DELAY)
  }
  console.log(`✅ ${total} collections saved`)
}

async function scrapeProducts() {
  console.log('📦 Scraping products...')
  let page = 1; let total = 0; let skipped = 0

  while (true) {
    const products = await fetchProducts(page)
    if (!products.length) { console.log(`  Page ${page}: empty, stopping`); break }

    console.log(`  Page ${page}: ${products.length} products...`)

    for (const p of products) {
      try {
        const firstVariant = p.variants[0]
        const price = parseFloat(firstVariant?.price ?? '0')
        const compareAtPrice = firstVariant?.compare_at_price ? parseFloat(firstVariant.compare_at_price) : null

        await prisma.product.upsert({
          where: { shopifyId: String(p.id) },
          update: {
            title: p.title, handle: p.handle, vendor: p.vendor,
            productType: p.product_type ?? '', description: p.body_html ?? '',
            price, compareAtPrice, sku: firstVariant?.sku ?? null,
            available: p.variants.some(v => v.available),
            images: JSON.stringify(p.images.map(i => ({ id: i.id, src: i.src, position: i.position }))),
            variants: JSON.stringify(p.variants.map(v => ({ id: v.id, title: v.title, price: v.price, sku: v.sku, available: v.available }))),
            tags: JSON.stringify(p.tags),
            options: JSON.stringify(p.options),
          },
          create: {
            shopifyId: String(p.id), title: p.title, handle: p.handle, vendor: p.vendor,
            productType: p.product_type ?? '', description: p.body_html ?? '',
            price, compareAtPrice, sku: firstVariant?.sku ?? null,
            available: p.variants.some(v => v.available),
            images: JSON.stringify(p.images.map(i => ({ id: i.id, src: i.src, position: i.position }))),
            variants: JSON.stringify(p.variants.map(v => ({ id: v.id, title: v.title, price: v.price, sku: v.sku, available: v.available }))),
            tags: JSON.stringify(p.tags),
            options: JSON.stringify(p.options),
          },
        })
        total++
      } catch (err) {
        console.error(`  ⚠ Skipped ${p.handle}: ${err}`)
        skipped++
      }
    }

    if (products.length < 250) break
    page++
    await sleep(DELAY)
  }

  console.log(`✅ ${total} products saved, ${skipped} skipped`)
}

async function main() {
  console.log('🚀 Starting Shams Shopping Centre product scraper...')
  console.log(`📡 Source: ${BASE}`)
  console.log()
  await scrapeCollections()
  await scrapeProducts()
  console.log()
  console.log('🎉 Scraping complete!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
