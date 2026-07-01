# طب نت - TibNet

منصة خدمات طبية عراقية مبنية حسب دليل TibNet المرفق: واجهة عربية RTL، صفحات عامة، لوحة إدارة، Prisma/PostgreSQL، مصادقة أدمن، بحث وفلاتر، واتساب، عروض، مواعيد، وإدارة بيانات أساسية تبدأ فارغة.

## أهم شرط في المشروع

بعد تشغيل seed الأول، جداول المحافظات والمناطق والاختصاصات تبقى فارغة تماماً. لا توجد محافظات أو مناطق أو اختصاصات hardcoded داخل الكود. الأدمن وحده يضيفها من لوحة الإدارة.

## التشغيل المحلي

1. ثبّت الحزم:

```bash
npm install
```

2. انسخ ملف البيئة:

```bash
cp .env.example .env
```

3. عدّل `DATABASE_URL` و `AUTH_SECRET` وبيانات الأدمن في `.env`.

4. جهّز قاعدة البيانات:

```bash
npx prisma migrate dev
npx prisma db seed
```

5. شغّل التطبيق:

```bash
npm run dev
```

افتح `http://localhost:3000` للموقع العام و `http://localhost:3000/login` لدخول الأدمن.

## بيانات الأدمن الافتراضية

تأتي من `.env`:

```env
ADMIN_EMAIL="admin@tibnet.local"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="change-this-password"
```

## الصفحات العامة

- `/` الصفحة الرئيسية: Hero، بحث، إحصائيات، وأطباء مميزون.
- `/doctors` قائمة الأطباء مع فلاتر.
- `/dentists` قائمة أطباء الأسنان مع فلاتر.
- `/pharmacies` الصيدليات مع فلاتر ورسالة فارغة/قريباً عند عدم وجود بيانات.
- `/labs` المختبرات مع فلاتر ورسالة فارغة/قريباً عند عدم وجود بيانات.
- `/offers` العروض النشطة وغير المنتهية.
- `/providers/[slug]` تفاصيل مقدم الخدمة مع واتساب، إنستغرام، وطلب موعد.
- `/login` دخول لوحة الإدارة.

## لوحة الإدارة

- `/admin` Dashboard.
- `/admin/governorates` CRUD المحافظات.
- `/admin/areas` CRUD المناطق.
- `/admin/specialties` CRUD الاختصاصات.
- `/admin/providers` CRUD الأطباء وأطباء الأسنان.
- `/admin/pharmacies` CRUD الصيدليات.
- `/admin/labs` CRUD المختبرات.
- `/admin/offers` CRUD العروض.
- `/admin/appointments` إدارة طلبات المواعيد.
- `/admin/users` إدارة حسابات ADMIN و EDITOR.
- `/admin/settings` إعدادات الموقع والنصوص والشعار.
- `/admin/audit` سجل النشاط.

## API

- `GET /api/public/search?type=DOCTOR&q=...&governorateId=...&areaId=...&specialtyId=...`
- `POST /api/upload` رفع صورة للأدمن فقط، مع ضغط WebP عبر `sharp`.

## الاختبارات

```bash
npm test
```

يوجد اختبار لوظائف واتساب العراقية في `tests/unit/whatsapp.test.ts`.

## ملاحظات تنفيذ

- المصادقة تستخدم Auth.js Credentials مع JWT session.
- كلمات المرور مشفرة بـ bcrypt.
- الحذف المرتبط ببيانات يتحول إلى تعطيل آمن في المحافظات والمناطق والاختصاصات ومقدمي الخدمة.
- الواجهة العامة تعرض فقط `status=ACTIVE` والسجلات المرتبطة ببيانات نشطة.
- أرقام واتساب تحفظ بصيغة `9647xxxxxxxxx`.
- حقل إنستغرام يقبل رابطاً كاملاً أو handle مثل `@dr.name`.
- `robots.ts` و `sitemap.ts` موجودان للنسخة الإنتاجية.

## نشر مقترح

- Vercel + Neon/Supabase PostgreSQL للانطلاق السريع.
- VPS + Docker لاحقاً إذا احتجت تحكم كامل.
