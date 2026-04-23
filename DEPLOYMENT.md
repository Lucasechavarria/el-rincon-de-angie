# Deployment Guide - El Rincón de Angie

## 📦 Pre-Deployment Checklist

### Backend
- [ ] All environment variables configured in `.env`
- [ ] Database migrations tested
- [ ] Email service configured and tested
- [ ] Mercado Pago credentials verified (production keys)
- [ ] CORS configured for production domain
- [ ] SECRET_KEY changed from default
- [ ] Admin password changed from default

### Frontend
- [ ] API_URL configured for production
- [ ] Build tested locally (`npm run build`)
- [ ] All environment variables set
- [ ] PWA manifest configured
- [ ] Service worker tested

---

## 🚀 Deployment Options

### Option 1: Render (Backend) + Vercel (Frontend) - RECOMMENDED

#### Backend Deployment (Render.com)

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   ```
   Name: el-rincon-de-angie-api
   Environment: Python 3
   Build Command: pip install -r backend/requirements.txt
   Start Command: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

3. **Environment Variables**
   Add all variables from `.env.example`:
   - `DATABASE_URL` - Your Supabase PostgreSQL URL
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_KEY` - Your Supabase service role key
   - `MP_ACCESS_TOKEN` - Mercado Pago production token
   - `SECRET_KEY` - Generate new: `openssl rand -hex 32`
   - `FRONTEND_URL` - Your Vercel deployment URL
   - `EMAIL_SERVICE_API_KEY` - SendGrid/Resend API key
   - `EMAIL_FROM` - Your sender email
   - `AUTHOR_EMAIL` - Author's contact email

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL: `https://el-rincon-de-angie-api.onrender.com`

#### Frontend Deployment (Vercel)

1. **Create New Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository

2. **Configure Project**
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

3. **Environment Variables**
   ```
   VITE_API_URL=https://el-rincon-de-angie-api.onrender.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment
   - Your site: `https://el-rincon-de-angie.vercel.app`

5. **Configure Custom Domain** (Optional)
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

---

### Option 2: Railway (Full Stack)

1. **Create New Project**
   - Go to [Railway](https://railway.app/)
   - Click "New Project" → "Deploy from GitHub repo"

2. **Add Services**
   - Add PostgreSQL database
   - Add Backend service
   - Add Frontend service

3. **Configure Backend**
   ```
   Build Command: pip install -r backend/requirements.txt
   Start Command: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

4. **Configure Frontend**
   ```
   Build Command: cd frontend && npm install && npm run build
   Start Command: npx serve -s build -l $PORT
   ```

5. **Set Environment Variables** (same as Render option)

---

### Option 3: VPS (DigitalOcean/Linode)

#### Server Setup

1. **Create Droplet/Server**
   - Ubuntu 22.04 LTS
   - At least 2GB RAM
   - SSH access configured

2. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Python
   sudo apt install python3-pip python3-venv -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install Nginx
   sudo apt install nginx -y
   
   # Install Certbot (SSL)
   sudo apt install certbot python3-certbot-nginx -y
   ```

3. **Clone Repository**
   ```bash
   cd /var/www
   git clone https://github.com/your-repo/el-rincon-de-angie.git
   cd el-rincon-de-angie
   ```

4. **Setup Backend**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Copy and configure .env
   cp ../.env.example .env
   nano .env
   ```

5. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

6. **Configure Nginx**
   ```nginx
   # /etc/nginx/sites-available/elrincondeangie
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           root /var/www/el-rincon-de-angie/frontend/build;
           try_files $uri /index.html;
       }
       
       # Backend API
       location /api {
           rewrite ^/api(/.*)$ $1 break;
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

7. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/elrincondeangie /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Setup SSL**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

9. **Create Systemd Service for Backend**
   ```ini
   # /etc/systemd/system/elrincon-api.service
   [Unit]
   Description=El Rincon de Angie API
   After=network.target
   
   [Service]
   User=www-data
   WorkingDirectory=/var/www/el-rincon-de-angie/backend
   Environment="PATH=/var/www/el-rincon-de-angie/backend/venv/bin"
   ExecStart=/var/www/el-rincon-de-angie/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```

10. **Start Services**
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable elrincon-api
    sudo systemctl start elrincon-api
    sudo systemctl status elrincon-api
    ```

---

## 🔧 Post-Deployment Configuration

### 1. Database Setup

If using Supabase:
- Tables are created automatically on first run
- Verify all tables exist in Supabase dashboard
- Check RLS policies if needed

### 2. Mercado Pago Webhook

1. Go to [Mercado Pago Dashboard](https://www.mercadopago.com.ar/developers/panel)
2. Navigate to "Webhooks"
3. Add webhook URL: `https://your-domain.com/payments/webhook`
4. Select events: `payment`

### 3. Email Service

Configure SendGrid or Resend:
- Verify sender domain
- Test email sending
- Check spam score

### 4. Monitoring

- Set up error tracking (Sentry)
- Configure uptime monitoring (UptimeRobot)
- Enable application logs

---

## ✅ Verification Steps

1. **Test Authentication**
   - Register new user
   - Login
   - Access protected routes

2. **Test Book Upload**
   - Login as admin
   - Upload a book with cover
   - Verify preview generation

3. **Test Purchase Flow**
   - Browse books
   - View preview
   - Complete purchase (use Mercado Pago test cards)
   - Verify webhook processing
   - Download watermarked file

4. **Test Email Notifications**
   - Register user (welcome email)
   - Complete purchase (confirmation email)
   - Subscribe to newsletter

5. **Test PWA**
   - Open site on mobile
   - Install as app
   - Test offline mode

6. **Run Lighthouse Audit**
   ```bash
   npx lighthouse https://your-domain.com --view
   ```
   Target scores:
   - Performance: > 80
   - Accessibility: > 90
   - Best Practices: > 90
   - SEO: > 90
   - PWA: > 80

---

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Error**
```bash
# Check DATABASE_URL format
# PostgreSQL: postgresql://user:pass@host:port/db
# Verify Supabase connection pooler settings
```

**CORS Error**
```python
# Verify FRONTEND_URL in .env matches your deployment
# Check CORS middleware in main.py
```

**Webhook Not Receiving**
```bash
# Verify webhook URL is publicly accessible
# Check Mercado Pago dashboard webhook logs
# Test with ngrok for local development
```

### Frontend Issues

**API Calls Failing**
```bash
# Check VITE_API_URL environment variable
# Verify CORS configuration
# Check browser console for errors
```

**Build Errors**
```bash
# Clear cache: rm -rf node_modules package-lock.json
# Reinstall: npm install
# Try: npm run build --verbose
```

---

## 📊 Monitoring & Maintenance

### Daily
- Check error logs
- Monitor payment webhooks
- Verify email delivery

### Weekly
- Review analytics
- Check disk space
- Update dependencies (security patches)

### Monthly
- Full backup of database
- Review and rotate logs
- Performance optimization review

---

## 🔐 Security Best Practices

1. **Never commit `.env` files**
2. **Use strong SECRET_KEY** (32+ characters)
3. **Change default admin password**
4. **Enable HTTPS only**
5. **Keep dependencies updated**
6. **Monitor for security vulnerabilities**
7. **Regular database backups**
8. **Rate limiting on sensitive endpoints**

---

## 📞 Support

For deployment issues, check:
- Backend logs: `sudo journalctl -u elrincon-api -f`
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Application logs in Render/Vercel dashboard

---

**Last Updated:** December 2024
