# 🎓 EduPathway — Premium Study Planner & Productivity Tracker

[![PWA Status](https://img.shields.io/badge/PWA-Installable-success.svg)](#7-progressive-web-app-pwa-offline-first)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)
[![Tech Stack](https://img.shields.io/badge/Tech-HTML%20%7C%20CSS%20%7C%20VanillaJS-orange.svg)](#technologies-used)
[![Deployment](https://img.shields.io/badge/Deploy-Netlify%20%2F%20Vercel-brightgreen.svg)](#deployment-steps-netlify--vercel)

**EduPathway (LearningTracker)** is a high-performance, modern, and recruiter-ready student productivity dashboard built strictly using **HTML5, CSS3 (with dynamic HSL dark-mode themes), Vanilla JavaScript, and LocalStorage**. 

Designed as a showcase of pure frontend engineering, this application packs advanced client-side capabilities including **real-time session-persistent timers, responsive glassmorphic interfaces, HTML5 drag-and-drop lists, and Progressive Web App (PWA) offline installation support**—all without relying on bloated libraries, bundlers, or heavy backends.

---

## 🌟 Key Upgraded Features

### 1. Advanced Analytics Dashboard & Charting
- **Productivity Graph**: Integrates **Chart.js** via CDN, querying actual completed tasks over the past 7 days to draw a gorgeous HSL-reactive weekly productivity curve.
- **Dynamic Metrics**: Calculates completion percentages (`(Completed / Total) * 100`), estimates total active focus hours aggregated across tasks/goals, and features a dynamic academic grade generator (A+, B, etc.) reacting to your progress.
- **Focus Streak Flame 🔥**: Implements a client-side algorithm that scans completed task timestamps, computes consecutive daily active study blocks, and displays a study flame counter.

### 2. Session-Persistent Pomodoro Timer ⏱️
- **Multi-Page Persistence**: Solves the common frontend issue of timers resetting on navigation. By calculating Unix timestamp deltas, focus sessions continue ticking accurately as you click between the Dashboard, Tasks, Goals, or Calendar.
- **Web Audio Alert Synthesizer**: Uses the browser's native **Web Audio API** to compile a premium synthetic dual-chime frequency alert on completion, removing any dependencies on external audio files.
- **State Modes**: Quick selectors for Deep Focus (25m) and Short Breaks (5m) complete with visual pulsing ticking animations.

### 3. Interactive Milestones & Goals Tracker 🎯
- **Granular Planning**: Allows setting long-term goals and adding comma-separated sub-milestones which render as interactive checkboxes on your goal cards.
- **Smart Form Syncing**: Modifying a goal's title or due date preserves the checked status of identical milestones, avoiding progress loss during updates.
- **Average Progress Aggregator**: Computes milestone percentages across all active goals to keep your aggregate achievements front and center.

### 4. Drag-and-Drop Task Board 📋
- **Manual Prioritization**: Uses the native **HTML5 Drag-and-Drop API** (`dragstart`, `dragover`, `dragend`) to let you physically grab tasks and re-order them based on urgency.
- **Active Search & Filters**: Live keyboard searching through titles and subject categories, combined with quick status tabs (Pending, In-Progress, Completed) and priority-level chips (High, Medium, Low).
- **Date Completes**: Marking tasks complete saves a `completedAt` ISO timestamp, driving the dashboard stats and streak multipliers.

### 5. Interactive Study Calendar 📅
- **Visual Mapping**: Highlights active deadlines and logs completed tasks/goals as visual event cards across a responsive monthly calendar.
- **Cell Details Modal**: Clicking any day cell launches a glassmorphic modal summarizing scheduled study items. Tasks can be directly checked off inside the modal, refreshing the calendar grid and dashboard in real-time.

### 6. Dynamic Theme Engine (Light / Dark Mode) 🌙
- **HSL CSS variables**: Transitions the entire application between beautiful Light and Dark themes with zero flash-of-unstyled-content (FOUC).
- **Responsive Navigation**: Sidebar hides on tablet and mobile viewports, shifting into a custom off-canvas navigation drawer with smooth CSS slide-out drawers.

### 7. Progressive Web App (PWA) Offline-First 📴
- **Standalone Launch**: Accompanied by a `manifest.json` launcher for native desktop and mobile home screen installation.
- **Caching Service Worker**: Registers a network-first, cache-fallback service worker (`sw.js`). When offline, the app loads instantly, reading and storing data locally, syncing seamlessly once connection resumes.
- **Isolated Multi-User Storage**: Prefixes all LocalStorage entries by active username, allowing multiple users to manage independent planners on the same browser session.

---

## 📂 Project Structure

Following production-ready practices, the project is structured modularly:

```
EduPathway/
│
├── index.html                  # Welcome Landing Page (checks sessions -> routes appropriately)
├── manifest.json               # PWA Install & Shell Launcher parameters
├── sw.js                       # Service Worker for offline page caching & assets registry
│
├── css/
│   ├── style.css               # Core Stylesheet (HSL Variables, Flex/Grid layouts, Animations)
│   └── components/
│       ├── pomodoro.css        # Specific visual layouts for the Pomodoro widget
│       └── toast.css           # Premium slide-in notifications
│
├── js/
│   ├── auth.js                 # Session protection, login/signup handlers, SW registration
│   ├── storage.js              # Multi-user LocalStorage isolation & streak calculation algorithm
│   ├── theme.js                # Theme toggling (data-theme switcher)
│   ├── toast.js                # Dynamic animated toast notification dispatcher
│   ├── quotes.js               # Random academic quote generator
│   ├── pomodoro.js             # Session-persistent Pomodoro timer logic
│   ├── dashboard.js            # Dashboard manager (Weekly analytics, Chart.js mapping)
│   ├── tasks.js                # Tasks CRUD, HTML5 Drag-and-Drop, filters, search
│   ├── goals.js                # Goals management, milestone checks, progress bars
│   └── calendar.js             # Calendar month grid, event markers, day details modal
│
└── assets/
    ├── branding/
    │   └── logo.png            # Main application logo
    └── icons/
        ├── icon-192.png        # PWA Icon (192x192)
        └── icon-512.png        # PWA Icon (512x512)
```

---

## 🛠️ Technologies Used
- **Language**: Vanilla ES6+ JavaScript
- **Markup & Layout**: HTML5, Semantic Markup
- **Styling**: CSS3 (variables, transitions, animations, flexbox, CSS grid)
- **Analytics**: Chart.js (CDN-delivered line graphing)
- **Persistence**: Web Storage API (LocalStorage)
- **Browser APIs**: Web Audio API (synthetic chimes), HTML5 Drag & Drop API, Service Worker API

---

## 🚀 Installation & Local Execution

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rahul-1675/EduPathway.git
   cd EduPathway
   ```

2. **Run locally using a lightweight server**:
   Since the project uses PWA Service Workers and standard relative imports, it is best served via a local HTTP server to avoid browser `file://` CORS restrictions:
   
   - **Using Python**:
     ```bash
     python -m http.server 8000
     ```
   - **Using Node (npx)**:
     ```bash
     npx http-server -p 8000
     ```
   - **Using VS Code**: 
     Click "Go Live" using the *Live Server* extension.

3. **Explore**:
   Open `http://localhost:8000` in your web browser.

---

## 🌐 Deployment Steps (Netlify / Vercel)

As a 100% frontend static project, EduPathway is fully compatible with instant hosting networks like **Netlify** or **Vercel**:

### Option A: Deploy with Netlify
1. Go to [Netlify](https://www.netlify.com/) and sign in.
2. Click **Add new site** -> **Import an existing project**.
3. Link your GitHub repository.
4. Set the **Build command** to: *None* (leave empty).
5. Set the **Publish directory** to: `.` (root directory containing `index.html`).
6. Click **Deploy Site**!

### Option B: Deploy with Vercel
1. Go to [Vercel](https://vercel.com/) and sign in.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Vercel will auto-detect a "Other/HTML" static project.
5. Leave the **Build and Output Settings** unmodified.
6. Click **Deploy**!

---

## 🤝 Contact & Portfolio

Created by **Rahul** — feel free to reach out for feedback, collaborations, or frontend developer opportunities.

- **GitHub**: [@rahul-1675](https://github.com/rahul-1675/)
- **Email**: bhavanamrahul16@gmail.com
- **LinkedIn**: [Rahul Bhavanam](https://linkedin.com/in/rahul-bhavanam) *(adjust to your link)*
