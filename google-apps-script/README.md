# ROBO CITY — Google Form Response Sheet ➔ Supabase Sync Guide

This directory contains the Google Apps Script connecting the official **RoboVerse'26 Google Form** (`https://forms.gle/ac4YoLdKzPRNNqq88`) and its connected Google Sheet (`ROBOVERSE'26 (Responses)`) directly into the Robo City Supabase PostgreSQL database.

---

## 1. Google Sheet Confirmed Headers Mapping

The script dynamically matches and normalizes the confirmed headers from your response sheet:

| Google Sheet Header | Database Field | Description |
| :--- | :--- | :--- |
| `Timestamp` | `created_at` / `submitted_at` | Form submission time |
| `Email address` | `responder_email` | Google account responder email |
| `TEAM NAME` | `team_name` | Registered crew / team name |
| `COLLEGE NAME` | `college_name` | Participant college / institute |
| `TEAM SIZE` | `declared_team_size` | Team size declared by leader |
| `LEADER NAME` | `captain_name` | Team captain / leader name |
| `BRANCH` | `branch` | Academic department / branch |
| `Course` | `course` | Academic course (e.g. B.Tech) |
| `YEAR` | `year` | Academic year (1st, 2nd, 3rd, 4th) |
| `EMAIL ADDRESS` | `captain_email` | Direct leader contact email |
| `Member 2..5 Name/Email/Phone` | `registration_members` | Additional crew members (if present) |

---

## 2. Setup Instructions (Step-by-Step)

### Step A: Open Google Response Sheet
1. Open the Google Sheet linked to the Google Form: **`ROBOVERSE'26 (Responses)`**.
2. Click **Extensions** ➔ **Apps Script** in the top menu bar.
3. Rename the Apps Script project to **`RoboCity_FormSync`**.

### Step B: Paste the Script Code
1. In the Apps Script editor, open `Code.gs`.
2. Replace all existing code with the complete contents of [`google-apps-script/Code.gs`](file:///c:/Users/rauna/robo-city/google-apps-script/Code.gs).
3. Click the **💾 Save** icon (Ctrl + S).

### Step C: Configure Script Properties (Environment Variables)
1. In the left navigation menu of the Apps Script editor, click **⚙️ Project Settings** (gear icon).
2. Scroll down to the **Script Properties** section.
3. Click **Add script property** and configure the following keys:

| Property Name | Value | Description |
| :--- | :--- | :--- |
| `ROBO_WEBHOOK_URL` | `https://<YOUR_DEPLOYED_DOMAIN>/api/integrations/google-form` | Full URL to your website's webhook |
| `ROBO_WEBHOOK_SECRET` | `robo-verse-26-gform-secret` | Shared secret (matches `GOOGLE_FORM_WEBHOOK_SECRET` in `.env.local`) |

4. Click **Save script properties**.

---

## 3. One-Time Import for Existing Registrations

To import all existing registrations currently in your Google Sheet without re-registering:

1. In the Apps Script top toolbar, select the function **`importExistingResponses`** from the function dropdown.
2. Click **▶️ Run**.
3. When prompted, grant Google account permissions to allow `UrlFetchApp` and Spreadsheet access.
4. Check the **Execution log**:
   ```text
   ==========================================
          ROBO CITY IMPORT SUMMARY          
   ==========================================
   Total Processed Rows: 6
   Successfully Synchronized: 6
   Skipped Duplicates (Already Synced): 0
   Flagged For Admin Review: 0
   Failed: 0
   ==========================================
   ```
5. Return to the Google Sheet: Notice the `Sync Status`, `Robo City Reg ID` (e.g. `RBV-0001`), and `Synced At` columns are automatically populated!

> **Safety Guarantee**: Running `importExistingResponses` multiple times is completely idempotent. Existing rows will simply be recognized by their deterministic ID and marked as `SYNCED (EXISTING)` without creating duplicate records.

---

## 4. Setting Up Automatic Real-Time Sync (On Form Submit Trigger)

To automatically synchronize all future form submissions as soon as participants fill the Google Form:

1. In the left navigation menu of Apps Script, click **⏰ Triggers** (clock icon).
2. Click **+ Add Trigger** (bottom right button).
3. Set the following trigger configuration:
   - **Choose which function to run**: `onFormSubmit`
   - **Choose which deployment should run**: `Head`
   - **Select event source**: `From spreadsheet`
   - **Select event type**: `On form submit`
   - **Failure notification settings**: `Notify me immediately`
4. Click **Save**.

---

## 5. Helpful Utilities

- **`logSheetHeaders`**: Prints all columns detected in the sheet to the Execution Log.
- **`testWebhookConnection`**: Sends a dummy test payload to verify that your website endpoint and HMAC authentication are working.
