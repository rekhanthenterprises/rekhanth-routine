# Rekhanth Routine Tracker

A comprehensive React-based daily routine and goal tracking application designed for personal development and productivity. This app helps track daily schedules, monthly goals, and provides motivational content with PDF and email reporting capabilities.

## 🚀 Live Demo
**GitHub Pages:** https://rekhanthenterprises.github.io/rekhanth-routine/

## 📋 Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Code Explanation](#code-explanation)
- [Deployment](#deployment)
- [Contributing](#contributing)
n
## ✨ Features

### Core Functionality
- **Daily Routine Tracking**: Interactive checklist for 12 daily schedule blocks
- **Monthly Goals**: 8-month roadmap from May to December with specific targets
- **Progress Visualization**: Real-time completion percentages and progress bars
- **Weekly Reports**: Automated PDF generation with weekly progress summaries
- **Email Integration**: Send reports via EmailJS integration
- **Motivational Content**: Daily affirmations and weekly special activities
- **Data Persistence**: Local storage for completions and settings

### User Experience
- **Responsive Design**: Mobile-first approach with dark theme
- **Tabbed Interface**: Organized navigation between Daily, Monthly, Motivation, Report, and Settings
- **Visual Feedback**: Color-coded categories and completion states
- **Expandable Details**: Click to expand/collapse task details
- **Phase-Based Planning**: 3-phase system (Stabilize, Build, Execute)

## 🛠 Technologies Used

- **React 19.2.5**: Modern React with hooks and functional components
- **JavaScript ES6+**: Modern JavaScript features
- **jsPDF 4.2.1**: PDF generation library
- **EmailJS Browser 4.4.1**: Email service integration
- **CSS-in-JS**: Inline styling for component-specific styles
- **Local Storage API**: Client-side data persistence
- **Create React App**: Build tooling and development server

## 📁 Project Structure

```
rekhanth-routine/
├── public/
│   ├── index.html          # Main HTML template
│   ├── manifest.json       # PWA manifest
│   ├── favicon.ico         # App favicon
│   ├── logo192.png         # PWA icons
│   └── logo512.png
├── src/
│   ├── App.js              # Main application component
│   ├── App.css             # Component-specific styles (unused)
│   ├── index.js            # React app entry point
│   ├── index.css           # Global styles
│   └── reportWebVitals.js  # Performance monitoring
├── package.json            # Dependencies and scripts
├── README.md               # This documentation
└── build/                  # Production build output
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/rekhanthenterprises/rekhanth-routine.git
   cd rekhanth-routine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   - Opens http://localhost:3000 in browser
   - Hot reload enabled for development

4. **Build for production**
   ```bash
   npm run build
   ```

## 📖 Usage

### Daily Routine Tab
- View 12 scheduled blocks from 5:30 AM to 12:30 AM
- Check off completed tasks with interactive checkboxes
- Expand tasks to see detailed instructions
- Track daily completion percentage

### Monthly Goals Tab
- View 8-month roadmap (May-December)
- Current month highlighted with active goals
- Past months marked as completed
- Each month has 4-5 specific targets

### Motivation Tab
- Daily motivational quotes
- Weekly special activities for each day
- Relationship and career focus areas

### Report Tab
- Generate PDF reports with weekly progress
- Send reports via email (requires EmailJS setup)
- Includes schedule breakdown and completion stats

### Settings Tab
- Configure EmailJS for email functionality
- Save/load configuration from local storage
- Clear all app data option

## 🔍 Code Explanation

### Main Application (`src/App.js`)

#### Data Structures

**Phases Array** (Lines 4-9):
```javascript
const phases = [
  { id: 1, label: "Phase 1", period: "May–Jun", theme: "Stabilize", color: "#F97316", emoji: "🔥" },
  // ... defines 3 phases of the 8-month journey
];
```
- Defines the three main phases: Stabilize (May-Jun), Build (Jul-Sep), Execute (Oct-Dec)
- Each phase has color coding and emoji for visual distinction

**Schedule Array** (Lines 11-108):
```javascript
const schedule = [
  {
    time: "5:30 AM",
    duration: "5:30–5:45",
    title: "Wake Up Ritual",
    icon: "🌅",
    category: "mindset",
    detail: "No phone for first 10 min. Drink 500ml water...",
  },
  // ... 11 more schedule blocks
];
```
- 12 daily routine blocks from wake-up to sleep
- Each block includes time, duration, title, icon, category, and detailed instructions
- Categories: mindset, health, career, finance, work, relationship

**Categories Object** (Lines 110-117):
```javascript
const categories = {
  mindset: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "Mindset" },
  health: { color: "#22C55E", bg: "rgba(34,197,94,0.12)", label: "Health" },
  // ... color schemes for each category
};
```
- Color coding system for different life areas
- Background colors for completed tasks

**Monthly Goals Array** (Lines 119-136):
```javascript
const monthlyGoals = [
  {
    month: "May",
    goals: ["Get blood test done ✓", "Start applying to 5 jobs/day", ...],
    color: "#F97316"
  },
  // ... goals for each month May-December
];
```
- 8-month goal progression
- Each month has 4-5 specific, actionable goals
- Color-coded by month

#### State Management

**useState Hooks** (Lines 180-185):
```javascript
const [activeTab, setActiveTab] = useState("daily");
const [expanded, setExpanded] = useState(null);
const [completions, setCompletions] = useState({});
const [emailCfg, setEmailCfg] = useState({ svcId: "", tplId: "", pubKey: "", toEmail: "" });
const [emailStatus, setEmailStatus] = useState("idle");
const [pdfBusy, setPdfBusy] = useState(false);
```
- `activeTab`: Current tab (daily/monthly/motivation/report/settings)
- `expanded`: Which task detail is currently expanded
- `completions`: Object storing completion status by date
- `emailCfg`: EmailJS configuration settings
- `emailStatus`: Email sending status
- `pdfBusy`: PDF generation loading state

#### Utility Functions

**getTodayKey()** (Lines 165-167):
```javascript
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
```
- Returns today's date in YYYY-MM-DD format for data storage

**getWeekDates()** (Lines 169-177):
```javascript
function getWeekDates() {
  const today = new Date();
  const first = today.getDate() - today.getDay();
  const week = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), first + i);
    // ... creates week array with date keys
  }
  return week;
}
```
- Calculates current week's dates for weekly reporting

#### Data Persistence (Lines 187-194)

**useEffect for Loading Data**:
```javascript
useEffect(() => {
  try {
    const c = localStorage.getItem("rk_completions");
    if (c) setCompletions(JSON.parse(c));
    const e = localStorage.getItem("rk_email_cfg");
    if (e) setEmailCfg(JSON.parse(e));
  } catch (_) {}
}, []);
```
- Loads completion data and email config from localStorage on app start

**useEffect for Saving Data**:
```javascript
useEffect(() => {
  localStorage.setItem("rk_completions", JSON.stringify(completions));
}, [completions]);
```
- Automatically saves completion data to localStorage when state changes

#### Task Management

**toggleTask Function** (Lines 207-214):
```javascript
const toggleTask = (taskIndex) => {
  setCompletions((prev) => ({
    ...prev,
    [todayKey]: {
      ...(prev[todayKey] || {}),
      [taskIndex]: !((prev[todayKey] || {})[taskIndex] || false),
    },
  }));
};
```
- Toggles completion status for a specific task on today's date

#### Progress Calculations

**Today's Progress** (Lines 216-218):
```javascript
const todayCompletions = completions[todayKey] || {};
const todayDone = schedule.filter((_, idx) => todayCompletions[idx]).length;
const todayPercent = Math.round((todayDone / schedule.length) * 100);
```
- Calculates today's completion percentage

**Weekly Progress** (Lines 220-228):
```javascript
const weekDates = getWeekDates();
const weekStats = weekDates.map((d) => {
  const dayCompletions = completions[d.key] || {};
  const done = schedule.filter((_, idx) => dayCompletions[idx]).length;
  return {
    ...d,
    done,
    total: schedule.length,
    percent: Math.round((done / schedule.length) * 100),
  };
});
const weekAverage = Math.round(weekStats.reduce((sum, d) => sum + d.percent, 0) / 7);
```
- Calculates completion stats for each day of the current week

#### PDF Generation (`generatePDF` function, Lines 230-320)

**PDF Setup**:
```javascript
const doc = new jsPDF({ unit: "mm", format: "a4" });
const W = 210, MARGIN = 18;
```
- Creates A4 PDF document with 18mm margins

**Header Section**:
```javascript
doc.setFillColor(10, 10, 15);
doc.rect(0, 0, W, 297, "F");
doc.setFillColor(26, 5, 51);
doc.rect(0, 0, W, 42, "F");
// ... title and date text
```
- Dark background with purple header bar
- Title: "REKHANTH'S 8-MONTH ROADMAP TRACKER"

**Weekly Score Display**:
```javascript
doc.setFillColor(30, 15, 60);
doc.roundedRect(MARGIN, 48, W - MARGIN * 2, 24, 4, 4, "F");
// ... displays weekAverage percentage
```
- Rounded rectangle with weekly completion percentage

**Daily Breakdown**:
```javascript
let yPos = 91;
weekStats.forEach((dayData) => {
  // ... progress bar and percentage for each day
});
```
- Loops through each day of the week
- Shows day name, completion fraction, and visual progress bar

**Footer Message**:
```javascript
const footerMsg = weekAverage >= 80 ? "Exceptional week..." : /* conditional messages */;
doc.text(footerMsg, W / 2, yPos + 7, { align: "center" });
```
- Motivational message based on weekly performance

#### Email Integration (`handleEmail` function, Lines 322-346)

**EmailJS Setup Check**:
```javascript
if (!emailCfg.svcId || !emailCfg.tplId || !emailCfg.pubKey || !emailCfg.toEmail) {
  alert("Fill all 4 EmailJS fields in Settings first.");
  return;
}
```
- Validates all EmailJS configuration fields are present

**Email Content**:
```javascript
const weekBreakdown = weekStats.map((d) => `${d.day}: ${d.percent}% (${d.done}/${d.total})`).join("\n");
await emailjs.send(
  emailCfg.svcId,
  emailCfg.tplId,
  {
    to_email: emailCfg.toEmail,
    week_score: `${weekAverage}%`,
    day_breakdown: weekBreakdown,
    report_date: todayKey,
    month: currentMonth,
    goals: currentMonthlyGoal.goals.join("\n"),
  },
  emailCfg.pubKey
);
```
- Sends email with weekly stats, current month goals, and breakdown

### Component Structure

#### Header Section (Lines 348-378)
- Dark gradient background with phase indicators
- Current date and monthly goal status
- Responsive phase badges

#### Tab Navigation (Lines 380-401)
- 5 tabs: Daily, Monthly, Motivation, Report, Settings
- Active tab highlighting with purple color
- Mobile-responsive button layout

#### Daily Tab (Lines 403-520)
- Grid layout of 12 schedule blocks
- Each block: checkbox, time/duration, title, category badge
- Expandable details on click
- Progress cards: today's percentage, motivation, monthly goals

#### Monthly Tab (Lines 522-580)
- 8-month goal cards
- Current month highlighted
- Past months dimmed with checkmarks
- Goal lists with bullet points

#### Motivation Tab (Lines 582-620)
- Daily motivation quotes
- Weekly special activities
- Color-coded sections

#### Report Tab (Lines 622-680)
- PDF download button with loading state
- Email send button with status feedback
- Instructions for both features

#### Settings Tab (Lines 682-750)
- EmailJS configuration form
- 4 input fields: Service ID, Template ID, Public Key, Email
- Setup instructions with links
- Save and clear data buttons

### Styling Approach

The app uses **inline CSS-in-JS** for all styling:
- Consistent dark theme (#07080F background)
- Purple accent color (#A855F7) for active elements
- Responsive design with max-width containers
- Rounded corners and subtle borders
- Color-coded categories and phases

### Data Flow

1. **Initialization**: Load data from localStorage
2. **User Interaction**: Toggle tasks, switch tabs, generate reports
3. **State Updates**: Automatic localStorage persistence
4. **Report Generation**: PDF creation or email sending
5. **Persistence**: All changes saved automatically

## 🚀 Deployment

### GitHub Pages Deployment

The app is configured for GitHub Pages deployment:

**package.json Configuration**:
```json
{
  "homepage": "https://rekhanthenterprises.github.io/rekhanth-routine/",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

**Deployment Steps**:
1. Build the app: `npm run build`
2. Deploy to GitHub Pages: `npm run deploy`
3. App available at: https://rekhanthenterprises.github.io/rekhanth-routine/

### Manual Deployment

For other hosting platforms:
1. Run `npm run build`
2. Upload the `build/` folder contents to your web server
3. Ensure proper routing configuration for SPA

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit changes: `git commit -am 'Add feature'`
5. Push to branch: `git push origin feature-name`
6. Submit a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

## 👨‍💻 Author

**Rekhanth** - Personal development and productivity tracking application

---

*Built with React, deployed on GitHub Pages, focused on consistent daily execution and long-term goal achievement.*

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
