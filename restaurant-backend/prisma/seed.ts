import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. ล้างข้อมูลเก่าก่อน (เพื่อไม่ให้ข้อมูลซ้ำเวลา รันหลายรอบ)
  // ต้องเรียงลำดับการลบ เพราะมี Relation กัน (ลบลูกก่อนลบแม่)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();

  // 2. สร้าง Category (หมวดหมู่)
  const catFood = await prisma.category.create({
    data: { name: 'อาหารจานเดียว' },
  });
  const catDrink = await prisma.category.create({
    data: { name: 'เครื่องดื่ม' },
  });
  const catAppetizer = await prisma.category.create({
    data: { name: 'ของทานเล่น' },
  });

  // 3. สร้าง Menu (รายการอาหาร)
  await prisma.menu.createMany({
    data: [
      {
        nameTH: 'ข้าวกะเพราไก่ไข่ดาว',
        nameEN: 'Basil Chicken with Rice',
        description: 'เผ็ดร้อน ถึงใจ',
        price: 60,
        categoryId: catFood.id,
        imageUrl: 'https://placehold.co/600x400/png?text=Basil+Chicken',
        isAvailable: true,
      },
      {
        nameTH: 'ข้าวผัดหมู',
        nameEN: 'Fried Rice with Pork',
        price: 55,
        categoryId: catFood.id,
        imageUrl: 'https://placehold.co/600x400/png?text=Fried+Rice',
      },
      {
        nameTH: 'น้ำเปล่า',
        nameEN: 'Water',
        price: 15,
        categoryId: catDrink.id,
        imageUrl: 'https://placehold.co/600x400/png?text=Water',
      },
      {
        nameTH: 'โค้ก',
        nameEN: 'Coke',
        price: 25,
        categoryId: catDrink.id,
        imageUrl: 'https://placehold.co/600x400/png?text=Coke',
      },
      {
        nameTH: 'เฟรนช์ฟรายส์',
        nameEN: 'French Fries',
        price: 49,
        categoryId: catAppetizer.id,
      },
    ],
  });

  // 4. สร้าง Table (โต๊ะ)
  await prisma.table.createMany({
    data: [
      { name: 'T1', qrCode: 'https://example.com/qr/t1' },
      { name: 'T2', qrCode: 'https://example.com/qr/t2' },
      { name: 'T3', qrCode: 'https://example.com/qr/t3' },
      { name: 'T4', qrCode: 'https://example.com/qr/t4' },
      { name: 'VIP1', qrCode: 'https://example.com/qr/vip1' },
    ],
  });

  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });