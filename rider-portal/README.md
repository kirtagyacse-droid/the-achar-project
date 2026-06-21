# RS Savoury Rider Portal

A secure, mobile-first rider operations portal for local Jaipur deliveries.

## Architecture & Security

### Separation
- Standalone Next.js app in `/rider-portal/` 
- Shares the main database but has isolated tables
- Deployed separately (can be on same server or different domain)

### Authentication
- **Hashed PIN-based auth** - riders login with phone + 4-digit PIN
- PINs hashed with bcryptjs (no plaintext storage)
- JWT access token (8h) + refresh token (7d) in HttpOnly SameSite=Strict cookies
- No hardcoded credentials

### Authorization  
- Middleware protects `/dashboard/*` and `/deliveries/*` routes
- All API endpoints receive `x-rider-id` header from middleware
- Database queries always filter by `riderId` - no direct object access

### Rate Limiting
- IP-based rate limiting on auth endpoints (5 attempts per 15 minutes)
- Applied via `@/lib/rateLimit` using shared `RateLimit` table

### Data Models
- `Rider`: phone, name, pinHash, locality
- `RiderAssignment`: links rider to order, status, COD, cluster
- `DeliveryOtp`: 4-digit OTP for delivery confirmation
- `DeliveryEvent`: audit trail (ASSIGNED, DELIVERED, FAILED)

## Setup

```bash
cd rider-portal
npm install
cp .env.example .env.local
# Configure with your DATABASE_URL and JWT_SECRET (same as main app)
npm run dev
```

## Create Rider

```bash
# Via script
npx tsx scripts/create-rider.ts 9876543210 "Rajesh Kumar" 1234 "Malviya Nagar"

# Or via Prisma Studio
npx prisma studio
```

## Assign Order to Rider (Admin API)

```bash
curl -X POST http://localhost:3001/api/admin/assign-order \
  -H "Authorization: Bearer $RIDER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"riderPhone": "9876543210", "orderId": "uuid-here"}'
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Shared PostgreSQL connection string |
| `JWT_SECRET` | Yes | Shared with main app for token signing |
| `RIDER_ADMIN_TOKEN` | Yes | Token for admin operations (order assignment) |

## Routes

- `/login` - PIN-based authentication
- `/dashboard` - Today's assignments, stats, clusters
- `/deliveries/[id]` - Delivery details, OTP flow, fail options

## Deferred Features

- Live GPS tracking (requires mobile app integration)
- SMS OTP delivery (currently logs OTP to console)
- Push notifications
- Offline mode