# TibNet Implementation Checklist

## Version 0

- [x] Next.js App Router scaffold.
- [x] TypeScript, Tailwind, RTL global styling.
- [x] Logo extracted from the source DOCX and placed in `public/assets/logo.png`.
- [x] Public layout, header, footer, cards, buttons, filters.

## Version 1

- [x] Auth.js credentials login.
- [x] Protected `/admin` layout.
- [x] Governorate, Area, Specialty models start empty after seed.
- [x] CRUD pages for governorates, areas, specialties.
- [x] AuditLog writes for admin mutations.

## Version 2

- [x] Provider model supports DOCTOR and DENTIST.
- [x] Provider admin CRUD.
- [x] Public `/doctors` and `/dentists` with filters.
- [x] Featured providers on homepage.
- [x] WhatsApp helper and links.

## Version 3

- [x] Provider details page.
- [x] Appointment request form.
- [x] Offers model, admin CRUD, and public page.
- [x] Instagram URL/handle support.

## Version 4

- [x] Pharmacy and Lab models.
- [x] Admin CRUD for pharmacies and labs.
- [x] Public pages with filters and empty/coming-soon states.
- [x] Settings page for hero text, logo URL, and social links.

## Version 5

- [x] README and `.env.example`.
- [x] Sitemap and robots.
- [x] Unit test for WhatsApp normalization.
- [ ] Run `npm install`, migrations, tests, and production build in an environment that permits external package execution.
