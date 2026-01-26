# 🏢 ระบบจัดการเวรปฏิบัติงานและบริหารค่าใช้จ่าย - SENX Juristic

ระบบ Web Application สำหรับจัดการตารางเวร (Roster) และบริหารจัดการต้นทุนสำหรับนิติบุคคลอาคารชุด (Condo) และหมู่บ้านจัดสรร

## 🚀 Quick Start

### 1. ติดตั้ง Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. ตั้งค่า Environment

```bash
# Backend
cd backend
cp .env.example .env
# แก้ไข DATABASE_URL และ JWT secrets

# Frontend
cd ../frontend
cp .env.example .env
```

### 3. Setup Database

```bash
cd backend
npm run db:push
npm run db:seed
```

### 4. รันโปรเจค

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:5173
- **Login**: admin@senx.com / admin123

## 📁 โครงสร้างโปรเจค

```
Shift Work SENX Juristic/
├── backend/                 # Express + TypeScript API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth middleware
│   │   ├── utils/           # JWT utilities
│   │   └── types/           # TypeScript types
│   ├── prisma/              # Database schema
│   └── package.json
│
├── frontend/                # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── stores/          # Zustand stores
│   │   └── types/           # TypeScript types
│   └── package.json
│
└── old-nextjs-backup/       # โค้ด Next.js เดิม (สำรอง)
```

## 🛠 เทคโนโลยีที่ใช้

### Frontend
- **React** + **Vite** + TypeScript
- **Ant Design 6.x** - UI Library
- **React Query (TanStack Query)** - State Management
- **Axios** - HTTP Client
- **Zustand** - Global State
- **React Router** - Routing

### Backend
- **Node.js** + **Express** + TypeScript
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Database
- **JWT** (Access + Refresh Token) - Authentication
- **Bcrypt** - Password Hashing

## 🔑 Authentication Flow

ระบบใช้ **JWT Authentication** แบบ Access Token + Refresh Token:

1. **Access Token**: เก็บใน localStorage, อายุ 15 นาที
2. **Refresh Token**: เก็บใน httpOnly cookie, อายุ 7 วัน
3. Auto-refresh เมื่อ Access Token หมดอายุ

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/refresh` - รีเฟรช Access Token
- `POST /api/auth/logout` - ออกจากระบบ
- `GET /api/auth/me` - ข้อมูลผู้ใช้ปัจจุบัน

### Projects
- `GET /api/projects` - รายการโครงการ
- `GET /api/projects/:id` - รายละเอียดโครงการ
- `POST /api/projects` - สร้างโครงการ
- `PUT /api/projects/:id` - แก้ไขโครงการ
- `DELETE /api/projects/:id` - ลบโครงการ (soft delete)

### Staff, Rosters, Reports
- API endpoints อยู่ระหว่างการพัฒนา

## 🎨 Features

- ✅ JWT Authentication (Access + Refresh Token)
- ✅ Protected Routes
- ✅ Auto Token Refresh
- ✅ Ant Design UI Components
- ✅ TypeScript Type Safety
- ✅ API Client with Interceptors
- 🚧 Project Management (In Progress)
- 🚧 Staff Management (Coming Soon)
- 🚧 Roster Management (Coming Soon)
- 🚧 Reports & Export (Coming Soon)

## 📋 ความต้องการของระบบ

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14.0
- **npm** หรือ **yarn**

## 🔧 Development Scripts

### Backend
```bash
npm run dev          # รัน development server
npm run build        # Build TypeScript
npm run start        # รัน production server
npm run db:push      # Push Prisma schema
npm run db:studio    # เปิด Prisma Studio
npm run db:seed      # Seed ข้อมูลตัวอย่าง
```

### Frontend
```bash
npm run dev          # รัน development server
npm run build        # Build สำหรับ production
npm run preview      # Preview production build
npm run lint         # รัน ESLint
```

## 📚 เอกสารเพิ่มเติม

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - คู่มือการติดตั้งอย่างละเอียด
- [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) - ขั้นตอน Deploy (Frontend + Backend) และไฟล์ zip สำหรับอัปโหลด
- [GITHUB_SETUP_GUIDE.md](GITHUB_SETUP_GUIDE.md) - การตั้งค่า GitHub และ CI/CD ด้วย GitHub Actions
- [Prisma Schema](backend/prisma/schema.prisma) - Database schema

## 🐛 Known Issues

- Staff, Roster, และ Report APIs ยังเป็น placeholder
- ยังไม่มี Unit Tests
- UI ยังเป็น basic version

## 📝 License

MIT

---

**สร้างโดย:** SENX Development Team  
**อัพเดทล่าสุด:** January 19, 2026

│   │   ├── staff/              # Staff Management
│   │   ├── rosters/            # Roster Management
│   │   └── reports/            # Reports
│   ├── dashboard/              # Dashboard Pages
│   │   ├── projects/           # Projects Page
│   │   ├── staff/              # Staff Page
│   │   ├── roster/             # Roster Page
│   │   └── reports/            # Reports Page
│   ├── login/                  # Login Page
│   ├── layout.tsx              # Root Layout
│   ├── page.tsx                # Home Page (Redirect)
│   └── globals.css             # Global Styles
├── lib/
│   ├── prisma.ts               # Prisma Client
│   ├── auth.ts                 # Authentication Utils
│   ├── utils.ts                # Utility Functions
│   └── cost-sharing.ts         # Cost Sharing Logic
├── prisma/
│   ├── schema.prisma           # Database Schema
│   └── seed.ts                 # Seed Data
├── public/                     # Static Assets
├── .env                        # Environment Variables
├── .env.example                # Example Environment
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript Config
├── tailwind.config.ts          # Tailwind Config
└── README.md                   # Documentation
```

## 🎮 การใช้งาน

### 1. เข้าสู่ระบบ

ไปที่หน้า Login และใช้ข้อมูลที่ได้จาก Seed:
- Email: `admin@senx.com`
- Password: `admin123`

### 2. Dashboard

หน้าแรกหลังจาก Login จะแสดง:
- สถิติภาพรวมโครงการและพนักงาน
- รายการโครงการทั้งหมด
- Quick Access ไปยังตารางเวรและรายงานแต่ละเดือน

### 3. จัดการโครงการ

**เพิ่มโครงการ:**
1. ไปที่ "จัดการโครงการ"
2. คลิก "เพิ่มโครงการ"
3. กรอกชื่อ, สถานที่, สีธีม
4. (ตัวเลือก) ตั้งค่า Cost Sharing ไปยังโครงการอื่น

**Cost Sharing:**
- สามารถระบุได้ว่าโครงการนี้จะแชร์ค่าใช้จ่ายไปที่โครงการไหนบ้าง
- กำหนดสัดส่วน % สำหรับแต่ละโครงการปลายทาง
- ระบบจะคำนวณและแสดงในรายงานอัตโนมัติ

### 4. จัดการพนักงาน

**เพิ่มพนักงาน:**
1. ไปที่ "จัดการพนักงาน"
2. คลิก "เพิ่มพนักงาน"
3. กรอกข้อมูล: ชื่อ, ตำแหน่ง, ค่าแรง/วัน, ประเภท (ประจำ/สแปร์)
4. เลือกโครงการที่สังกัด

**เปลี่ยนสถานะ Active/Inactive:**
- คลิกที่ Badge สถานะ (ทำงาน/ไม่ทำงาน)
- พนักงาน Inactive จะไม่แสดงในตารางเวรใหม่ แต่เก็บประวัติได้

### 5. จัดตารางเวร

1. เลือกโครงการ, ปี, เดือนจาก Dashboard
2. แก้ไขกะของพนักงานแต่ละวัน (คลิกที่ dropdown)
3. ระบบจะแสดงสีตามประเภทกะ
4. คลิก "บันทึก" เมื่อแก้ไขเสร็จ

**รหัสกะ:**
- **1, 2, 3** - กะเช้า, บ่าย, ดึก
- **ดึก** - กะดึก
- **OFF** - วันหยุด
- **ข** - ขาดงาน
- **ป** - ลาป่วย
- **ก** - ลากิจ
- **พ** - พักร้อน

### 6. ดูรายงาน

**รายงานสรุปการทำงาน:**
- แสดงจำนวนวันทำงาน, ขาด, ลา
- คำนวณยอดหักเงินอัตโนมัติ

**รายงาน Cost Sharing:**
- แสดงต้นทุนเดิมของแต่ละโครงการ
- แสดงยอดที่แชร์ออก (Shared Out)
- แสดงยอดที่ได้รับ (Shared In)
- คำนวณต้นทุนสุทธิ (Net Cost)

## 🔧 การพัฒนาและแก้ไข

### Database Management

```bash
# ดู Database ผ่าน Prisma Studio
npm run db:studio

# Generate Prisma Client หลังแก้ Schema
npm run db:generate

# Push Schema ไปยัง Database
npm run db:push
```

### Build สำหรับ Production

```bash
npm run build
npm run start
```

## 🐛 Troubleshooting

### ปัญหา: Database Connection Failed
**แก้ไข:** ตรวจสอบ `DATABASE_URL` ใน `.env` ให้ถูกต้อง

### ปัญหา: Login ไม่ผ่าน
**แก้ไข:** ตรวจสอบว่าได้รัน `npm run db:seed` แล้วหรือยัง

### ปัญหา: Prisma Client Error
**แก้ไข:** รัน `npm run db:generate` ใหม่

## 📝 License

MIT License - สามารถนำไปใช้งานและแก้ไขได้ตามต้องการ

## 👨‍💻 Developer

SENX Development Team

---

**🎉 ขอบคุณที่ใช้งานระบบจัดการเวรปฏิบัติงาน SENX Juristic!**
