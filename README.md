# MD to PDF Converter - License Server

Automated license key generation and delivery for MD to PDF Converter.

When a customer purchases on Gumroad, this server automatically:
1. Generates a unique license key
2. Sends it to the customer's email

---

## How It Works

```
Customer purchases on Gumroad
           ↓
Gumroad sends webhook to this server
           ↓
Server generates license key
           ↓
Server sends key via email (Resend)
           ↓
Customer receives license key instantly
```

---

## Setup

### 1. Get Gmail App Password

Gmail requires an "App Password" for third-party apps like this.

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already enabled)
3. Go back to **Security**
4. Find **"App passwords"** (only appears if 2FA is on)
5. Select **Mail** and **Windows Computer** (or your device)
6. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

### 2. Deploy to Vercel

Since you have GitHub connected to Vercel:

1. **Initialize Git** (if not already):
   ```bash
   cd /home/jeswin/projects/md-to-pdf-license-server
   git init
   git add .
   git commit -m "Initial commit: License server"
   ```

2. **Create GitHub Repository**:
   ```bash
   # Create a new repo on GitHub named: md-to-pdf-license-server
   # Then push:
   git remote add origin https://github.com/YOUR_USERNAME/md-to-pdf-license-server.git
   git branch -M main
   git push -u origin main
   ```

3. **Import to Vercel**:
   - Go to https://vercel.com/dashboard
   - Click **"Add New"** → **"Project"**
   - Select your GitHub repo `md-to-pdf-license-server`
   - Click **"Import"**

4. **Add Environment Variables**:
   - In Vercel project, go to **Settings** → **Environment Variables**
   - Add two variables:
     - **Name**: `GMAIL_ADDRESS` | **Value**: `mdtopdf.app@gmail.com`
     - **Name**: `GMAIL_APP_PASSWORD` | **Value**: Your 16-char app password (e.g., `xxxx xxxx xxxx xxxx`)
     - **Environments**: Select all (Production, Preview, Development)
   - Click **"Save"**
   - Vercel will auto-redeploy

### 3. Configure Gumroad Webhook

Your webhook URL will be:
```
https://your-vercel-project-name.vercel.app/api/webhook
```

In Gumroad:
1. Go to your product → **Settings** → **Advanced**
2. Find **"Ping"** field
3. Enter your webhook URL
4. Save

---

## Project Structure

```
api/
  └── webhook.js       # Main webhook handler + license generation
package.json          # Dependencies
vercel.json          # Vercel configuration
.env.example         # Environment variables template
```

---

## License Key Format

Format: `MDPDF-XXXX-XXXX-XXXX-XXXX`

Example: `MDPDF-A7K2-M9P4-Q3X8-W5N1`

Keys are validated using a checksum algorithm (sum of charCode * position % 97 = 0).

---

## Testing

To test the webhook (after deployment):

```bash
curl -X POST https://md-to-pdf-licence.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@gmail.com",
    "full_name": "Test Customer",
    "product_name": "MD to PDF Converter",
    "sale_id": "test-123"
  }'
```

You should receive a license key email within seconds!

---

## Files

All downloads: https://github.com/Jeswin-arul-samuel/md_to_pdf_convertor/releases

Purchase license: https://jeswinarulsamuel.gumroad.com/l/ojiwme

---

## Support

Email: jeswin.arul.samuel@gmail.com
