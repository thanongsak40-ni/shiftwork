import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // สร้าง Super Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@senx.com' },
    update: {},
    create: {
      email: 'admin@senx.com',
      password: hashedPassword,
      name: 'Admin SENX',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Created admin:', admin.email);

  // สร้างโครงการตัวอย่าง
  const project1 = await prisma.project.upsert({
    where: { id: 'proj-1' },
    update: {},
    create: {
      id: 'proj-1',
      name: 'คอนโดมิเนียมแกรนด์สุขุมวิท',
      location: 'สุขุมวิท 71',
      themeColor: '#3b82f6',
      managerId: admin.id,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'proj-2' },
    update: {},
    create: {
      id: 'proj-2',
      name: 'หมู่บ้านภัสสร',
      location: 'พระราม 2',
      themeColor: '#10b981',
      managerId: admin.id,
    },
  });

  const project3 = await prisma.project.upsert({
    where: { id: 'proj-3' },
    update: {},
    create: {
      id: 'proj-3',
      name: 'ทาวน์โฮมเดอะแกรนด์',
      location: 'บางนา-ตราด กม.8',
      themeColor: '#f59e0b',
      managerId: admin.id,
    },
  });

  console.log('✅ Created projects');

  // สร้าง Cost Sharing (โครงการ 1 แชร์ให้โครงการ 2 และ 3)
  await prisma.costSharing.createMany({
    data: [
      {
        sourceProjectId: project1.id,
        destinationProjectId: project2.id,
        percentage: 30,
      },
      {
        sourceProjectId: project1.id,
        destinationProjectId: project3.id,
        percentage: 20,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Created cost sharing');

  // สร้างพนักงานตัวอย่าง
  await prisma.staff.createMany({
    data: [
      {
        name: 'สมชาย ใจดี',
        position: 'รปภ.',
        phone: '081-234-5678',
        wagePerDay: 450,
        staffType: 'REGULAR',
        projectId: project1.id,
        isActive: true,
      },
      {
        name: 'สมหญิง สุขใจ',
        position: 'แม่บ้าน',
        phone: '089-876-5432',
        wagePerDay: 400,
        staffType: 'REGULAR',
        projectId: project1.id,
        isActive: true,
      },
      {
        name: 'ประยุทธ์ มั่นคง',
        position: 'รปภ.สแปร์',
        phone: '092-111-2233',
        wagePerDay: 450,
        staffType: 'SPARE',
        projectId: project1.id,
        isActive: true,
      },
      {
        name: 'สมศักดิ์ วิริยะ',
        position: 'ช่างซ่อมบำรุง',
        phone: '085-555-6677',
        wagePerDay: 500,
        staffType: 'REGULAR',
        projectId: project2.id,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Created sample staff');

  console.log('🎉 Seed completed!');
  console.log('📧 Login with: admin@senx.com');
  console.log('🔑 Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
