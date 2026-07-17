# Team Contact & Lead Management System

A premium, interactive contact capturing and lead distribution platform built for network marketing teams and organizational downlines. This system allows members to register, request to join or create team groups, capture visitor leads with automatic validation, distribute leads fairly using a Round-Robin algorithm, download leads as contact files (`.vcf`), and chat with a live AI Copilot to analyze team performance metrics.

---

## 🌟 Key Features

### 1. Lead Capture & Validation
- **Smart Phone Validation:** Automatically formats international phone numbers based on country dial codes.
- **Export to Contacts (VCF):** Downline users and administrators can export captured leads directly to `.vcf` format (vCards) for instant phone imports. Customize names with country suffixes (e.g., `John KE`).
- **Flexible Status Management:** Track lead status: `Seen` vs `Unseen`, and `Verified` vs `Unverified`.

### 2. Intelligent Lead Distribution
- **Round-Robin Assignment:** Distributes incoming leads to active members of a team group fairly. The algorithm automatically assigns the lead to the member who has not received a lead for the longest time.
- **Referrer Lookups:** Automatically resolves lead ownership via a direct referral code or phone number.

### 3. Team & Group Workspaces
- **Group Hierarchy:** Admins and qualified users can create team groups.
- **Approval Workflow:** Users can submit requests to join or create groups, requiring Super Admin approval.
- **Group Analytics:** Dynamic panels displaying lead capture graphs and member performance tables.

### 4. Gemini AI Copilot
- **Live Snapshot Context:** Interacts with a live database snapshot of all users, groups, and leads.
- **Natural Language Queries:** Downline metrics, user status, group size, and lead activity reports can be obtained by querying the chatbot directly.

### 5. Daily Motivation Chimes
- **Interactive Encouragement:** Displays AI-generated motivational quotes to encourage downline members, complete with a fallback list of high-impact industry quotes.

---

## 🛠️ Technology Stack

- **Frontend:** React + Vite SPA, Lucide React (Icons), Custom Responsive Dark UI System (CSS variables, glassmorphism, responsive grids).
- **Backend Server:** Node.js (`server.ts` powered by Express) serving the Vite SPA and dynamically routing Serverless/Edge-style Web API functions.
- **Database:** Supabase (PostgreSQL) with stored procedures.
- **AI Integration:** Google GenAI SDK (Gemini 3.5 Flash) for generating copilot responses and motivational quotes.

---

## 💾 Database Schema

The system uses a PostgreSQL database hosted on Supabase with the following table structures:

* **`users`**: Stores team members' authentication and roles (`can_create_group`, `can_register_members`, status: `active` or `suspended`).
* **`groups`**: Team group definitions created by users.
* **`group_members`**: Relationship mapping users to their active groups.
* **`group_requests`**: Approval-queue logs for group creation and join requests.
* **`leads`**: Captured contacts containing names, formatted telephone numbers, assigned referrers, and export/verification flags.

For complete database scripts and sequences, check out the [DATABASE_SETUP.md](file:///c:/Users/USER/Desktop/SOFTWARES/My%20current%20team%20contact%20system/DATABASE_SETUP.md) guide.

---

## 🚀 Setting Up the Application

### 1. Environment Configuration
Create a `.env` file in the root directory (based on `.env.example`) and fill in your Supabase credentials:

```ini
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SECRET_KEY=your-supabase-service-role-key
SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
SUPABASE_JWKS_URL=https://your-project-id.supabase.co/auth/v1/.well-known/jwks.json
GEMINI_API_KEY=your-google-ai-studio-api-key
```

### 2. Running Locally (Development Mode)
Run the following commands to install dependencies and start the Node.js hot-reloading development server:

```bash
# Install packages
npm install

# Start Vite + Express backend server
npm run dev
```

The system will be accessible at: **`http://localhost:3000`**

### 3. Production Deployment & Build
To build and package the production bundle:

```bash
# Build the React frontend SPA & bundle the server.ts
npm run build

# Start the Node.js production server
npm run start
```

---

## 🔑 Default Credentials

- **Super Admin Phone:** `254775499650` (or `0775499650`)
- **Password:** `admin123`

---

## 🔄 Detailed System Flow & Architecture

For a comprehensive layout of how lead registration validation, the dual-channel Tinder-swipe evaluation cycle, and admin impersonation/reset controls function, please refer to the detailed [SYSTEM_FLOW.md](file:///c:/Users/USER/Desktop/SOFTWARES/My%20current%20team%20contact%20system/SYSTEM_FLOW.md) guide.
