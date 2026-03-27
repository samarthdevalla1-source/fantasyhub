import { supabase } from './supabase.js'

export async function signUp(email, password, username, teamName) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { error }

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      username,
      team_name: teamName
    })

  if (profileError) return { error: profileError }
  return { data }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error }
  return { data }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) return { error }
  return {}
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}