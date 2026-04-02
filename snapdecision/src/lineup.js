const SLOTS = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'TE', 'FLEX', 'K']

export function calculateBestLineup(roster) {
  const players = roster.map(r => ({
    ...r,
    proj: r.players?.stats?.proj || 0,
    pos: r.players?.position
  }))

  const lineup = {}
  const used = new Set()

  function getBest(positions, exclude = []) {
    return players
      .filter(p => positions.includes(p.pos))
      .filter(p => !used.has(p.player_id))
      .filter(p => !exclude.includes(p.player_id))
      .sort((a, b) => b.proj - a.proj)[0]
  }

  // QB
  const qb = getBest(['QB'])
  if (qb) { lineup['QB'] = qb; used.add(qb.player_id) }

  // RB1
  const rb1 = getBest(['RB'])
  if (rb1) { lineup['RB1'] = rb1; used.add(rb1.player_id) }

  // RB2
  const rb2 = getBest(['RB'])
  if (rb2) { lineup['RB2'] = rb2; used.add(rb2.player_id) }

  // WR1
  const wr1 = getBest(['WR'])
  if (wr1) { lineup['WR1'] = wr1; used.add(wr1.player_id) }

  // WR2
  const wr2 = getBest(['WR'])
  if (wr2) { lineup['WR2'] = wr2; used.add(wr2.player_id) }

  // TE
  const te = getBest(['TE'])
  if (te) { lineup['TE'] = te; used.add(te.player_id) }

  // FLEX (best remaining RB, WR, or TE)
  const flex = getBest(['RB', 'WR', 'TE'])
  if (flex) { lineup['FLEX'] = flex; used.add(flex.player_id) }

  // K
  const k = getBest(['K'])
  if (k) { lineup['K'] = k; used.add(k.player_id) }

  // Build final roster with slots
  return players.map(p => {
    const slot = Object.entries(lineup).find(([, v]) => v.player_id === p.player_id)?.[0]
    return {
      ...p,
      is_starter: !!slot,
      slot: slot || 'BENCH'
    }
  })
}

export const SLOT_LABELS = {
  QB:   'QB',
  RB1:  'RB',
  RB2:  'RB',
  WR1:  'WR',
  WR2:  'WR',
  TE:   'TE',
  FLEX: 'FLEX',
  K:    'K',
  BENCH: 'BENCH'
}

export const SLOT_ORDER = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'TE', 'FLEX', 'K', 'BENCH']