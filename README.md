# Virtual Library

A Next.js application with MongoDB integration following industry-standard backend architecture.

## ✨ Features

- **Clean Architecture** - Separation of concerns with layered structure
- **Type-Safe** - Full TypeScript coverage
- **Scalable** - Easy to add new features
- **Production-Ready** - Following industry best practices
- **MongoDB Integration** - Singleton connection pattern
- **Health Check API** - Database monitoring endpoint

## 🏗️ Architecture

```
config/          → Configuration & constants
types/           → TypeScript type definitions
utils/           → Reusable helper functions
services/        → Business logic layer (FAT)
middleware/      → Request/response interceptors
lib/             → Infrastructure utilities
pages/api/       → API routes (THIN controllers)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
npm install
```

### Configuration

Create a `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017/virtual-library
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Meta Pixel Diagnostics

Meta Pixel browser events and Meta Conversions API calls can be written as JSONL records for debugging.

```env
# Enabled automatically in local development.
META_PIXEL_FILE_LOGGING_ENABLED=true
META_PIXEL_LOG_FILE=logs/meta-pixel.log
```

The default local file is `logs/meta-pixel.log`. Production logging is disabled unless `META_PIXEL_FILE_LOGGING_ENABLED=true` is set.

## 📡 API Endpoints

### Health Check
`GET /api/healthcheck` - Check database and system health

**Response (Healthy):**
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "name": "virtual-library"
  },
  "timestamp": "2025-12-24T19:30:00.000Z"
}
```

**Response (Unhealthy):**
```json
{
  "status": "unhealthy",
  "database": {
    "connected": false,
    "error": "Connection failed"
  },
  "timestamp": "2025-12-24T19:30:00.000Z"
}
```

## 🎯 Architecture Details

### Layer Responsibilities

1. **Config Layer** (`config/`) - Centralized configuration
2. **Types Layer** (`types/`) - TypeScript interfaces
3. **Utils Layer** (`utils/`) - Pure helper functions
4. **Services Layer** (`services/`) - Business logic ⭐
5. **Middleware Layer** (`middleware/`) - Auth, validation
6. **API Routes** (`pages/api/`) - HTTP handling only

### Key Principles

- ✅ **Thin Controllers** - API routes only handle HTTP
- ✅ **Fat Services** - Business logic in services layer
- ✅ **Single Responsibility** - Each file has one job
- ✅ **Dependency Injection** - Clear layer boundaries
- ✅ **Type Safety** - TypeScript throughout

## 📚 Documentation

- **BACKEND_STRUCTURE.md** - Complete architecture guide
- **RECOMMENDED_STRUCTURE.md** - Implementation details
- **IMPLEMENTATION_SUMMARY.md** - What was built

## 🛠️ Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Styling:** Tailwind CSS
- **Architecture:** Layered backend structure

## 📁 Project Structure

```
Virtual Library/
├── config/                  # Configuration
├── types/                   # TypeScript types
├── utils/                   # Helper functions
├── services/                # Business logic
├── middleware/              # Middleware
├── lib/                     # Infrastructure
├── pages/
│   ├── api/                # API routes
│   └── ...                 # Frontend pages
├── components/             # React components
├── styles/                 # CSS styles
└── public/                 # Static assets
```

## 🧪 Testing

```bash
# Test health check
curl http://localhost:3000/api/healthcheck
```

## 🎓 Adding New Features

Follow the established pattern:

```
1. Create types in types/
2. Add business logic in services/
3. Create thin API route in pages/api/
4. Use utils/ for helpers
5. Add middleware if needed
```

Example: Adding user management:
```
types/user.types.ts
services/user.service.ts
pages/api/users/index.ts
pages/api/users/[id].ts
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please follow the established architecture patterns.

---

**Built with industry best practices** 🚀
