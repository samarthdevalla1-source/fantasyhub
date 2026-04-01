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
//calculates fantasy points based on PPR scoring rules. Used to calculate weekly points, average points, and trends.
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
//syncs stats from sleeper's weekly and season stats endpoint, calculates fantasy points, and updates player records in Supabase.
export async function syncStats() {
  const weeks = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]

  const allWeekStats = await Promise.all(
    weeks.map(week =>
      fetch(`https://api.sleeper.app/v1/stats/nfl/regular/2025/${week}`)
        .then(res => res.json())
    )
  )

  const { data: players, error } = await supabase
    .from('players')
    .select('id')

  if (error) { console.error('Error fetching players:', error); return }

  const updates = players.map(player => {
    const weeklyPoints = allWeekStats.map(weekStats => {
      const stats = weekStats[player.id]
      return calculateFantasyPoints(stats)
    }).filter(pts => pts > 0)

    const avg = weeklyPoints.length > 0
      ? Math.round((weeklyPoints.reduce((a, b) => a + b, 0) / weeklyPoints.length) * 10) / 10
      : 0

const recentAvg = weeklyPoints.length >= 3
  ? weeklyPoints.slice(-3).reduce((a, b) => a + b, 0) / 3
  : avg

const proj = Math.round(((avg * 0.5) + (recentAvg * 0.5)) * 10) / 10

    const trend = weeklyPoints.length >= 3
      ? Math.round((weeklyPoints.slice(-3).reduce((a, b) => a + b, 0) / 3) * 10) / 10
      : avg

    return {
      id: player.id,
      stats: { weeklyPoints, avg, proj, trend }
    }
  })

  const { error: updateError } = await supabase
    .from('players')
    .upsert(updates, { onConflict: 'id' })

  if (updateError) console.error('Error updating stats:', updateError)
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