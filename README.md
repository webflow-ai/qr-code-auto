# 🚗 Smart Vehicle & Driver QR Verification System

A production-ready, government-style vehicle verification system with QR code generation, AES-256 encryption, and Supabase authentication. **Now deployable on Vercel with serverless functions!**

---

## 📁 Project Structure

```
qr-vehicle-verification/
├── api/                        # Vercel Serverless Functions
│   ├── vehicles.js            # Vehicle CRUD operations
│   ├── verify.js              # Public verification endpoint
│   └── health.js              # Health check
│
├── backend/                    # Node.js + Express API (for local dev)
│   ├── controllers/
│   │   └── vehicleController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── vehicleRoutes.js
│   │   └── verifyRoutes.js
│   ├── utils/
│   │   └── encryption.js       # AES-256-CBC
│   ├── supabaseClient.js
│   ├── server.js
│   └── .env
│
├── frontend/                   # React + Vite + Tailwind CSS
│   └── src/
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── components/
│       │   └── ProtectedRoute.jsx
│       ├── lib/
│       │   └── supabase.js
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── VehicleDetailPage.jsx
│       │   ├── EditVehiclePage.jsx
│       │   └── VerifyPage.jsx  # Public (mobile-optimized)
│       ├── services/
│       │   └── api.js
│       └── App.jsx
│
├── vercel.json                 # Vercel configuration
├── DEPLOYMENT.md               # Detailed deployment guide
├── supabase_setup.sql          # DB + RLS setup
└── package.json                # Root dependencies
```

---

## ⚙️ Local Development Setup

### Step 1: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the entire `supabase_setup.sql` file
3. Go to **Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY` (frontend)
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (backend only)
4. Go to **Authentication → Settings** and enable Email/Password sign-in
5. Create an admin user: **Authentication → Users → Add User**

---

### Step 2: Install Dependencies

```bash
# Root dependencies
npm install

# Backend dependencies
cd backend && npm install && cd ..

# Frontend dependencies
cd frontend && npm install && cd ..
```

---

### Step 3: Configure Environment Variables

Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://endhqwjjkczxraoobeyy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ENCRYPTION_KEY=your-32-character-encryption-key!!
FRONTEND_URL=http://localhost:5173
PUBLIC_APP_URL=http://localhost:5173
```

Frontend (`frontend/.env`):
```env
VITE_SUPABASE_URL=https://endhqwjjkczxraoobeyy.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_z_AgUDYqZFFdV0jkRYk4uQ_BhV-JlNt
VITE_API_URL=http://localhost:5000
```

> ⚠️ `ENCRYPTION_KEY` must be exactly 32 characters for AES-256.

---

### Step 4: Run Development Servers

```bash
npm run dev
```

This starts:
- Backend API at `http://localhost:5000`
- Frontend at `http://localhost:5173`

---

## 🚀 Deploy to Vercel (Recommended)

### Quick Deploy

1. **Push to Git:**
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

2. **Import to Vercel:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your Git repository
   - Vercel auto-detects configuration from `vercel.json`

3. **Set Environment Variables:**

In Vercel dashboard → Settings → Environment Variables, add:

**Backend/API Variables:**
```
SUPABASE_URL=https://endhqwjjkczxraoobeyy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ENCRYPTION_KEY=your-32-character-encryption-key!!
```

**Frontend Variables:**
```
VITE_SUPABASE_URL=https://endhqwjjkczxraoobeyy.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_z_AgUDYqZFFdV0jkRYk4uQ_BhV-JlNt
VITE_API_URL=https://your-app.vercel.app
```

4. **Deploy!**
   - Click "Deploy"
   - After deployment, update `VITE_API_URL` with your actual Vercel URL
   - Redeploy

📖 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions**

---

## 🔗 Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Admin login |
| `/dashboard` | Admin | Vehicle list with search & pagination |
| `/dashboard/register` | Admin | Register new vehicle |
| `/dashboard/vehicle/:id` | Admin | View details + QR code |
| `/dashboard/vehicle/:id/edit` | Admin | Edit record |
| `/verify/:id` | **Public** | Mobile-optimized verification page |

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/vehicles` | ✅ Required | Create vehicle |
| GET | `/api/vehicles` | ✅ Required | List with search & pagination |
| GET | `/api/vehicles/:id` | ✅ Required | Get single vehicle |
| PUT | `/api/vehicles/:id` | ✅ Required | Update vehicle |
| DELETE | `/api/vehicles/:id` | ✅ Required | Soft delete (revoke) |
| GET | `/api/verify/:id` | ❌ Public | Public verification |
| GET | `/api/health` | ❌ Public | Health check |

---

## 🔒 Security Features

- **AES-256-CBC encryption** for all Aadhaar numbers
- **Supabase Row Level Security (RLS)** enabled
- **Service role key** only on backend — never in frontend
- **JWT token verification** on all admin routes
- **CORS protection** with proper headers
- **Input validation** with express-validator
- **Aadhaar masking** on all public-facing views (XXXX-XXXX-1234)
- **Soft delete** (status = 'revoked') instead of hard delete
- **Audit logging** for all operations

---

## 🎨 Features

- ✅ Professional mobile-optimized verification page
- ✅ Dark government-style admin UI with glassmorphism
- ✅ Admin login with Supabase Auth
- ✅ Vehicle + Driver registration form with validation
- ✅ AES-256 Aadhaar encryption
- ✅ QR code generation (download + print)
- ✅ Public verification page (mobile-friendly)
- ✅ Search by registration number / owner / chassis
- ✅ Pagination (10 records/page)
- ✅ Status management (active / expired / revoked)
- ✅ Audit log table
- ✅ Loading states and error UI
- ✅ Toast notifications
- ✅ Serverless deployment ready

---

## 📱 Mobile Verification Page

The public verification page (`/verify/:id`) is now optimized for mobile devices with:
- Clean card-based layout
- Government-style blue header
- Color-coded status badges
- Large, readable registration numbers
- Organized sections with icons
- Professional color scheme
- Responsive design

---

## 📝 Notes

- The `ENCRYPTION_KEY` must be the same across all deployments
- Store the encryption key securely (use environment variables)
- The public `/verify/:id` endpoint never returns raw Aadhaar — always masked
- Vercel serverless functions have a 10-second timeout (configurable)
- The backend folder is kept for local development

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router
- **Backend:** Vercel Serverless Functions (Node.js)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Authentication
- **Encryption:** Node.js Crypto (AES-256-CBC)
- **QR Codes:** qrcode library
- **Deployment:** Vercel

---

## 📄 License

MIT License - feel free to use for your projects!

---

## 🆘 Support

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review Vercel logs for debugging
- Check Supabase dashboard for database issues
