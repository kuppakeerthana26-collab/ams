# College Attendance Management System

Production-oriented AMS for colleges with a React mobile UI, Express API, MongoDB users/students, Google Sheets attendance storage, JWT authentication, and Official Meta WhatsApp absentee alerts.

## Folder Structure

```txt
ams/                    React + CSS frontend
server/
  server.js             API entrypoint
  src/
    app.js              Express app setup
    config/             env and database config
    controllers/        request handlers
    middleware/         auth, roles, validation, errors
    models/             Mongoose schemas
    routes/             API route modules
    services/           Google Sheets, WhatsApp, audit, retries
    utils/              token/date helpers
```

## Features

- Teacher/admin JWT login and role-based access.
- MongoDB teacher and student records.
- Mobile-friendly attendance register: `Roll No | Name | 1 | 2 | ... | 31`.
- One Google Sheet tab per class per month, for example `CSE_1_A_April_2026`.
- Duplicate submission prevention with date-level attendance lock.
- Automatic absentee detection and WhatsApp Business API notifications.
- Failed message logging and retry loop.
- Admin statistics, student search, absentee history, and CSV report download.
- Helmet, CORS, rate limiting, Zod validation, audit logs, and centralized errors.

## Local Setup

1. Install dependencies:

```bash
cd server && npm install
cd ../ams && npm install
```

2. Copy environment files:

```bash
cp server/.env.example server/.env
cp ams/.env.example ams/.env
```

3. Configure `server/.env`:

- `MONGO_URI`
- a long `JWT_SECRET`
- teacher/admin registration codes
- Google service account credentials
- Meta WhatsApp token and phone number ID

4. Run the backend:

```bash
cd server
npm run dev
```

5. Run the frontend:

```bash
cd ams
npm run dev
```

Open `http://localhost:5173`.

## Google Sheets Setup

1. Create a Google Cloud service account.
2. Enable Google Sheets API.
3. Create a spreadsheet for attendance.
4. Share that spreadsheet with the service account email as Editor.
5. Put the spreadsheet ID, service account email, and private key in `server/.env`.

## Meta WhatsApp Setup

Use the Official Meta WhatsApp Business API. Add:

- `META_WHATSAPP_TOKEN`
- `META_PHONE_NUMBER_ID`
- `META_WHATSAPP_API_VERSION`

Parent numbers should be stored in international format, for example `+919876543210`.

## API Summary

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/students`
- `POST /api/students` admin only
- `PUT /api/students/:id` admin only
- `GET /api/attendance/register`
- `POST /api/attendance/submit`
- `GET /api/admin/statistics` admin only
- `GET /api/admin/absentees` admin only
- `GET /api/admin/sheet` admin only
- `GET /api/admin/reports/download` admin only

## Ubuntu Deployment

```bash
sudo apt update
sudo apt install -y nginx git
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

Clone and configure:

```bash
git clone <your-repo-url> /var/www/college-ams
cd /var/www/college-ams/server
npm ci --omit=dev
cp .env.example .env
nano .env
pm2 start server.js --name college-ams-api
pm2 save
pm2 startup
```

Build frontend:

```bash
cd /var/www/college-ams/ams
npm ci
npm run build
```

Example Nginx site:

```nginx
server {
  server_name ams.yourcollege.edu;

  root /var/www/college-ams/ams/dist;
  index index.html;

  location / {
    try_files $uri /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:3000/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Enable HTTPS with Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ams.yourcollege.edu
```

## Production Notes

- Use MongoDB Atlas or a secured MongoDB instance with authentication enabled.
- Store `.env` outside version control and rotate credentials regularly.
- Use approved WhatsApp message templates if your college must message outside the 24-hour customer care window.
- Back up MongoDB; Google Sheets holds attendance records, MongoDB holds identities, locks, logs, and audit history.
