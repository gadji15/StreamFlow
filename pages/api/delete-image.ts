import type { NextApiRequest, NextApiResponse } from 'next'
import { deleteFromStorage } from '../../lib/supabaseStorage'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end('Method Not Allowed')

  const { filename } = req.query
  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ error: 'Nom de fichier manquant ou invalide' })
  }

  const { error } = await deleteFromStorage('images', filename)
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ success: true })
}