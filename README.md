# 🚜 Uber for Tractors - Equipment Sharing Marketplace

A complete peer-to-peer marketplace platform connecting equipment owners with farmers who need short-term access to agricultural machinery. Built with NestJS, React Native, PostgreSQL, and modern cloud infrastructure.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributing](#contributing)

## 🎯 Overview

**Uber for Tractors** enables small farmers to rent expensive agricultural equipment (tractors, harvesters, drones, etc.) by the hour or day from nearby owners, making farming more affordable and equipment more profitable.

### Key Value Propositions

- **For Renters**: Access expensive equipment without large capital investment
- **For Owners**: Generate passive income from idle equipment
- **For Platform**: Commission-based revenue model (12% platform fee)

## ✨ Features

### Core Features (MVP)

- ✅ **User Management**
  - Multi-role support (Renter, Owner, Both, Admin)
  - Email/phone authentication with JWT
  - KYC verification with document upload
  - Trust score and rating system

- ✅ **Equipment Listings**
  - Create/edit equipment with photos and specifications
  - Location-based with PostGIS geospatial queries
  - Pricing: hourly and daily rates
  - Availability calendar management
  - Security deposit system

- ✅ **Search & Discovery**
  - Geospatial search (radius-based)
  - Filter by equipment type, price, availability
  - Map view with markers
  - Distance calculation

- ✅ **Booking System**
  - Request → Owner Approval → Payment → Active → Complete workflow
  - Calendar conflict prevention
  - Cancellation with refund logic
  - Booking history

- ✅ **Payments (Stripe Connect)**
  - Secure payment processing
  - Escrow for deposits
  - Marketplace payouts (commission split)
  - Refund management

- ✅ **Reviews & Ratings**
  - Post-rental reviews for both parties
  - Equipment and user ratings
  - Trust score calculation

- ✅ **Notifications**
  - Push notifications (Firebase)
  - Email notifications (SendGrid)
  - SMS notifications (Twilio)
  - In-app notifications

- ✅ **In-App Messaging**
  - Real-time chat between renter and owner
  - WebSocket support

- ✅ **Admin Dashboard**
  - User moderation
  - Equipment approval
  - Dispute resolution
  - Analytics and reporting

### Future Features (Post-MVP)

- 🔄 IoT Telematics integration (GPS tracking, usage monitoring)
- 🔄 Dynamic pricing based on demand
- 🔄 Insurance integration
- 🔄 Multi-language support
- 🔄 Advanced analytics and recommendations

## 🛠 Tech Stack

### Backend

- **Framework**: NestJS (Node.js/TypeScript)
- **Database**: PostgreSQL 15+ with PostGIS extension
- **Cache**: Redis 7+
- **ORM**: TypeORM
- **Authentication**: JWT, Passport.js
- **Payments**: Stripe Connect
- **File Storage**: AWS S3
- **Real-time**: Socket.io
- **Queue**: Bull (Redis-backed)
- **Validation**: class-validator, class-transformer

### Frontend (Mobile)

- **Framework**: React Native 0.73+
- **Navigation**: React Navigation 6
- **State Management**: Redux Toolkit
- **Maps**: React Native Maps, Google Maps API
- **UI**: React Native Paper, Custom components
- **HTTP Client**: Axios
- **Push Notifications**: Firebase Cloud Messaging

### Frontend (Admin Dashboard)

- **Framework**: Next.js 14 (App Router)
- **UI**: TailwindCSS, shadcn/ui
- **Charts**: Recharts
- **Data Fetching**: React Query

### Infrastructure

- **Cloud**: AWS (or GCP/Azure)
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes (EKS/GKE)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry, Prometheus, Grafana
- **CDN**: CloudFront

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer / CDN                     │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌────────▼─────────┐    ┌──────▼──────┐
│  Mobile Apps   │   │  Web Dashboard   │    │  API Gateway│
│ (React Native) │   │   (Next.js)      │    │   (Kong)    │
└────────────────┘   └──────────────────┘    └──────┬──────┘
                                                    │
                               ┌────────────────────┴────────────────────┐
                               │        Backend Services (NestJS)        │
                               ├─────────────────────────────────────────┤
                               │ • Auth          • Equipment             │
                               │ • Users         • Search                │
                               │ • Bookings      • Payments              │
                               │ • Notifications • Reviews               │
                               │ • Chat          • Admin                 │
                               └──────────────────┬──────────────────────┘
                                                  │
                   ┌──────────────────────────────┼──────────────────────────────┐
                   │                              │                              │
           ┌───────▼────────┐          ┌──────────▼──────────┐        ┌──────────▼────────┐
           │   PostgreSQL   │          │        Redis        │        │      AWS S3       │
           │   + PostGIS    │          │  Cache + Sessions   │        │  Photos/Documents │
           └────────────────┘          └─────────────────────┘        └───────────────────┘
                   │
           ┌───────▼────────┐
           │  Stripe API    │
           │   Payments     │
           └────────────────┘
```

### Database Schema Highlights

- **Users**: Multi-role with geospatial location
- **Equipment**: Full specifications with PostGIS location
- **Bookings**: Complete lifecycle tracking
- **Payments**: Stripe integration with marketplace splits
- **Reviews**: Bilateral rating system
- **Messages**: Real-time chat history

See `docs/database-schema.sql` for complete schema.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+ with PostGIS
- Redis 7+
- Docker & Docker Compose (recommended)
- Stripe account (for payments)
- AWS account (for S3)
- Google Maps API key

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-org/locafarm.git
cd locafarm
```

#### 2. Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run migrations
npm run migration:run

# Seed sample data
npm run seed

# Start development server
npm run start:dev
```

Backend will run at `http://localhost:3000`
API docs available at `http://localhost:3000/api/docs`

#### 3. Mobile App Setup

```bash
cd mobile
npm install

# Configure environment
cp .env.example .env
# Edit .env with API URL and keys

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

#### 4. Admin Dashboard Setup

```bash
cd web-admin
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

Dashboard will run at `http://localhost:3001`

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services:
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Admin Dashboard: http://localhost:3001

## 💻 Development

### Backend Development

```bash
cd backend

# Run in watch mode
npm run start:dev

# Run tests
npm test
npm run test:e2e

# Linting
npm run lint

# Generate migration
npm run migration:generate -- -n MigrationName

# Run specific migration
npm run migration:run
```

### Mobile Development

```bash
cd mobile

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test

# Type checking
npm run tsc
```

### Code Structure

```
backend/src/
├── modules/              # Feature modules
│   ├── auth/            # Authentication
│   ├── users/           # User management
│   ├── equipment/       # Equipment listings
│   ├── bookings/        # Booking system
│   └── payments/        # Payment processing
├── common/              # Shared code
│   ├── decorators/      # Custom decorators
│   ├── guards/          # Auth guards
│   ├── filters/         # Exception filters
│   └── interceptors/    # Response interceptors
└── config/              # Configuration

mobile/src/
├── screens/             # App screens
│   ├── auth/           # Login, signup
│   ├── renter/         # Renter flow
│   ├── owner/          # Owner flow
│   └── shared/         # Shared screens
├── components/          # Reusable components
├── navigation/          # Navigation setup
├── services/            # API services
├── store/              # Redux store
└── utils/              # Utilities
```


## 📚 API Documentation

### Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
```

### Equipment

```
GET    /api/equipment
POST   /api/equipment
GET    /api/equipment/:id
PATCH  /api/equipment/:id
DELETE /api/equipment/:id
POST   /api/equipment/:id/photos
```

### Search

```
GET /api/search?lat={lat}&lng={lng}&radius={km}&type={type}
GET /api/search/map?lat={lat}&lng={lng}
```

### Bookings

```
POST   /api/bookings
GET    /api/bookings/my-bookings
GET    /api/bookings/my-requests
PATCH  /api/bookings/:id/approve
PATCH  /api/bookings/:id/reject
PATCH  /api/bookings/:id/cancel
```

Full API documentation available at `/api/docs` (Swagger UI)

## 🧪 Testing

### Unit Tests

```bash
# Backend
cd backend
npm test

# Mobile
cd mobile
npm test
```

### Integration Tests

```bash
cd backend
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

## 📊 Monitoring & Analytics

### Application Monitoring (Sentry)

```typescript
// Configured in main.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

- **APM**: Prometheus + Grafana dashboards
- **Logs**: CloudWatch / ELK Stack
- **Metrics**: Custom metrics for booking funnel, payment success rate

## 🔒 Security

- HTTPS enforced in production
- JWT authentication with refresh tokens
- Rate limiting (100 requests/min per IP)
- Input validation with class-validator
- SQL injection protection (parameterized queries)
- XSS protection (helmet.js)
- CORS configured
- Secure file uploads with signed URLs
- PCI DSS compliance (Stripe)

## 📈 Performance Optimization

- Redis caching for hot equipment listings
- Database connection pooling
- CDN for static assets
- Image optimization and lazy loading
- Query optimization with indexes
- Horizontal scaling with Kubernetes

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Coding Standards

- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Test coverage > 80%

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



## 🙏 Acknowledgments

- Inspired by platforms like Hello Tractor and Turo
- Built with amazing open-source tools
- Special thanks to the farming community for feedback

---

**Made with ❤️ for farmers everywhere**