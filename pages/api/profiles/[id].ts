import type { NextApiRequest, NextApiResponse } from 'next'
import { getProfile, updateProfile } from '../../../lib/supabaseProfiles'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid user id' })

  if (req.method === 'GET') {
    const { data, error } = await getProfile(id)
    if (error) return res.status(404).json({ error: error.message })
    return res.status(200).json(data)
  } else if (req.method === 'PATCH') {
    const { full_name, role } = req.body
    if (!full_name && !role) return res.status(400).json({ error: 'Aucune modification' })
    const { data, error } = await updateProfile(id, { full_name, role })
    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json(data)
  }
  res.setHeader('Allow', ['GET', 'PATCH'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}