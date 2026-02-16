# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Backend API for an animal adoption platform (TFI - UTN Paraná). Multi-tenant architecture supporting multiple organizations/shelters with their own animals, admins, and adoption requests.

## Commands

```bash
npm run dev          # Start development server with nodemon
npm run build        # Generate Prisma client and push schema to DB
npm run db:push      # Push Prisma schema changes to database
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed initial data (organization + admin user)
npm run db:studio    # Open Prisma Studio GUI
npm run set-super-admin  # Promote user to super admin
```

## Architecture

### Folder Structure
```
src/
├── app.js              # Express app entry point, middleware setup, route mounting
├── config/             # External service configs (database, cloudinary, email, swagger)
├── middlewares/        # Auth verification, validators
├── routes/             # Route definitions (one per resource)
├── controllers/        # Request handlers (business logic)
├── services/           # Reusable services (email)
prisma/
├── schema.prisma       # Database models
├── seed.js             # Initial data seeder
```

### Database Models (Prisma/PostgreSQL)
- **Organizacion**: Multi-tenant root - shelters/rescue organizations
- **Administrador**: Users belonging to an organization (can be super_admin)
- **Animal**: Animals available for adoption, owned by organization
- **SolicitudAdopcion**: Adoption requests from potential adopters
- **SolicitudContacto**: Requests from rescuers wanting to join platform
- **CasoExito**: Success stories of adopted animals

### Key Relationships
- Organizacion → has many Administradores, Animales, CasosExito
- Administrador → belongs to Organizacion, can create Animales
- Animal → belongs to Organizacion and Administrador, has many SolicitudAdopcion
- SolicitudAdopcion → belongs to Animal

### Authentication Flow
- JWT-based authentication (24h expiration)
- Token sent via `Authorization: Bearer <token>` header
- Middleware `auth.middleware.js` verifies tokens and attaches user to request
- Super admins (`es_super_admin: true`) have cross-organization access

### API Response Format
All endpoints return consistent JSON structure:
```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

### Multi-Tenant Logic
- Regular admins can only access their organization's data
- Animals filtered by `organizacion_id` from authenticated admin
- Super admins bypass organization filters

### External Services
- **Cloudinary**: Image storage for animal photos
- **Nodemailer**: Email notifications for new adoption requests
- **Supabase**: PostgreSQL hosting in production

## Environment Variables

Required in `.env`:
```
DATABASE_URL          # PostgreSQL connection string
JWT_SECRET            # Secret for signing JWT tokens
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL  # For email notifications
FRONTEND_URL          # Allowed CORS origin
```

## API Endpoints

- `/api/auth/*` - Login/logout
- `/api/animals/*` - CRUD for animals (public GET, protected POST/PUT/PATCH/DELETE)
- `/api/adoption-requests/*` - Adoption forms (public POST, protected GET/PATCH)
- `/api/upload` - Image upload to Cloudinary (protected)
- `/api/dashboard/stats` - Admin dashboard statistics
- `/api/organization/*` - Organization profile management
- `/api/superadmin/*` - Super admin operations (contact requests, organizations)
- `/api/casos-exito/*` - Success stories

## Swagger Documentation

API docs available at `/api-docs` when server is running.
