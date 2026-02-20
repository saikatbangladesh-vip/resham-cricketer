# 🏏 Resham Cricketer v2.0 - Official Site

Welcome to the **Official Site of the Resham Cricketer**, a premium dark-themed platform designed for sharing and discovering the best cricket highlights from around the world. Built with speed, aesthetics, and real-time interaction in mind.

## ✨ Key Features

### 🎨 Premium Design System
- **Modern Dark UI:** A sleek, deep navy/emerald green theme with glassmorphism effects.
- **Typography:** Sporty and bold headings using `Rajdhani` paired with clean `Inter` body text.
- **Animations:** Custom fade-in, scale-up, and pulse-glow animations for a dynamic feel.
- **Responsive Layout:** Optimized for desktop, tablet, and mobile with a floating navigation system.

### 🎥 Video Experience
- **Smart Video Player:** Supports direct video links and Google Drive embeds with auto-detection.
- **Real-time Stats:** Live view counts and likes using Firestore triggers.
- **Smart Search:** Instant, real-time filtering by player names, shot types, or uploader in the Explore section.
- **Clickable Descriptions:** Links in video descriptions are automatically converted into clickable, underlined shortcuts.

### 👤 Profile & Community
- **Personalized Dashboards:** User profiles with custom banners, stat badges (Uploads, Total Views, Followers), and bio.
- **Verification System:** A blue verified badge (`BadgeCheck`) appears automatically next to names after the first successful upload.
- **Flexible Profiles:** Edit your Display Name, @Username, and Profile Picture (using image links) directly from the profile modal.
- **Manage Clips:** A dedicated control panel for uploaders to edit or delete their highlights with live thumbnail previews.

### 🔔 Real-time Notifications
- **Global Alerts:** Everyone is instantly notified via `onSnapshot` when a new highlight is published.
- **Personalized Alerts:** Get notified instantly when someone likes one of your clips.
- **Read/Unread Tracking:** Smart notification indicators grouped by 'Today' and 'Earlier'.

---

## 🚀 Tech Stack

- **Frontend:** React 18 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Vanilla CSS (Glassmorphism)
- **Backend/Database:** Firebase (Auth, Firestore)
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Date Handling:** date-fns

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Firebase Project

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/resham-cricketer.git

# Navigate to the folder
cd resham-cricketer

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your Firebase configurations:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run Locally
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

---

## 📱 Screenshots
*(Add your screenshots here later)*

## 🤝 Contribution
Contributions are welcome! If you have suggestions for new features or shot categories, feel free to open an issue or create a pull request.

---

**Developed with ❤️ for the Cricket Community.**
