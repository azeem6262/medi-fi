# MediFi Backend API

Express + Node.js backend with Pinata IPFS integration for health record management.

## Features

- 📁 File upload to IPFS via Pinata
- 📋 Health records CRUD operations
- 🔐 Access grant management
- 👨‍⚕️ Provider/Doctor management
- 🔗 Blockchain-ready architecture

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

**Required Environment Variables:**
- `MONGODB_URI` - MongoDB connection string (default: mongodb://localhost:27017/medifi)
- `PINATA_API_KEY` - Get from [Pinata Dashboard](https://app.pinata.cloud/)
- `PINATA_SECRET_KEY` - Get from [Pinata Dashboard](https://app.pinata.cloud/)
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)

### 3. Set Up MongoDB

You can use either MongoDB locally or MongoDB Atlas (cloud):

**Local MongoDB:**
1. Install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB: `mongod` (or use MongoDB as a service on Windows)
3. The default connection string is already set in `.env`: `mongodb://localhost:27017/medifi`

**MongoDB Atlas (Cloud):**
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user and get your connection string
4. Replace `MONGODB_URI` in `.env` with your Atlas connection string

### 4. Get Pinata API Keys

1. Sign up at [Pinata](https://www.pinata.cloud/)
2. Go to API Keys section in dashboard
3. Create a new API key with `pinFileToIPFS` and `pinJSONToIPFS` permissions
4. Add the keys to your `.env` file

### 5. Run the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /health` - Check API status

### Records
- `GET /api/records?ownerWallet=<wallet>` - Get all records for a user
- `GET /api/records/:id` - Get a specific record
- `POST /api/records` - Create a new record (metadata only)
- `PUT /api/records/:id` - Update a record
- `DELETE /api/records/:id` - Delete a record

### Upload
- `POST /api/upload` - Upload file to IPFS and create record
  - Body: `multipart/form-data`
  - Fields: `file`, `name`, `type`, `date`, `ownerWallet`

### Access Grants
- `GET /api/access-grants` - Get access grants (supports `recordId`, `providerWallet`, `ownerWallet` query params)
- `GET /api/access-grants/:id` - Get a specific access grant
- `POST /api/access-grants` - Create a new access grant
- `PATCH /api/access-grants/:id/revoke` - Revoke an access grant
- `DELETE /api/access-grants/:id` - Delete an access grant

### Providers
- `GET /api/providers` - Get all providers (supports `walletAddress` query param)
- `GET /api/providers/:id` - Get a specific provider
- `POST /api/providers` - Create a new provider
- `PUT /api/providers/:id` - Update a provider
- `DELETE /api/providers/:id` - Delete a provider

## Example Requests

### Upload a Health Record

```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@/path/to/record.pdf" \
  -F "name=Blood Test Results" \
  -F "type=Lab Report" \
  -F "date=2025-10-12" \
  -F "ownerWallet=0x123..."
```

### Create Access Grant

```bash
curl -X POST http://localhost:3001/api/access-grants \
  -H "Content-Type: application/json" \
  -d '{
    "recordId": "rec_123",
    "providerWallet": "0xabc...",
    "providerName": "Dr. Khan",
    "expiresAt": "2025-12-31T23:59:59Z"
  }'
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration (database, etc.)
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic (Pinata, etc.)
│   ├── types/           # TypeScript type definitions
│   └── server.ts        # Express app entry point
├── dist/                # Compiled JavaScript (generated)
├── uploads/             # Temporary file storage (generated)
├── .env                 # Environment variables (not in git)
└── package.json
```

## Notes

- Uses MongoDB for persistent data storage.
- File uploads are temporarily stored locally, then uploaded to IPFS, then deleted.
- CORS is configured to allow requests from the frontend URL.
- All endpoints return JSON responses.

## Next Steps

1. ✅ Add database integration (MongoDB with Mongoose)
2. Add authentication middleware
3. Add rate limiting
4. Add request validation middleware
5. Add logging service
6. Integrate with smart contracts for on-chain access control
