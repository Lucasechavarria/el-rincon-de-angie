# Setup Instructions - Platform Enhancements

## 📋 Prerequisites

- Python 3.8+ with pip
- Node.js 16+ with npm
- PostgreSQL database (Supabase recommended)
- Resend account for email service (or SendGrid as alternative)

## 🚀 Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

New dependencies installed:
- `pandas` - For analytics and CSV export
- `resend` - Email service

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

**Required new variables:**

```env
# Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=El Rincón de Angie

# Application Settings
APP_NAME=El Rincón de Angie
APP_URL=http://localhost:3000
ADMIN_EMAIL=admin@yourdomain.com

# Analytics
ANALYTICS_ENABLED=true

# Environment
ENVIRONMENT=development
```

### 3. Get Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your domain (or use their test domain for development)
4. Go to API Keys section
5. Create a new API key
6. Copy the key to your `.env` file

**Free tier includes:**
- 100 emails/day
- 3,000 emails/month
- Perfect for development and small projects

### 4. Test Email Service

Create a test script to verify email configuration:

```python
# test_email.py
from email_service import send_welcome_email

result = send_welcome_email("your-email@example.com", "Test User")
print(result)
```

Run:
```bash
python test_email.py
```

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

New dependencies installed:
- `@tanstack/react-query` - Data fetching and caching
- `react-helmet-async` - SEO meta tags
- `recharts` - Charts for admin dashboard
- `workbox-webpack-plugin` - PWA service worker
- `sharp` (dev) - Image processing for logo variants

### 2. Generate Logo Variants

```bash
cd frontend
node scripts/generate-icons.js
```

This will generate:
- `favicon-16.png`, `favicon-32.png`, `favicon-48.png`
- `logo-192.png`, `logo-512.png` (PWA icons)
- `apple-touch-icon.png` (iOS)
- `logo-og.png` (Open Graph for social sharing)

**Note:** You'll need to manually create `favicon.ico` using an online tool like [favicon.io](https://favicon.io/favicon-converter/)

### 3. Verify Installation

Check that all packages are installed:

```bash
npm list @tanstack/react-query react-helmet-async recharts sharp
```

## 🗄️ Database Setup

The new models will be created automatically when you start the backend (SQLModel handles this).

New tables that will be created:
- `userprofile` - User profile information
- `readingprogress` - Reading progress tracking
- `bookmark` - User bookmarks
- `category` - Book categories
- `bookcategory` - Book-Category relationship
- `analytics` - Analytics data
- `subscriber` - Newsletter subscribers
- `emaillog` - Email sending logs
- `emailtemplate` - Email templates
- `authorinfo` - Author information
- `timeline` - Publication timeline

## ✅ Verification Checklist

### Backend
- [ ] All Python packages installed (`pip list | grep -E "pandas|resend"`)
- [ ] `.env` file configured with Resend API key
- [ ] Email service test successful
- [ ] Backend starts without errors (`uvicorn main:app --reload`)

### Frontend
- [ ] All npm packages installed
- [ ] Logo variants generated in `public/` directory
- [ ] Frontend starts without errors (`npm start`)
- [ ] No console errors in browser

## 🔧 Troubleshooting

### Email Service Issues

**Problem:** "Invalid API key" error
- **Solution:** Verify your Resend API key in `.env` file
- Make sure there are no extra spaces or quotes

**Problem:** "Domain not verified" error
- **Solution:** In development, use Resend's test domain
- For production, verify your domain in Resend dashboard

### Frontend Build Issues

**Problem:** Sharp installation fails on Windows
- **Solution:** Install Visual Studio Build Tools
- Or use pre-built binaries: `npm install --platform=win32 --arch=x64 sharp`

**Problem:** "Cannot find module 'sharp'" when running generate-icons.js
- **Solution:** Make sure you're in the `frontend` directory
- Run `npm install sharp --save-dev` again

### Database Issues

**Problem:** New tables not created
- **Solution:** Delete `database.db` (if using SQLite) and restart backend
- For PostgreSQL, check connection string in `.env`

## 📚 Next Steps

After setup is complete:

1. **Start Backend:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Begin Implementation:**
   - Open `.kiro/specs/platform-enhancements/tasks.md`
   - Start with Task 2: Database Models and Migrations
   - Follow the task list sequentially

## 🆘 Need Help?

- Check the [design document](.kiro/specs/platform-enhancements/design.md) for architecture details
- Review [requirements](.kiro/specs/platform-enhancements/requirements.md) for feature specifications
- Consult the [tasks list](.kiro/specs/platform-enhancements/tasks.md) for implementation order

## 📝 Notes

- **Email Service:** Resend is recommended for its simplicity and generous free tier
- **Alternative:** If you prefer SendGrid, uncomment the SendGrid variables in `.env.example`
- **Redis:** Optional caching layer - only needed for high-traffic scenarios
- **Testing:** Email sending in development will use real emails (use test addresses)

---

**Setup completed!** You're ready to start implementing the platform enhancements. 🎉
