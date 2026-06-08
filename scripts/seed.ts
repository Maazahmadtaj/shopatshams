import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const hash = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shopatshams.com' },
    update: {},
    create: { email: 'admin@shopatshams.com', name: 'Admin', passwordHash: hash, role: 'admin' },
  })
  console.log(`✅ Admin user: ${admin.email} / admin123`)
  console.log()
  console.log('Run "npm run scrape" to import all products from the live store.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
