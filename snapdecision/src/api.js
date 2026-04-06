import { supabase } from './supabase.js'

const SLEEPER_BASE = 'https://api.sleeper.app/v1'

// Fetch all NFL players from Sleeper and store them in Supabase
export async function syncPlayers() {
  const res = await fetch(`${SLEEPER_BASE}/players/nfl`)
  const data = await res.json()

  const players = Object.values(data)
    .filter(p => p.active && p.position && p.team && ['QB', 'RB', 'WR', 'TE', 'K'].includes(p.position))
    .map(p => ({
      id: p.player_id,
      name: `${p.first_name} ${p.last_name}`,
      position: p.position,
      team: p.team || 'FA',
      status: p.injury_status || 'active',
      stats: {},
      updated_at: new Date().toISOString()
    }))

  const { error } = await supabase
    .from('players')
    .upsert(players, { onConflict: 'id' })

  if (error) console.error('Error syncing players:', error)
  else console.log(`Synced ${players.length} players to Supabase`)
}

// Fetch all players from Supabase
export async function getPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name')

  if (error) { console.error('Error fetching players:', error); return [] }
  return data
}

// Fetch players by position
export async function getPlayersByPosition(position) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('position', position)
    .order('name')

  if (error) { console.error('Error fetching players:', error); return [] }
  return data
}

//Update to sync all teams for weekly stats
export async function syncTeams() {
  const teams = [
    { id: "ARI", name: "Cardinals",   city: "Arizona",       abbreviation: "ARI", conference: "NFC", division: "West" },
    { id: "ATL", name: "Falcons",     city: "Atlanta",       abbreviation: "ATL", conference: "NFC", division: "South" },
    { id: "BAL", name: "Ravens",      city: "Baltimore",     abbreviation: "BAL", conference: "AFC", division: "North" },
    { id: "BUF", name: "Bills",       city: "Buffalo",       abbreviation: "BUF", conference: "AFC", division: "East" },
    { id: "CAR", name: "Panthers",    city: "Carolina",      abbreviation: "CAR", conference: "NFC", division: "South" },
    { id: "CHI", name: "Bears",       city: "Chicago",       abbreviation: "CHI", conference: "NFC", division: "North" },
    { id: "CIN", name: "Bengals",     city: "Cincinnati",    abbreviation: "CIN", conference: "AFC", division: "North" },
    { id: "CLE", name: "Browns",      city: "Cleveland",     abbreviation: "CLE", conference: "AFC", division: "North" },
    { id: "DAL", name: "Cowboys",     city: "Dallas",        abbreviation: "DAL", conference: "NFC", division: "East" },
    { id: "DEN", name: "Broncos",     city: "Denver",        abbreviation: "DEN", conference: "AFC", division: "West" },
    { id: "DET", name: "Lions",       city: "Detroit",       abbreviation: "DET", conference: "NFC", division: "North" },
    { id: "GB",  name: "Packers",     city: "Green Bay",     abbreviation: "GB",  conference: "NFC", division: "North" },
    { id: "HOU", name: "Texans",      city: "Houston",       abbreviation: "HOU", conference: "AFC", division: "South" },
    { id: "IND", name: "Colts",       city: "Indianapolis",  abbreviation: "IND", conference: "AFC", division: "South" },
    { id: "JAX", name: "Jaguars",     city: "Jacksonville",  abbreviation: "JAX", conference: "AFC", division: "South" },
    { id: "KC",  name: "Chiefs",      city: "Kansas City",   abbreviation: "KC",  conference: "AFC", division: "West" },
    { id: "LA",  name: "Rams",        city: "Los Angeles",   abbreviation: "LAR", conference: "NFC", division: "West" },
    { id: "LAC", name: "Chargers",    city: "Los Angeles",   abbreviation: "LAC", conference: "AFC", division: "West" },
    { id: "LV",  name: "Raiders",     city: "Las Vegas",     abbreviation: "LV",  conference: "AFC", division: "West" },
    { id: "MIA", name: "Dolphins",    city: "Miami",         abbreviation: "MIA", conference: "AFC", division: "East" },
    { id: "MIN", name: "Vikings",     city: "Minnesota",     abbreviation: "MIN", conference: "NFC", division: "North" },
    { id: "NE",  name: "Patriots",    city: "New England",   abbreviation: "NE",  conference: "AFC", division: "East" },
    { id: "NO",  name: "Saints",      city: "New Orleans",   abbreviation: "NO",  conference: "NFC", division: "South" },
    { id: "NYG", name: "Giants",      city: "New York",      abbreviation: "NYG", conference: "NFC", division: "East" },
    { id: "NYJ", name: "Jets",        city: "New York",      abbreviation: "NYJ", conference: "AFC", division: "East" },
    { id: "PHI", name: "Eagles",      city: "Philadelphia",  abbreviation: "PHI", conference: "NFC", division: "East" },
    { id: "PIT", name: "Steelers",    city: "Pittsburgh",    abbreviation: "PIT", conference: "AFC", division: "North" },
    { id: "SEA", name: "Seahawks",    city: "Seattle",       abbreviation: "SEA", conference: "NFC", division: "West" },
    { id: "SF",  name: "49ers",       city: "San Francisco", abbreviation: "SF",  conference: "NFC", division: "West" },
    { id: "TB",  name: "Buccaneers",  city: "Tampa Bay",     abbreviation: "TB",  conference: "NFC", division: "South" },
    { id: "TEN", name: "Titans",      city: "Tennessee",     abbreviation: "TEN", conference: "AFC", division: "South" },
    { id: "WAS", name: "Commanders",  city: "Washington",    abbreviation: "WAS", conference: "NFC", division: "East" },
  ]

  const { error } = await supabase
    .from('nfl_teams')
    .upsert(teams, { onConflict: 'id' })

  if (error) console.error('Error syncing teams:', error)
  else console.log('Teams synced successfully')
}

// Add a player to a user's roster
export async function addToRoster(userId, playerId) {
  const { error } = await supabase
    .from('rosters')
    .insert({ user_id: userId, player_id: playerId })

  if (error) console.error('Error adding to roster:', error)
}

// Get a user's roster
export async function getRoster(userId) {
  const { data, error } = await supabase
    .from('rosters')
    .select('*, players(*)')
    .eq('user_id', userId)
    .order('slot')

  if (error) { console.error('Error fetching roster:', error); return [] }
  return data
}

// Remove a player from a user's roster
export async function removeFromRoster(userId, playerId) {
  const { error } = await supabase
    .from('rosters')
    .delete()
    .eq('user_id', userId)
    .eq('player_id', playerId)

  if (error) console.error('Error removing from roster:', error)
}

export function calculateFantasyPoints(stats) {
  if (!stats) return 0

  const pts =
    (stats.pass_yd   || 0) * 0.04 +
    (stats.pass_td   || 0) * 4 +
    (stats.pass_int  || 0) * -2 +
    (stats.rush_yd   || 0) * 0.1 +
    (stats.rush_td   || 0) * 6 +
    (stats.rec       || 0) * 1 +
    (stats.rec_yd    || 0) * 0.1 +
    (stats.rec_td    || 0) * 6 +
    (stats.fum_lost  || 0) * -2 +
    (stats.fgm_0_19  || 0) * 3 +
    (stats.fgm_20_29 || 0) * 3 +
    (stats.fgm_30_39 || 0) * 3 +
    (stats.fgm_40_49 || 0) * 4 +
    (stats.fgm_50p   || 0) * 5 +
    (stats.xpm       || 0) * 1

  return Math.round(pts * 10) / 10
}

//calculates fantasy points based on PPR scoring rules. Used to calculate weekly points, average points, and trends.
export async function syncStats() {
  const weeks = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]

  const allWeekStats = await Promise.all(
    weeks.map(week =>
      fetch(`https://api.sleeper.app/v1/stats/nfl/regular/2025/${week}`)
        .then(res => res.json())
        .catch(() => ({}))
    )
  )
console.log("Malik nabers week 6:", allWeekStats[5]["11632"])

  const { data: players, error } = await supabase
    .from('players')
    .select('id, name')

  if (error) { console.error('Error fetching players:', error); return }

  const weeklyRows = []
  const playerUpdates = []

  for (const player of players) {
    const weeklyPoints = []
    const activePoints = []

    for (let i = 0; i < weeks.length; i++) {
  const stats = allWeekStats[i][player.id]
  if (!stats) continue

  const points = calculateFantasyPoints(stats)
  weeklyPoints.push(points)
  if (points > 0) activePoints.push(points)

  weeklyRows.push({
    player_id:   player.id,
    player_name: player.name,
    week:        weeks[i],
    season:      2025,
    points,
    pass_yd:     stats.pass_yd    || 0,
    pass_td:     stats.pass_td    || 0,
    pass_int:    stats.pass_int   || 0,
    rush_yd:     stats.rush_yd    || 0,
    rush_td:     stats.rush_td    || 0,
    rec:         stats.rec        || 0,
    rec_yd:      stats.rec_yd     || 0,
    rec_td:      stats.rec_td     || 0,
    fgm_0_19:    stats.fgm_0_19   || 0,
    fgm_20_29:   stats.fgm_20_29  || 0,
    fgm_30_39:   stats.fgm_30_39  || 0,
    fgm_40_49:   stats.fgm_40_49  || 0,
    fgm_50p:     stats.fgm_50p    || 0,
    xpm:         stats.xpm        || 0,
    fum_lost:    stats.fum_lost   || 0,
  })
}

    const scored = activePoints.filter(p => p > 0)

    const totalPoints = weeklyPoints.reduce((a, b) => a + b, 0)
const avg = Math.round((totalPoints / 17) * 10) / 10

    const gamesPlayed = scored.length

const activeAvg = gamesPlayed > 0
  ? Math.round((scored.reduce((a, b) => a + b, 0) / gamesPlayed) * 10) / 10
  : 0

const recentAvg = gamesPlayed >= 3
  ? scored.slice(-3).reduce((a, b) => a + b, 0) / 3
  : activeAvg

const sampleWeight = gamesPlayed === 0 ? 0
  : gamesPlayed === 1 ? 0.3
  : gamesPlayed === 2 ? 0.5
  : gamesPlayed === 3 ? 0.7
  : gamesPlayed <= 5  ? 0.85
  : 1

const proj = Math.round(((activeAvg * 0.5) + (recentAvg * 0.5)) * sampleWeight * 10) / 10

    const trend = scored.length >= 3
      ? Math.round((scored.slice(-3).reduce((a, b) => a + b, 0) / 3) * 10) / 10
      : avg

    playerUpdates.push({
      id: player.id,
      stats: { weeklyPoints: scored, avg, proj, trend }
    })
  }

  // Save weekly stats in batches of 500
  for (let i = 0; i < weeklyRows.length; i += 500) {
    const batch = weeklyRows.slice(i, i + 500)
    const { error } = await supabase
      .from('weekly_stats')
      .upsert(batch, { onConflict: 'player_id,week,season' })
    if (error) console.error('Error saving weekly stats batch:', error)
  }

  // Update player stats summaries
  const { error: updateError } = await supabase
    .from('players')
    .upsert(playerUpdates, { onConflict: 'id' })

  if (updateError) console.error('Error updating player stats:', updateError)
  else console.log('Stats synced successfully')
}

export async function saveLineup(userId, lineup) {
  for (const p of lineup) {
    const { error } = await supabase
      .from('rosters')
      .update({ is_starter: p.is_starter, slot: p.slot })
      .eq('user_id', userId)
      .eq('player_id', p.player_id)

    if (error) console.error('Error saving lineup:', error)
  }
}

export async function getLineup(userId) {
  const { data, error } = await supabase
    .from('rosters')
    .select('*, players(*)')
    .eq('user_id', userId)
    .order('slot')

  if (error) { console.error('Error fetching lineup:', error); return [] }
  return data
}

export function getPlayerTrend(player) {
  const weekly = player.stats?.weeklyPoints || []
  const avg = player.stats?.avg || 0

  if (weekly.length < 3 || avg === 0) return "neutral"

  const recent = weekly.slice(-3).reduce((a, b) => a + b, 0) / 3
  const diff = ((recent - avg) / avg) * 100

  if (diff >= 20) return "hot"
  if (diff <= -20) return "cold"
  return "neutral"
}

export function getSimilarPlayers(player, allPlayers, count = 3) {
  const weekly = player.stats?.weeklyPoints || []
  const avg = player.stats?.avg || 0
  const trend = player.stats?.trend || 0

  const stdDev = weekly.length > 1
    ? Math.sqrt(weekly.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / weekly.length)
    : 0

  return allPlayers
    .filter(p => p.id !== player.id && p.position === player.position)
    .filter(p => (p.stats?.avg || 0) > 0)
    .map(p => {
      const pWeekly = p.stats?.weeklyPoints || []
      const pAvg = p.stats?.avg || 0
      const pTrend = p.stats?.trend || 0
      const pStdDev = pWeekly.length > 1
        ? Math.sqrt(pWeekly.reduce((sum, pt) => sum + Math.pow(pt - pAvg, 2), 0) / pWeekly.length)
        : 0

      const distance = Math.sqrt(
        Math.pow(avg - pAvg, 2) +
        Math.pow(trend - pTrend, 2) * 0.5 +
        Math.pow(stdDev - pStdDev, 2) * 0.3
      )

      return { ...p, distance }
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
}

export function calculatecurrentRosterGrade(roster) {
  if (!roster || roster.length === 0) return { grade: "N/A", score: 0, breakdown: {} }

  const starters = roster.filter(r => r.is_starter)
  const bench = roster.filter(r => !r.is_starter)

  // Avg points score (0-100)
 const avgPts = starters.length > 0
  ? starters.reduce((sum, r) => {
      const weekly = r.players?.stats?.weeklyPoints || []
      const activeAvg = weekly.length > 0
        ? weekly.reduce((a, b) => a + b, 0) / weekly.length
        : 0
      return sum + activeAvg
    }, 0) / starters.length
  : 0

const avgScore = Math.min((avgPts / 20) * 100, 100)

  // Positional balance score (0-100)
  const requiredSlots = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'TE', 'FLEX', 'K']
  const filledSlots = requiredSlots.filter(slot => roster.some(r => r.slot === slot))
  const balanceScore = (filledSlots.length / requiredSlots.length) * 100

  // Injury risk score (0-100)
  const injuredStarters = starters.filter(r => r.players?.status !== "active").length
  const injuryScore = Math.max(100 - (injuredStarters / Math.max(starters.length, 1)) * 100, 0)

  // Bench depth score (0-100)
  const benchAvg = bench.length > 0
    ? bench.reduce((sum, r) => sum + (r.players?.stats?.avg || 0), 0) / bench.length
    : 0
  const depthScore = Math.min((benchAvg / 15) * 100, 100)

  // Weighted total
  const total = (avgScore * 0.4) + (balanceScore * 0.2) + (injuryScore * 0.2) + (depthScore * 0.2)

  const grade =
    total >= 93 ? "A+" :
    total >= 90 ? "A"  :
    total >= 87 ? "A-" :
    total >= 83 ? "B+" :
    total >= 80 ? "B"  :
    total >= 77 ? "B-" :
    total >= 73 ? "C+" :
    total >= 70 ? "C"  :
    total >= 67 ? "C-" :
    total >= 60 ? "D"  : "F"

  return {
    grade,
    score: Math.round(total),
    breakdown: {
      avgScore:     Math.round(avgScore),
      balanceScore: Math.round(balanceScore),
      injuryScore:  Math.round(injuryScore),
      depthScore:   Math.round(depthScore)
    }
  }
}

export function getNFLWeek() {
  const SEASON_START = new Date('2025-09-04T00:00:00')
  const SEASON_END   = new Date('2026-01-05T00:00:00')
  const now = new Date()

  if (now < SEASON_START || now >= SEASON_END) {
    return { week: now < SEASON_START ? 1 : 18, inSeason: false }
  }

  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const week = Math.min(Math.floor((now - SEASON_START) / msPerWeek) + 1, 18)
  return { week, inSeason: true }
}

export function getDaysUntilSunday() {
  const day = new Date().getDay() // 0=Sun
  return day === 0 ? 0 : 7 - day
}

export async function getPlayerWeeklyStats(playerId) {
  const { data, error } = await supabase
    .from('weekly_stats')
    .select('week, points, pass_yd, pass_td, rush_yd, rush_td, rec, rec_yd, rec_td')
    .eq('player_id', playerId)
    .eq('season', 2025)
    .order('week', { ascending: true })

  if (error) { console.error('Error fetching weekly stats:', error); return [] }
  return data
}