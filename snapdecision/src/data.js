export const ROSTER = [
  { name: "Patrick Mahomes", pos: "QB",  team: "KC",  opp: "vs LAC", proj: 28.4, pts: 31.2, status: "active",       trend: 92 },
  { name: "Saquon Barkley",  pos: "RB",  team: "PHI", opp: "@ DAL",  proj: 22.1, pts: 19.8, status: "active",       trend: 88 },
  { name: "Jahmyr Gibbs",    pos: "RB",  team: "DET", opp: "vs GB",  proj: 18.6, pts: 21.4, status: "active",       trend: 75 },
  { name: "Tyreek Hill",     pos: "WR",  team: "MIA", opp: "@ BUF",  proj: 17.2, pts: 14.1, status: "questionable", trend: 61 },
  { name: "CeeDee Lamb",     pos: "WR",  team: "DAL", opp: "vs PHI", proj: 20.8, pts: 24.6, status: "active",       trend: 95 },
  { name: "Sam LaPorta",     pos: "TE",  team: "DET", opp: "vs GB",  proj: 12.4, pts: 9.2,  status: "active",       trend: 70 },
  { name: "Justin Tucker",   pos: "K",   team: "BAL", opp: "vs CLE", proj: 8.5,  pts: 10.0, status: "active",       trend: 80 },
  { name: "SF 49ers",        pos: "DEF", team: "SF",  opp: "vs ARI", proj: 10.2, pts: 13.0, status: "active",       trend: 84 },
];

export const WAIVER = [
  { name: "Gus Edwards",  pos: "RB", team: "LAC", owned: "34%", pts: 16.2, trend: "+4.8" },
  { name: "Keon Coleman", pos: "WR", team: "BUF", owned: "41%", pts: 14.8, trend: "+6.1" },
  { name: "Brock Bowers", pos: "TE", team: "LV",  owned: "67%", pts: 18.1, trend: "+2.3" },
  { name: "Tyjae Spears", pos: "RB", team: "TEN", owned: "28%", pts: 12.4, trend: "+3.9" },
];

export const SLEEPERS = [
  { name: "Rashid Shaheed", pos: "WR", team: "NO",  pts: 11.2, games: 6, trend: 78 },
  { name: "Blake Corum",    pos: "RB", team: "LAR", pts: 9.8,  games: 4, trend: 65 },
  { name: "Cade Stover",    pos: "TE", team: "HOU", pts: 8.4,  games: 5, trend: 71 },
];

export const SYSTEM_PROMPT = `You are an elite Fantasy Football AI analyst. You have access to the user's roster and player data. Be concise, direct, and data-driven. Give specific actionable advice. Keep responses under 4 sentences unless a deeper breakdown is requested.

Current Roster:
${ROSTER.map(p => `${p.name} (${p.pos}, ${p.team}): projected ${p.proj} pts, avg ${p.pts} pts, status: ${p.status}, trend score: ${p.trend}/100`).join("\n")}

Week 14 context: Tyreek Hill is questionable (knee). CeeDee Lamb is on a 3-game 24+ pt streak. Saquon Barkley faces a tough Dallas run defense.`;

export const WELCOME_MESSAGE = "Welcome back, Coach. Your roster is projected for 138.2 pts this week. CeeDee Lamb is your top performer — consider starting him flex if you're in a close matchup. Tyreek Hill is listed questionable; monitor his status before Sunday.";