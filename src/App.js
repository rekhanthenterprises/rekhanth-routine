import { db } from "./firebase";
import { ref, set, onValue } from "firebase/database";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import emailjs from "@emailjs/browser";

const phases = [
  { id: 1, label: "Phase 1", period: "May–Jun", theme: "Stabilize", color: "#F97316", emoji: "🔥" },
  { id: 2, label: "Phase 2", period: "Jul–Sep", theme: "Build", color: "#22C55E", emoji: "⚡" },
  { id: 3, label: "Phase 3", period: "Oct–Dec", theme: "Execute", color: "#A855F7", emoji: "👑" },
];

const schedule = [
  {
    time: "5:30 AM",
    duration: "5:30–5:45",
    title: "Wake Up Ritual",
    icon: "🌅",
    category: "mindset",
    detail: "No phone for first 10 min. Drink 500ml water. Take B12 + Vitamin D supplement. Do 10 deep belly breaths at window.",
  },
  {
    time: "5:45 AM",
    duration: "5:45–6:00",
    title: "Manifestation Block",
    icon: "🧘",
    category: "mindset",
    detail: "Sit quietly. Close eyes. Visualize: you in a stable job (₹80k salary), Nagasoundarya beside you, wedding done, parents proud, loans shrinking. Say 3 affirmations aloud:\n\"I am building the life I deserve.\"\n\"I attract opportunities that match my skills.\"\n\"I am enough, and I am growing.\"\nWrite 3 intentions for the day in a small notebook.",
  },
  {
    time: "6:00 AM",
    duration: "6:00–7:30",
    title: "Gym / Workout",
    icon: "💪",
    category: "health",
    detail: "Go with Nagasoundarya. Follow your couples split plan:\nMon: Legs | Tue: Pull | Wed: Push | Thu: Shoulders+Core | Fri: Full Body | Sat: Cardio | Sun: Rest\nWorkout fuels energy for your long day. This is non-negotiable — a healthy body = a sharp mind.",
  },
  {
    time: "7:30 AM",
    duration: "7:30–8:15",
    title: "Morning Hygiene + Breakfast",
    icon: "🍳",
    category: "health",
    detail: "Shower, freshen up. Eat a high-protein breakfast — 3 eggs + oats or rice + dal.\nIf Sunday batch cook is done, just reheat. This fuels your brain for the study block ahead.\nNo skipping breakfast — your energy levels depend on this.",
  },
  {
    time: "8:15 AM",
    duration: "8:15–9:00",
    title: "Job Switch Prep",
    icon: "💼",
    category: "career",
    detail: "Phase 1 (May–Jun): Resume polish, 5 applications/day on Naukri + LinkedIn. Reach out to 2 connections.\nPhase 2 (Jul–Sep): Interview prep — DSA 30 min, System Design 30 min alternating.\nPhase 3 (Oct–Dec): Salary negotiation prep, offer evaluation, or onboarding if switched.",
  },
  {
    time: "9:00 AM",
    duration: "9:00–11:30",
    title: "Deep Skill Building",
    icon: "🧠",
    category: "career",
    detail: "Phase 1: .NET Clean Architecture + CQRS + MediatR — build portfolio projects.\nPhase 2: Azure AZ-204 modules + Angular 17+ components — hands-on only.\nPhase 3: System Design mastery + mock interviews.\nUse Pomodoro: 50 min study → 10 min break. No social media during this block.",
  },
  {
    time: "11:30 AM",
    duration: "11:30–12:30",
    title: "Finance + Life Admin",
    icon: "📊",
    category: "finance",
    detail: "Phase 1: Track every rupee spent yesterday. Update expense sheet. Check loan EMI dates.\nPhase 2: Track savings growth toward marriage fund. Review investment portfolio.\nPhase 3: Wedding vendor research, cost finalization, family communication.\n15 min lunch prep if needed.",
  },
  {
    time: "12:30 PM",
    duration: "12:30–1:00",
    title: "Lunch + Wind Down Before Work",
    icon: "🍱",
    category: "health",
    detail: "Eat a proper lunch — rice, dal, sabzi (batch cooked). No heavy processed food.\nSpend 10 min with Nagasoundarya if she's home — talk, laugh, connect. This is relationship maintenance.\nChange to work mode mentally. Light stretching if back is tight.",
  },
  {
    time: "1:00 PM",
    duration: "1:00–11:00 PM",
    title: "TCS Work Block",
    icon: "💻",
    category: "work",
    detail: "Work your shift. Give 80% effort — you're leaving within months but don't burn bridges.\nDuring slow periods (not lunch, not meetings): revise notes, read 1 article on .NET/Azure.\nKeep a 'wins log' — every task you resolve well, note it for your resume achievements.\nStay professional with your manager — get a good reference letter before exit.",
  },
  {
    time: "11:00 PM",
    duration: "11:00–11:20",
    title: "Evening Walk + Decompression",
    icon: "🌙",
    category: "health",
    detail: "10–15 min light walk outside. No screens. Let the work day go.\nThis prevents you from carrying work stress into your sleep and personal time.\nIf Nagasoundarya is awake, walk together — it becomes couple time automatically.",
  },
  {
    time: "11:20 PM",
    duration: "11:20–11:50",
    title: "Relationship & Family Check-In",
    icon: "❤️",
    category: "relationship",
    detail: "30 min protected time for Nagasoundarya — talk, share your day, listen to hers.\nNo finance stress talk daily — make it 3x/week max. Other days: just connect as humans.\nCall home (parents) every 2–3 days. Keep it warm, not guilt-heavy.\nDo NOT discuss your brother's issues on these calls unless necessary.",
  },
  {
    time: "11:50 PM",
    duration: "11:50–12:20 AM",
    title: "Night Reflection + Planning",
    icon: "📓",
    category: "mindset",
    detail: "Open your notebook. Write:\n1. One thing I did well .\n2. One thing I'll improve tomorrow.\n3. Progress on marriage fund: ₹___\n4. Applications sent : ___\nThis keeps you moving and out of anxiety spirals.\nSet tomorrow's 3 priorities before closing the book.",
  },
  {
    time: "12:20 AM",
    duration: "12:20–12:30",
    title: "Sleep Preparation",
    icon: "😴",
    category: "health",
    detail: "Phone on DND. No reels/scrolling — this is what's stealing your sleep quality.\nIf anxious, do 4-7-8 breathing: inhale 4 sec, hold 7 sec, exhale 8 sec. Repeat 4 times.\nTarget: asleep by 12:30 AM. Wake up at 5:30 AM = 5 hrs sleep minimum.\n(Sunday: sleep extra 1 hr — wake at 6:30 AM. Body recovery matters.)",
  },
];

const weeklyBlocks = [
  { day: "Sunday", special: "Batch cook 2 hrs with Nagasoundarya. Deep portfolio work. Family call. No gym — full rest. Review week's finances and savings.", emoji: "☀️" },
  { day: "Monday", special: "Heavy leg day. Start week with discipline. Send minimum 5 job applications.", emoji: "💪" },
  { day: "Tuesday", special: "Pull day. LinkedIn networking — 2 connection requests with note.", emoji: "🔗" },
  { day: "Wednesday", special: "Push day. Mid-week check-in with Nagasoundarya on marriage fund progress.", emoji: "💍" },
  { day: "Thursday", special: "Shoulders + Core. Review your expense tracker. No unnecessary spending check.", emoji: "📊" },
  { day: "Friday", special: "Full body. End of week job application push. Apply to 7+ .", emoji: "🚀" },
  { day: "Saturday", special: "Cardio only. Date activity with Nagasoundarya — temple visit, park, chai walk. Keep relationship alive.", emoji: "❤️" },
];

const monthlyGoals = [
  { month: "May", goals: ["Get blood test done ✓", "Start applying to 5 jobs/day", "Begin .NET portfolio repo", "Track expenses daily", "Open marriage fund savings account"], color: "#F97316" },
  { month: "Jun", goals: ["First interview calls", "₹50k saved toward fund", "Finish 1 portfolio project", "Loan interest rates noted", "Brother: boundary set gently"], color: "#EF4444" },
  { month: "Jul", goals: ["Job offer received or close", "₹1L in marriage fund", "Azure AZ-204 50% done", "Bike research done", "Parents informally told of plan"], color: "#F59E0B" },
  { month: "Aug", goals: ["Job switch executed", "Salary jump to ₹75k+", "₹1.8L in marriage fund", "Bike purchase if possible", "Engagement plan discussed"], color: "#22C55E" },
  { month: "Sep", goals: ["₹2.5L in marriage fund", "Azure cert exam booked", "Wedding venue shortlisted", "Both families meeting planned", "Loan review post salary jump"], color: "#06B6D4" },
  { month: "Oct", goals: ["₹3.5L in marriage fund", "Families officially met", "Temple marriage date fixed", "Reception venue booked", "Nagasoundarya's loans EMI stable"], color: "#3B82F6" },
  { month: "Nov", goals: ["₹5L in marriage fund", "All vendors finalized", "Invitation list ready", "Outfit bought simple", "Legal/registration prep done"], color: "#8B5CF6" },
  { month: "Dec", goals: ["MARRIED ✓", "₹7L total spent max", "Both families together", "New chapter begins", "80% goals achieved 🎉"], color: "#A855F7" },
];

const categories = {
  mindset: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "Mindset" },
  health: { color: "#22C55E", bg: "rgba(34,197,94,0.12)", label: "Health" },
  career: { color: "#3B82F6", bg: "rgba(59,130,246,0.12)", label: "Career" },
  finance: { color: "#A855F7", bg: "rgba(168,85,247,0.12)", label: "Finance" },
  work: { color: "#F97316", bg: "rgba(249,115,22,0.12)", label: "Work" },
  relationship: { color: "#EC4899", bg: "rgba(236,72,153,0.12)", label: "Relationship" },
};
const MONTHLY_GOALS = [
  { month: "May",  color: "#F97316", goals: [
    "Get blood test done — B12, Vit D, Sugar, Thyroid",
    "Start applying to 5 jobs/day on Naukri + LinkedIn",
    "Begin .NET Clean Architecture portfolio repo on GitHub",
    "Track every expense daily in a sheet",
    "Open separate savings account — label it Marriage Fund",
  ]},
  { month: "Jun",  color: "#EF4444", goals: [
    "First interview calls received",
    "₹50,000 saved toward marriage fund",
    "Finish 1 complete portfolio project with README",
    "Note exact interest rates of all active loans",
    "Set a gentle boundary with brother — not your financial load",
  ]},
  { month: "Jul",  color: "#F59E0B", goals: [
    "Job offer received or final interview stage",
    "₹1,00,000 in marriage fund",
    "Azure AZ-204 — 50% modules completed",
    "Bike research done — shortlist 2 second-hand options",
    "Parents informally told about marriage plan",
  ]},
  { month: "Aug",  color: "#22C55E", goals: [
    "Job switch executed — salary ₹75,000+",
    "₹1,80,000 in marriage fund",
    "Azure certification exam booked",
    "Bike purchased or payment planned",
    "Engagement plan discussed with Nagasoundarya",
  ]},
  { month: "Sep",  color: "#06B6D4", goals: [
    "₹2,50,000 in marriage fund",
    "Azure AZ-204 exam cleared",
    "Wedding venue/temple shortlisted",
    "Both families meeting planned",
    "Loan EMI review done post salary jump",
  ]},
  { month: "Oct",  color: "#3B82F6", goals: [
    "₹3,50,000 in marriage fund",
    "Both families officially met",
    "Temple marriage date fixed",
    "Reception venue in Bangalore booked",
    "Nagasoundarya's loan EMIs — zero defaults confirmed",
  ]},
  { month: "Nov",  color: "#8B5CF6", goals: [
    "₹5,00,000 in marriage fund",
    "All wedding vendors finalized",
    "Invitation list ready",
    "Outfits purchased — simple and meaningful",
    "Legal registration prep done",
  ]},
  { month: "Dec",  color: "#A855F7", goals: [
    "MARRIED ✓",
    "Total wedding spend under ₹7,00,000",
    "Both families together and happy",
    "New chapter officially started",
    "80% of all 8-month goals achieved 🎉",
  ]},
];

const motivations = [
  "Show up consistently. Progress is built through repetition.",
  "Small wins  compound into the life you want.",
  "Stay calm, stay disciplined, and remember why you started.",
  "Each completed block is a step closer to your goal.",
];

const tabs = [
  { id: "daily", label: "Daily" },
  { id: "monthly", label: "Monthly" },
  { id: "goals", label: "Goals" },
  { id: "motivation", label: "Motivation" },
  { id: "report", label: "Report" },
  { id: "settings", label: "Settings" },
];

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekDates() {
  const now = new Date();
  const first = now.getDate() - now.getDay();
  const week = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), first + i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    week.push({ date, key, day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()] });
  }
  return week;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("daily");
  const [goalCompletions, setGoalCompletions] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [completions, setCompletions] = useState({});
  const [emailCfg, setEmailCfg] = useState({ svcId: "", tplId: "", pubKey: "", toEmail: "" });
  const [emailStatus, setEmailStatus] = useState("idle");
  const [pdfBusy, setPdfBusy] = useState(false);

  // Load from Firebase on startup
  useEffect(() => {
  // existing completions listener
  const completionsRef = ref(db, "completions");
  onValue(completionsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) setCompletions(data);
  });

  // ADD THIS — load goals from Firebase
  const goalsRef = ref(db, "goalCompletions");
  onValue(goalsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) setGoalCompletions(data);
  });

  try {
    const e = localStorage.getItem("rk_email_cfg");
    if (e) setEmailCfg(JSON.parse(e));
  } catch (_) {}
}, []);

  // Save to Firebase on every change
  useEffect(() => {
    if (Object.keys(completions).length === 0) return;
    set(ref(db, "completions"), completions);
  }, [completions]);

  const now = new Date();
  const Key = getKey();
  const Label = `${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  const currentMonth = monthNames[now.getMonth()];
  const currentMonthlyGoal = monthlyGoals.find((item) => item.month === currentMonth) || monthlyGoals[0];

  const toggleGoal = (monthKey, goalIdx) => {
  const key = `${monthKey}-${goalIdx}`;
  setGoalCompletions(p => ({ ...p, [key]: !p[key] }));
};

const getMonthScore = (monthKey, totalGoals) => {
  const done = Array.from({ length: totalGoals }, (_, i) =>
    goalCompletions[`${monthKey}-${i}`]
  ).filter(Boolean).length;
  return { done, total: totalGoals, pct: Math.round((done / totalGoals) * 100) };
};

  const toggleTask = (taskIndex) => {
    setCompletions((prev) => ({
      ...prev,
      [Key]: {
        ...(prev[Key] || {}),
        [taskIndex]: !((prev[Key] || {})[taskIndex] || false),
      },
    }));
  };

  const Completions = completions[Key] || {};
  const Done = schedule.filter((_, idx) => Completions[idx]).length;
  const Percent = Math.round((Done / schedule.length) * 100);

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

  const generatePDF = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210, MARGIN = 18;

    doc.setFillColor(10, 10, 15);
    doc.rect(0, 0, W, 297, "F");

    doc.setFillColor(26, 5, 51);
    doc.rect(0, 0, W, 42, "F");

    doc.setTextColor(168, 85, 247);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("REKHANTH'S 8-MONTH ROADMAP TRACKER", W / 2, 12, { align: "center" });

    doc.setTextColor(232, 232, 240);
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.text("Weekly Progress Report", W / 2, 24, { align: "center" });

    doc.setTextColor(140, 140, 160);
    doc.setFontSize(9);
    const weekStart = weekStats[0];
    const weekLabel = `Week of ${weekStart.day}`;
    doc.text(weekLabel, W / 2, 33, { align: "center" });

    // Weekly score
    doc.setFillColor(30, 15, 60);
    doc.roundedRect(MARGIN, 48, W - MARGIN * 2, 24, 4, 4, "F");
    doc.setDrawColor(168, 85, 247);
    doc.setLineWidth(0.5);
    doc.roundedRect(MARGIN, 48, W - MARGIN * 2, 24, 4, 4, "D");

    doc.setTextColor(168, 85, 247);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text(String(weekAverage), W / 2, 64, { align: "center" });

    doc.setTextColor(140, 140, 160);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("WEEKLY COMPLETION SCORE (%)", W / 2, 71, { align: "center" });

    // Daily breakdown
    doc.setTextColor(232, 232, 240);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Daily Breakdown", MARGIN, 85);

    let yPos = 91;
    weekStats.forEach((dayData) => {
      doc.setFillColor(18, 18, 28);
      doc.roundedRect(MARGIN, yPos, W - MARGIN * 2, 12, 2, 2, "F");

      doc.setTextColor(200, 200, 220);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(String(dayData.day), MARGIN + 5, yPos + 7);
      doc.text(String(dayData.done) + "/" + String(dayData.total), MARGIN + 30, yPos + 7);

      // Progress bar
      const barX = MARGIN + 50, barW = 90, barH = 4;
      doc.setFillColor(35, 35, 55);
      doc.roundedRect(barX, yPos + 4, barW, barH, 1, 1, "F");

      if (dayData.percent > 0) {
        const [r, g, b] = dayData.percent >= 70 ? [34, 197, 94] : dayData.percent >= 40 ? [245, 158, 11] : [239, 68, 68];
        doc.setFillColor(r, g, b);
        doc.roundedRect(barX, yPos + 4, (dayData.percent / 100) * barW, barH, 1, 1, "F");
      }

      const label = String(dayData.percent) + "% (" + String(dayData.done) + "/" + String(dayData.total) + ")";
      doc.setTextColor(dayData.percent >= 70 ? 34 : dayData.percent >= 40 ? 245 : 239,
                       dayData.percent >= 70 ? 197 : dayData.percent >= 40 ? 158 : 68,
                       dayData.percent >= 70 ? 94 : dayData.percent >= 40 ? 11 : 68);
      doc.setFontSize(8);
      doc.text(label, W - MARGIN - 2, yPos + 7, { align: "right" });

      yPos += 14;
    });

    // Footer
    yPos = 275;
    const footerMsg =
      weekAverage >= 80 ? "Exceptional week. You are unstoppable. The wedding is getting closer." :
      weekAverage >= 60 ? "Good momentum. Keep discipline tight. Every day counts." :
      weekAverage >= 40 ? "Room to grow. Reset, recommit, and push harder next week." :
                          "Tough week. That's okay. Show up tomorrow and begin again.";

    doc.setFillColor(30, 10, 55);
    doc.roundedRect(MARGIN, yPos, W - MARGIN * 2, 12, 3, 3, "F");
    doc.setDrawColor(168, 85, 247);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN, yPos, W - MARGIN * 2, 12, 3, 3, "D");
    doc.setTextColor(168, 85, 247);
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.text(footerMsg, W / 2, yPos + 7, { align: "center" });

    doc.save("rekhanth-weekly-report-" + Key + ".pdf");
  };

  const handleEmail = async () => {
    if (!emailCfg.svcId || !emailCfg.tplId || !emailCfg.pubKey || !emailCfg.toEmail) {
      alert("Fill all 4 EmailJS fields in Settings first.");
      return;
    }
    setEmailStatus("sending");
    const weekBreakdown = weekStats.map((d) => `${d.day}: ${d.percent}% (${d.done}/${d.total})`).join("\n");
    try {
      await emailjs.send(
        emailCfg.svcId,
        emailCfg.tplId,
        {
          to_email: emailCfg.toEmail,
          week_score: `${weekAverage}%`,
          day_breakdown: weekBreakdown,
          report_date: Key,
          month: currentMonth,
          goals: currentMonthlyGoal.goals.join("\n"),
        },
        emailCfg.pubKey
      );
      setEmailStatus("sent");
      setTimeout(() => setEmailStatus("idle"), 4000);
    } catch (_) {
      setEmailStatus("error");
      setTimeout(() => setEmailStatus("idle"), 4000);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#07080F", color: "#E8E8F0", fontFamily: "Inter, sans-serif" }}>
      <div style={{ padding: "28px 20px 18px", background: "linear-gradient(135deg, #13072A 0%, #09101E 100%)", borderBottom: "1px solid rgba(168,85,247,0.18)" }}>
        <div style={{ maxWidth: "920px", margin: "0 auto" }}>
          <p style={{ margin: 0, color: "#A855F7", letterSpacing: "2px", fontSize: "11px", textTransform: "uppercase", fontFamily: "monospace" }}>Daily routine · monthly goals · motivation</p>
          <h1 style={{ margin: "11px 0 4px", fontSize: "32px", lineHeight: 1.1 }}>Your daily roadmap</h1>
          <p style={{ margin: 0, color: "#9CA3AF", fontSize: "13px" }}>{Label} · {currentMonthlyGoal.month} goal active</p>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "18px" }}>
            {phases.map((phase) => (
              <div key={phase.id} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${phase.color}22`, padding: "10px 14px", borderRadius: "999px", color: phase.color, fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <span>{phase.emoji}</span>
                <span>{phase.theme} · {phase.period}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "20px 16px 40px" }}>
        <div style={{ display: "flex", gap: "10px", overflowX: "auto", marginBottom: "22px", padding: "4px 0" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: "1 0 auto",
                minWidth: "110px",
                borderRadius: "999px",
                border: "none",
                background: activeTab === tab.id ? "#A855F7" : "rgba(255,255,255,0.04)",
                color: activeTab === tab.id ? "#0F172A" : "#D1D5DB",
                padding: "12px 16px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "daily" && (
          <>
            <div style={{ display: "grid", gap: "14px" }}>
              {schedule.map((item, index) => {
                const category = categories[item.category] || categories.mindset;
                const open = expanded === index;
                const isChecked = Completions[index] || false;
                return (
                  <div key={item.time} style={{ borderRadius: "18px", overflow: "hidden", border: `1px solid ${isChecked ? category.color : "#1F2937"}`, background: isChecked ? category.bg : "#111827" }}>
                    <button
                      onClick={() => setExpanded(open ? null : index)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "16px 18px",
                        border: "none",
                        background: "transparent",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "14px",
                        cursor: "pointer",
                      }}
                    >
                      {/* Checkbox */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTask(index);
                        }}
                        style={{
                          width: "24px",
                          height: "24px",
                          border: `2px solid ${isChecked ? category.color : "#555"}`,
                          borderRadius: "6px",
                          background: isChecked ? category.color : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        {isChecked && <span style={{ color: "#000", fontSize: "14px", fontWeight: "bold" }}>✓</span>}
                      </div>

                      <div style={{ width: "54px", flexShrink: 0, color: "#9CA3AF", fontSize: "12px", fontFamily: "monospace" }}>
                        <div>{item.time}</div>
                        <div style={{ marginTop: "8px", color: "#6B7280" }}>{item.duration}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                          <span style={{ fontSize: "20px" }}>{item.icon}</span>
                          <div>
                            <p style={{ margin: 0, fontSize: "16px", color: isChecked ? "#999" : "#F9FAFB", fontWeight: 700, textDecoration: isChecked ? "line-through" : "none" }}>{item.title}</p>
                            <p style={{ margin: "4px 0 0", color: category.color, fontSize: "11px", fontFamily: "monospace", letterSpacing: "0.5px" }}>{category.label}</p>
                          </div>
                        </div>

                        {open && (
                          <div style={{ color: "#D1D5DB", fontSize: "13px", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                            {item.detail}
                          </div>
                        )}
                      </div>
                      <span style={{ color: "#9CA3AF", fontSize: "12px", marginTop: "4px" }}>{open ? "Close" : "Open"}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", marginTop: "28px" }}>
              {/* 's progress card */}
              <div style={{ padding: "20px", borderRadius: "18px", background: "#111827", border: "1px solid #1F2937" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "14px" }}>
                  <div>
                    <p style={{ margin: 0, color: "#A855F7", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px" }}>'s progress</p>
                    <h2 style={{ margin: "8px 0 0", fontSize: "28px", fontWeight: "bold" }}>{Percent}%</h2>
                  </div>
                  <div style={{ fontSize: "32px" }}>📊</div>
                </div>
                <div style={{ background: "#1F2937", borderRadius: "12px", height: "8px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Percent}%`, background: "#A855F7", borderRadius: "12px", transition: "width 0.3s" }} />
                </div>
                <p style={{ margin: "12px 0 0", color: "#9CA3AF", fontSize: "13px" }}>{Done} of {schedule.length} tasks completed</p>
              </div>

              <div style={{ padding: "20px", borderRadius: "18px", background: "#111827", border: "1px solid #1F2937" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "14px" }}>
                  <div>
                    <p style={{ margin: 0, color: "#A855F7", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px" }}>'s motivation</p>
                    <h2 style={{ margin: "8px 0 0", fontSize: "20px" }}>Stay consistent. Keep your focus.</h2>
                  </div>
                  <div style={{ fontSize: "28px" }}>✨</div>
                </div>
                <div style={{ display: "grid", gap: "10px" }}>
                  {motivations.map((note, noteIndex) => (
                    <div key={noteIndex} style={{ padding: "14px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", color: "#D1D5DB" }}>
                      {note}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "20px", borderRadius: "18px", background: "#111827", border: "1px solid #1F2937" }}>
                <p style={{ margin: 0, color: "#10B981", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px" }}>Monthly goal</p>
                <h2 style={{ margin: "10px 0 6px", fontSize: "20px" }}>{currentMonthlyGoal.month} target</h2>
                <p style={{ margin: 0, color: "#9CA3AF", fontSize: "13px" }}>This month is about building momentum and making progress toward your marriage fund and career switch.</p>
                <div style={{ marginTop: "16px", display: "grid", gap: "10px" }}>
                  {currentMonthlyGoal.goals.map((goal, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "flex-start", background: "rgba(255,255,255,0.03)", borderRadius: "14px", padding: "14px", border: `1px solid ${currentMonthlyGoal.color}22` }}>
                      <span style={{ fontSize: "14px", lineHeight: 1.2, color: currentMonthlyGoal.color }}>●</span>
                      <span style={{ color: "#E5E7EB", fontSize: "14px", lineHeight: 1.6 }}>{goal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "monthly" && (
          <div style={{ display: "grid", gap: "16px" }}>
            {monthlyGoals.map((month) => {
              const isCurrentMonth = month.month === currentMonth;
              const monthIndex = monthNames.indexOf(month.month);
              const currentMonthIndex = monthNames.indexOf(currentMonth);
              const isPastMonth = monthIndex < currentMonthIndex;
              
              return (
                <div
                  key={month.month}
                  style={{
                    padding: "22px",
                    borderRadius: "20px",
                    border: isCurrentMonth ? `2px solid ${month.color}` : `1px solid ${isPastMonth ? "#333" : month.color}22`,
                    background: isCurrentMonth ? "rgba(26,5,51,0.5)" : isPastMonth ? "rgba(0,0,0,0.3)" : "#111827",
                    opacity: isPastMonth ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <p style={{ margin: 0, color: isPastMonth ? "#666" : month.color, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                        {month.month} {isPastMonth && "✓"}
                      </p>
                      <h2 style={{ margin: "6px 0 0", fontSize: "20px", color: isPastMonth ? "#777" : "#F9FAFB" }}>
                        {isCurrentMonth ? "🎯 Active Now" : month.month} Goals
                      </h2>
                    </div>
                    <div style={{ fontSize: "22px", color: isPastMonth ? "#555" : month.color, opacity: isPastMonth ? 0.5 : 1 }}>
                      {isPastMonth ? "✓" : "★"}
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    {month.goals.map((goal, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "flex-start",
                          padding: "12px 14px",
                          borderRadius: "14px",
                          background: isPastMonth ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${isPastMonth ? "#444" : month.color}15`,
                        }}
                      >
                        <span style={{ color: isPastMonth ? "#666" : month.color, fontSize: "12px", lineHeight: 1.4, opacity: isPastMonth ? 0.5 : 1 }}>
                          {isPastMonth ? "✓" : "→"}
                        </span>
                        <span style={{ color: isPastMonth ? "#888" : "#E5E7EB", fontSize: "14px", lineHeight: 1.6, textDecoration: isPastMonth ? "line-through" : "none" }}>
                          {goal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* ════════════ GOALS ════════════ */}
        {/* ════════════ GOALS ════════════ */}
        {activeTab === "goals" && (
          <div style={{ paddingTop: "20px" }}>

            {/* Overall progress */}
            {(() => {
              const totalGoals = MONTHLY_GOALS.reduce((s, m) => s + m.goals.length, 0);
              const totalDone  = MONTHLY_GOALS.reduce((s, m) =>
                s + m.goals.filter((_, i) => goalCompletions[`${m.month}-${i}`]).length, 0);
              const overallPct = Math.round((totalDone / totalGoals) * 100);
              return (
                <div style={{ textAlign:"center", background:"linear-gradient(135deg,rgba(168,85,247,0.1),rgba(59,130,246,0.05))", border:"1px solid rgba(168,85,247,0.2)", borderRadius:"14px", padding:"20px", marginBottom:"20px" }}>
                  <p style={{ fontFamily:"monospace", color:"#666", fontSize:"10px", letterSpacing:"2px", margin:"0 0 6px" }}>8-MONTH OVERALL PROGRESS</p>
                  <p style={{ fontFamily:"monospace", color:"#A855F7", fontSize:"42px", fontWeight:"bold", margin:"0 0 4px" }}>{overallPct}%</p>
                  <p style={{ color:"#888", fontSize:"12px", margin:"0 0 12px", fontStyle:"italic" }}>{totalDone} of {totalGoals} goals completed</p>
                  <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:"6px", height:"8px", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${overallPct}%`, background:"linear-gradient(90deg,#A855F7,#3B82F6)", borderRadius:"6px", transition:"width 0.6s ease" }}/>
                  </div>
                </div>
              );
            })()}

            {/* Monthly cards */}
            {MONTHLY_GOALS.map((monthData) => {
              const { done, total, pct } = getMonthScore(monthData.month, monthData.goals.length);
              const currentMonth = new Date().toLocaleString("default", { month: "short" });
              const isCurrentMonth = monthData.month === currentMonth;

              return (
                <div key={monthData.month} style={{
                  background: "#111118",
                  border: `1px solid ${isCurrentMonth ? monthData.color+"60" : "#1e1e2e"}`,
                  borderRadius: "12px",
                  marginBottom: "12px",
                  overflow: "hidden",
                }}>
                  {/* Month header */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid #1e1e2e" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                      <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:monthData.color, boxShadow:`0 0 8px ${monthData.color}60` }}/>
                      <span style={{ fontFamily:"monospace", color: isCurrentMonth ? monthData.color : "#DDD", fontSize:"13px", fontWeight:"bold" }}>
                        {monthData.month} 2026 {isCurrentMonth ? "← current" : ""}
                      </span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <span style={{ fontFamily:"monospace", color: pct===100?"#22C55E":monthData.color, fontSize:"13px", fontWeight:"bold" }}>{pct}%</span>
                      <span style={{ fontFamily:"monospace", color:"#555", fontSize:"10px" }}>{done}/{total}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ background:"#1a1a2e", height:"4px" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:monthData.color, transition:"width 0.5s ease" }}/>
                  </div>

                  {/* Goals list */}
                  <div style={{ padding:"10px 12px" }}>
                    {monthData.goals.map((goal, idx) => {
                      const done = !!goalCompletions[`${monthData.month}-${idx}`];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleGoal(monthData.month, idx)}
                          style={{
                            display:"flex", alignItems:"flex-start", gap:"10px",
                            padding:"9px 4px",
                            borderBottom: idx < monthData.goals.length-1 ? "1px solid #1a1a28" : "none",
                            cursor:"pointer",
                          }}
                        >
                          {/* Checkbox */}
                          <div style={{
                            width:"20px", height:"20px", borderRadius:"5px", flexShrink:0, marginTop:"1px",
                            border:`2px solid ${done ? monthData.color : "#333"}`,
                            background: done ? monthData.color : "transparent",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            transition:"all 0.2s",
                          }}>
                            {done && <span style={{ color:"#000", fontSize:"12px", fontWeight:"bold" }}>✓</span>}
                          </div>

                          <span style={{
                            fontSize:"12.5px", lineHeight:"1.5",
                            color: done ? "#555" : "#CCC",
                            textDecoration: done ? "line-through" : "none",
                            flex:1,
                          }}>
                            {goal}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Completed banner */}
                  {pct === 100 && (
                    <div style={{ textAlign:"center", padding:"10px", background:`${monthData.color}15`, borderTop:`1px solid ${monthData.color}30` }}>
                      <span style={{ color:monthData.color, fontSize:"12px" }}>🎉 Month complete!</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {activeTab === "motivation" && (
          <div style={{ display: "grid", gap: "18px" }}>
            <div style={{ padding: "22px", borderRadius: "20px", background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ margin: 0, color: "#A855F7", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px" }}>Daily fuel</p>
              <h2 style={{ margin: "10px 0 12px", fontSize: "22px" }}>Motivations for action</h2>
              <p style={{ margin: 0, color: "#9CA3AF", fontSize: "14px", lineHeight: 1.8 }}>
                Use these prompts each morning. They keep your energy aligned with your bigger vision and make every task feel intentional.
              </p>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {motivations.map((text, idx) => (
                <div key={idx} style={{ padding: "18px", borderRadius: "18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ margin: 0, color: "#F3F4F6", fontSize: "15px", lineHeight: 1.8 }}>{text}</p>
                </div>
              ))}
            </div>

            <div style={{ padding: "22px", borderRadius: "20px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
              <p style={{ margin: 0, color: "#3B82F6", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px" }}>Weekly blocks</p>
              <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
                {weeklyBlocks.map((block) => (
                  <div key={block.day} style={{ padding: "14px 16px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p style={{ margin: 0, color: "#E5E7EB", fontWeight: 700, fontSize: "14px" }}>{block.emoji} {block.day}</p>
                    <p style={{ margin: "8px 0 0", color: "#D1D5DB", fontSize: "13px", lineHeight: 1.75 }}>{block.special}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "report" && (
          <div style={{ display: "grid", gap: "16px", paddingTop: "16px" }}>
            <div style={{ padding: "22px", borderRadius: "20px", background: "#111827", border: "1px solid #1F2937" }}>
              <p style={{ margin: 0, color: "#3B82F6", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px" }}>📄 PDF Report</p>
              <h2 style={{ margin: "10px 0 10px", fontSize: "20px" }}>Download schedule & goals</h2>
              <p style={{ margin: "0 0 14px", color: "#9CA3AF", fontSize: "13px" }}>
                Generates a comprehensive A4 PDF with 's schedule and monthly goals for {currentMonth}.
              </p>
              <button
                onClick={() => { setPdfBusy(true); setTimeout(() => { generatePDF(); setPdfBusy(false); }, 100); }}
                disabled={pdfBusy}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "none",
                  background: "#3B82F6",
                  color: "white",
                  cursor: pdfBusy ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  opacity: pdfBusy ? 0.6 : 1,
                }}
              >
                {pdfBusy ? "⏳ Generating..." : "⬇ Download PDF"}
              </button>
            </div>

            <div style={{ padding: "22px", borderRadius: "20px", background: "#111827", border: "1px solid #1F2937" }}>
              <p style={{ margin: 0, color: "#EC4899", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px" }}>📧 Email Report</p>
              <h2 style={{ margin: "10px 0 10px", fontSize: "20px" }}>Send via email</h2>
              <p style={{ margin: "0 0 14px", color: "#9CA3AF", fontSize: "13px" }}>
                Configure EmailJS in Settings first, then send your routine to your inbox.
              </p>
              <button
                onClick={handleEmail}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "none",
                  background: emailStatus === "sent" ? "#10B981" : emailStatus === "error" ? "#EF4444" : "#EC4899",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {emailStatus === "idle" ? "📧 Send Email" : emailStatus === "sending" ? "⏳ Sending..." : emailStatus === "sent" ? "✓ Sent!" : "✗ Failed"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div style={{ paddingTop: "16px" }}>
            <div style={{ padding: "22px", borderRadius: "20px", background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.2)", marginBottom: "16px" }}>
              <p style={{ margin: 0, color: "#EC4899", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px" }}>📧 EmailJS Setup (Free)</p>
              <div style={{ color: "#9CA3AF", fontSize: "12px", lineHeight: 2, marginTop: "12px" }}>
                1. Go to <strong style={{ color: "#DDD" }}>emailjs.com</strong> → Sign up free<br/>
                2. Add Gmail Service → copy <strong style={{ color: "#DDD" }}>Service ID</strong><br/>
                3. Create Template → copy <strong style={{ color: "#DDD" }}>Template ID</strong><br/>
                4. Account → API Keys → copy <strong style={{ color: "#DDD" }}>Public Key</strong><br/>
                5. Add email variables: <code style={{ color: "#A855F7", fontSize: "11px" }}>{"{{to_email}} {{month}} {{goals}}"}</code>
              </div>
            </div>

            <div style={{ display: "grid", gap: "12px", marginBottom: "20px" }}>
              {[
                { k: "svcId", label: "Service ID", ph: "service_xxxxxxx" },
                { k: "tplId", label: "Template ID", ph: "template_xxxxxxx" },
                { k: "pubKey", label: "Public Key", ph: "xxxxxxxxxxxxxxxxxxxxxx" },
                { k: "toEmail", label: "Your Email", ph: "rekhanth@gmail.com" },
              ].map((f) => (
                <div key={f.k}>
                  <label style={{ display: "block", color: "#9CA3AF", fontSize: "12px", marginBottom: "6px", fontWeight: 500 }}>
                    {f.label}
                  </label>
                  <input
                    type={f.k === "toEmail" ? "email" : "text"}
                    value={emailCfg[f.k]}
                    onChange={(e) => setEmailCfg((p) => ({ ...p, [f.k]: e.target.value }))}
                    placeholder={f.ph}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      border: "1px solid #1F2937",
                      background: "#111827",
                      color: "#E5E7EB",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                localStorage.setItem("rk_email_cfg", JSON.stringify(emailCfg));
                alert("✅ Settings saved!");
              }}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "none",
                background: "#A855F7",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "20px",
              }}
            >
              💾 Save Settings
            </button>

            <button
              onClick={() => {
                if (window.confirm("⚠️ This will clear all app data. Continue?")) {
                  localStorage.removeItem("rk_email_cfg");
                  setEmailCfg({ svcId: "", tplId: "", pubKey: "", toEmail: "" });
                  alert("Data cleared.");
                }
              }}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "none",
                background: "#EF4444",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              🗑 Clear All Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
