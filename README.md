# NEU Library Visitor Portal

A modern, real-time visitor logging and management system for the New Era University Library.
live webiste link: https://neu-library-visitor-portal.vercel.app/

## 🚀 Features

### Visitor Portal (Landing Page)
- **Easy Logging**: Students, Faculty, and Employees can quickly log their library visits.
- **Validation**: Ensures only valid data is submitted, including college/department and reason for visit.
- **Real-time Block Check**: Prevents blocked users from logging visits instantly.
- **Warm Welcome**: Displays a friendly "Welcome to NEU Library!" message upon successful submission.

### Admin Portal
- **Secure Login**: Google Authentication restricted to authorized `@neu.edu.ph` administrators.
- **Live Dashboard**: Real-time view of all visitor logs with filtering and search capabilities.
- **Visitor Statistics**: Visual insights into library usage by role and college.
- **User Management**: 
  - View all unique visitors.
  - Block/Unblock specific email addresses to manage library access.
  - Custom confirmation modals for critical actions.
- **Export Data**: Ability to export visitor logs for reporting (CSV format).

## 🚀 Deployment to Vercel

To host your **NEU Library Visitor Portal** on Vercel:

1.  **Export your code**: Use the **Settings** menu in AI Studio to **Download as ZIP** or **Export to GitHub**.
2.  **Create a Vercel Project**: Go to [vercel.com](https://vercel.com/) and import your repository or upload the ZIP.
3.  **Configure Build Settings**:
    - **Framework Preset**: Vite
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
4.  **Add Environment Variables**: In your Vercel project settings, add any variables from your `.env` or `firebase-applet-config.json` if you're using them.
5.  **Authorize the Vercel Domain in Firebase**:
    - Go to your [Firebase Console](https://console.firebase.google.com/) > **Authentication** > **Settings** > **Authorized Domains**.
    - Add your new Vercel domain (e.g., `neu-library.vercel.app`). **This is required for Google Login to work.**

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Animations**: Motion (formerly Framer Motion)
- **Icons**: Lucide React
- **Backend/Database**: Firebase (Firestore & Authentication)
- **Real-time**: Firestore Snapshots

## 📋 Prerequisites

- Node.js (v18 or higher)
- Firebase Project with Firestore and Google Auth enabled.

## ⚙️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd neu-library-log
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Firebase**:
   Create a `src/firebase-applet-config.json` file with your Firebase credentials:
   ```json
   {
     "apiKey": "YOUR_API_KEY",
     "authDomain": "YOUR_AUTH_DOMAIN",
     "projectId": "YOUR_PROJECT_ID",
     "storageBucket": "YOUR_STORAGE_BUCKET",
     "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
     "appId": "YOUR_APP_ID",
     "firestoreDatabaseId": "(default)"
   }
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 🔒 Security Rules

The project uses Firestore Security Rules to ensure:
- Visitors can only create logs and check their own block status.
- Only authenticated administrators can read/write to the dashboard and management collections.
- Data integrity is maintained through strict field validation.

## 📄 License

This project is licensed under the Apache-2.0 License.
