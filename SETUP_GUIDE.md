# MediFi Phase 1 Setup Guide

## ✅ What's Been Implemented

### Backend (Week 1 - Basic File Upload/Download)
- ✅ MongoDB integration for HealthRecord model
- ✅ Records route updated to use MongoDB (GET, POST, PUT, DELETE)
- ✅ Upload route saves files to IPFS via Pinata and MongoDB
- ✅ Download endpoint redirects to IPFS gateway
- ✅ File upload using multer memory storage
- ✅ Proper error handling and validation

### Frontend (Week 1 - Basic File Upload/Download)
- ✅ API service utility (`lib/api.ts`)
- ✅ UploadRecord component with modal support
- ✅ RecordsList page with full CRUD operations
- ✅ View, Download, and Delete functionality
- ✅ Loading and error states

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies (if not already installed)
npm install

# Create .env file from example
cp env.example .env

# Edit .env and add your credentials:
# - MONGODB_URI (your MongoDB connection string)
# - PINATA_API_KEY (from https://app.pinata.cloud/)
# - PINATA_SECRET_KEY (from https://app.pinata.cloud/)

# Start the backend server
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend/medi-fi

# Install dependencies (including axios)
npm install

# Create .env.local file (optional, defaults to http://localhost:3001)
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Start the frontend
npm run dev
```

### 3. Test the Flow

1. Open http://localhost:3000/records
2. Click "Upload Record"
3. Fill in the form:
   - Record Name: e.g., "Blood Test - May 2025"
   - Record Type: e.g., "Lab Report"
   - Date: Select a date
   - File: Select a PDF/image file
4. Click "Upload Record"
5. Verify the record appears in the list
6. Test View, Download, and Delete buttons

## 📋 Environment Variables

### Backend (.env)
```
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/medifi
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here
PINATA_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
```

### Frontend (.env.local) - Optional
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🔍 Testing Checklist

### Backend Tests
- [ ] POST /api/upload - Upload file
- [ ] GET /api/records?ownerWallet=0x... - List all records
- [ ] GET /api/records/:id - Get single record
- [ ] GET /api/records/:id/download - Download file
- [ ] DELETE /api/records/:id - Delete record

### Frontend Tests
- [ ] Upload form uploads file successfully
- [ ] Records list shows uploaded files
- [ ] Can view file via IPFS link
- [ ] Can download file
- [ ] Can delete record

## 📝 Notes

1. **Temporary Wallet Address**: The frontend currently uses a hardcoded wallet address (`TEMP_OWNER_WALLET`). In production, this should come from authentication context.

2. **File Types**: Currently supports:
   - PDF (.pdf)
   - Images (.jpg, .jpeg, .png)
   - Documents (.doc, .docx)
   - Text (.txt)

3. **File Size Limit**: 50MB per file

4. **IPFS Storage**: Files are stored on IPFS via Pinata. Make sure you have valid Pinata API keys.

## 🐛 Troubleshooting

### "Failed to upload to IPFS"
- Check your Pinata API keys in `.env`
- Verify Pinata service is working: Check Pinata dashboard

### "MongoDB connection failed"
- Check your MongoDB URI in `.env`
- Make sure MongoDB is running (if local)
- Verify network access (if using MongoDB Atlas)

### "Cannot find module 'axios'"
- Run `npm install` in the frontend directory

### CORS errors
- Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Default is `http://localhost:3000`

## 🎯 Next Steps (Week 2-4)

- **Week 2**: Access Permissions System
- **Week 3**: File Encryption (AES-256 in browser)
- **Week 4**: Blockchain Integration (Smart Contracts)

## 📚 API Endpoints

### Upload File
```
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: File
- name: string
- type: string
- date: string
- ownerWallet: string
```

### Get Records
```
GET /api/records?ownerWallet=0x...
```

### Get Single Record
```
GET /api/records/:id
```

### Download File
```
GET /api/records/:id/download
(Redirects to IPFS gateway)
```

### Delete Record
```
DELETE /api/records/:id
```

