const { initializeApp } = require("firebase/app");
const { getDatabase, ref, get } = require("firebase/database");
const nodemailer = require("nodemailer");

// ── Config from GitHub Secrets ──
const firebaseConfig = {
  apiKey:      process.env.FIREBASE_API_KEY,
  databaseURL: process.env.FIREBASE_DB_URL,
  projectId:   process.env.FIREBASE_PROJECT_ID,
  appId:       process.env.FIREBASE_APP_ID,
};

const SCHEDULE_COUNT = 13; // total tasks per day
const DAYS_FULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const REPORT_TYPE = process.env.REPORT_TYPE || "daily"; // daily | weekly | monthly

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function formatDisplay(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function pctColor(pct) {
  if (pct >= 70) return "#22C55E";
  if (pct >= 40) return "#F59E0B";
  return "#EF4444";
}

function buildDailyRows(days, completions) {
  return days.map(d => {
    const key  = dateKey(d);
    const done = Object.values(completions[key] || {}).filter(Boolean).length;
    const pct  = Math.round((done / SCHEDULE_COUNT) * 100);
    const bar  = "█".repeat(Math.round(pct / 10)) + "░".repeat(10 - Math.round(pct / 10));
    return `
      <tr>
        <td style="padding:10px 16px;color:#CCC;font-family:monospace;font-size:13px;">
          ${DAYS_FULL[d.getDay()]}
        </td>
        <td style="padding:10px 16px;color:#888;font-family:monospace;font-size:12px;">
          ${formatDisplay(key)}
        </td>
        <td style="padding:10px 16px;font-family:monospace;font-size:12px;color:${pctColor(pct)};">
          ${bar} ${pct}%
        </td>
        <td style="padding:10px 16px;color:#666;font-family:monospace;font-size:12px;">
          ${done}/${SCHEDULE_COUNT}
        </td>
      </tr>`;
  }).join("");
}

function emailHTML({ title, dateRange, avgPct, rows, motivation, extraNote }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#111118;border-radius:16px;overflow:hidden;border:1px solid #1e1e2e;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a0533,#0f172a);padding:32px;text-align:center;border-bottom:1px solid rgba(168,85,247,0.2);">
              <p style="margin:0 0 8px;color:#A855F7;font-family:monospace;font-size:10px;letter-spacing:3px;">REKHANTH'S ROUTINE TRACKER</p>
              <h1 style="margin:0 0 6px;color:#E8E8F0;font-size:22px;font-weight:normal;">${title}</h1>
              <p style="margin:0;color:#666;font-family:monospace;font-size:12px;">${dateRange}</p>
            </td>
          </tr>

          <!-- Score -->
          <tr>
            <td style="padding:28px;text-align:center;">
              <p style="margin:0 0 6px;color:#666;font-family:monospace;font-size:10px;letter-spacing:2px;">COMPLETION SCORE</p>
              <p style="margin:0 0 4px;color:#A855F7;font-family:monospace;font-size:48px;font-weight:bold;">${avgPct}%</p>
              <p style="margin:0;color:#888;font-size:13px;font-style:italic;">${motivation}</p>
            </td>
          </tr>

          <!-- Table -->
          <tr>
            <td style="padding:0 20px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr style="border-bottom:1px solid #1e1e2e;">
                  <th style="padding:8px 16px;color:#555;font-family:monospace;font-size:10px;text-align:left;letter-spacing:1px;">DAY</th>
                  <th style="padding:8px 16px;color:#555;font-family:monospace;font-size:10px;text-align:left;letter-spacing:1px;">DATE</th>
                  <th style="padding:8px 16px;color:#555;font-family:monospace;font-size:10px;text-align:left;letter-spacing:1px;">PROGRESS</th>
                  <th style="padding:8px 16px;color:#555;font-family:monospace;font-size:10px;text-align:left;letter-spacing:1px;">DONE</th>
                </tr>
                ${rows}
              </table>
            </td>
          </tr>

          ${extraNote ? `
          <!-- Extra note -->
          <tr>
            <td style="padding:0 20px 20px;">
              <div style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2);border-radius:10px;padding:14px;text-align:center;">
                <p style="margin:0;color:#AAA;font-size:12px;line-height:1.7;">${extraNote}</p>
              </div>
            </td>
          </tr>` : ""}

          <!-- Footer -->
          <tr>
            <td style="padding:20px;text-align:center;border-top:1px solid #1e1e2e;">
              <p style="margin:0;color:#444;font-family:monospace;font-size:10px;">December 2026 · Marriage goal · Keep going 💍</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function main() {
  // ── Init Firebase ──
  const app  = initializeApp(firebaseConfig);
  const dbInstance = getDatabase(app);
  const snapshot = await get(ref(dbInstance, "completions"));
  const completions = snapshot.val() || {};

  // ── Build report data ──
  const now = new Date();
  let days = [], title = "", dateRange = "", extraNote = "";

  if (REPORT_TYPE === "daily") {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    days      = [yesterday];
    title     = "Daily Report";
    dateRange = formatDisplay(dateKey(yesterday)) + " 2026";

  } else if (REPORT_TYPE === "weekly") {
    days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return d;
    });
    title     = "Weekly Report";
    dateRange = `${formatDisplay(dateKey(days[0]))} – ${formatDisplay(dateKey(days[6]))} 2026`;
    extraNote = "Download the full PDF report from your tracker app for detailed category breakdown.";

  } else if (REPORT_TYPE === "monthly") {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, i + 1);
      return d;
    });
    title     = `Monthly Report · ${MONTHS[now.getMonth() - 1]} 2026`;
    dateRange = `${MONTHS[now.getMonth() - 1]} 2026`;
    extraNote = "Full month completed. Check your tracker for the category breakdown and savings progress.";
  }

  const totalDone = days.reduce((sum, d) => {
    const dd = completions[dateKey(d)] || {};
    return sum + Object.values(dd).filter(Boolean).length;
  }, 0);

  const avgPct = Math.round((totalDone / (days.length * SCHEDULE_COUNT)) * 100);

  const motivation =
    avgPct >= 80 ? "🔥 Outstanding. You are unstoppable." :
    avgPct >= 60 ? "⚡ Good momentum. Keep the discipline." :
    avgPct >= 40 ? "💪 Room to grow. Push harder." :
                   "🌅 Tough stretch. Reset and begin again.";

  const rows = buildDailyRows(days, completions);
  const html = emailHTML({ title, dateRange, avgPct, rows, motivation, extraNote });

  // ── Send email ──
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password, not your real password
    },
  });

  await transporter.sendMail({
    from:    `"Routine Tracker" <${process.env.GMAIL_USER}>`,
    to:      process.env.GMAIL_USER,
    subject: `${title} · ${dateRange}`,
    html,
  });

  console.log(`✅ ${REPORT_TYPE} report sent for ${dateRange}`);
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });