# ROBO CITY — RoboVerse'26 Production Deployment Guide

This guide details the steps required to deploy the **ROBO CITY — RoboVerse'26** application to **Vercel** and connect the Supabase PostgreSQL backend and Google Form synchronization.

---

## 1. Prerequisites
- A [Vercel](https://vercel.com) account.
- A [Supabase](https://supabase.com) project with PostgreSQL.
- Access to the official Google Response Sheet (`ROBOVERSE'26 (Responses)`).

---

## 2. Supabase Database Preparation
Before deploying the frontend, ensure your Supabase database schema is up-to-date:

1. Open your **Supabase Dashboard** ➔ **SQL Editor**.
2. Run the migration scripts in [`supabase/migrations/`](file:///c:/Users/rauna/robo-city/supabase/migrations/) in order:
   - `001_initial_schema.sql` (Tables: `teams`, `team_members`, `scores`, `workshops`, `announcements`, RLS, Indexes)
   - `002_admin_auth.sql` (`admin_users` table & authorization guard)
   - `003_team_management.sql` (Atomic team creation/update RPCs)
   - `004_score_management.sql` (Atomic score validation RPC)
   - `005_registration.sql` (`registrations`, `registration_members`, `robots`, sequence)
   - `006_google_form_integration.sql` (Metadata columns, unique replay index, `sync_google_form_registration` RPC)
3. Under **Authentication** ➔ **Users**, create your primary admin account.
4. Add the admin's `user_id` into the `admin_users` table:
   ```sql
   INSERT INTO admin_users (user_id, email)
   VALUES ('<USER_UUID_FROM_AUTH_USERS>', 'admin@domain.com');
   ```

---

## 3. Vercel Project Setup & Git Connection

1. Push this repository to your GitHub/Git provider.
2. In the **Vercel Dashboard**, click **Add New...** ➔ **Project**.
3. Import your `robo-city` Git repository.
4. Configure Project Settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./`
   - **Build Command**: `next build` (Default)
   - **Output Directory**: `.next` (Default)

---

## 4. Required Environment Variables

In the Vercel Project Settings, navigate to **Settings** ➔ **Environment Variables** and add the following keys for **Production**, **Preview**, and **Development**:

| Variable Name | Environment | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | All | `https://xyzproject.supabase.co` | Your Supabase project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | `eyJhbGciOi...` | Supabase public Anon API key |
| `GOOGLE_FORM_WEBHOOK_SECRET` | Production | `your-strong-random-secret-here` | Shared secret for HMAC-SHA256 signature verification |

> [!CAUTION]
> - **DO NOT** prefix `GOOGLE_FORM_WEBHOOK_SECRET` with `NEXT_PUBLIC_`. It must remain strictly server-side.
> - **DO NOT** expose your Supabase `service_role` key in frontend code or environment variables.

---

## 5. Deploy to Production

1. Click **Deploy** in Vercel.
2. Once the build finishes, Vercel will assign a production domain (e.g., `https://robo-city.vercel.app`).
3. *(Optional)* To attach a custom domain:
   - Go to **Project Settings** ➔ **Domains**.
   - Add your domain (e.g., `robocity.ieeesbmmmut.org`) and configure the DNS records as instructed by Vercel.

---

## 6. Webhook Configuration (AFTER Deployment)

Once your production domain is live, your webhook URL will be:

```text
https://<YOUR_VERCEL_DOMAIN>/api/integrations/google-form
```
*(Example: `https://robo-city.vercel.app/api/integrations/google-form`)*

---

## 7. Google Apps Script Configuration (AFTER Deployment)

To connect the live **`ROBOVERSE'26 (Responses)`** Google Sheet to your production webhook:

1. Open the Google Sheet: **`ROBOVERSE'26 (Responses)`**.
2. Click **Extensions** ➔ **Apps Script**.
3. Replace all code in `Code.gs` with the contents of [`google-apps-script/Code.gs`](file:///c:/Users/rauna/robo-city/google-apps-script/Code.gs).
4. Click **⚙️ Project Settings** ➔ **Script Properties** and add:
   - `ROBO_WEBHOOK_URL`: `https://<YOUR_VERCEL_DOMAIN>/api/integrations/google-form`
   - `ROBO_WEBHOOK_SECRET`: The exact secret you configured in Vercel (`GOOGLE_FORM_WEBHOOK_SECRET`).
5. **Run One-Time Import for Existing Rows**:
   - In the Apps Script toolbar dropdown, select **`importExistingResponses`** and click **▶️ Run**.
   - Check the execution log to verify that existing responses are imported into Supabase PostgreSQL.
6. **Set Real-Time Trigger for Future Responses**:
   - In Apps Script, click **⏰ Triggers** ➔ **+ Add Trigger**.
   - Function: `onFormSubmit`
   - Event source: `From spreadsheet`
   - Event type: `On form submit`
   - Click **Save**.

---

## 8. Verification Checklist

- [ ] Production home page loads at `https://<YOUR_VERCEL_DOMAIN>`.
- [ ] Public `/leaderboard` displays live competition standings.
- [ ] Public `/register` renders crew registration form and links to the official Google Form.
- [ ] Admin login at `/admin/login` works with authorized admin credentials.
- [ ] Admin Score Control at `/admin/scores` successfully updates round scores.
- [ ] Realtime leaderboard updates automatically on score changes without full page reload.
- [ ] Test webhook payload using `testWebhookConnection` in Apps Script returns `200 OK`.
