import type { NextApiRequest, NextApiResponse } from 'next'
import { getSeries, addSeries } from '../../../lib/supabaseSeries'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data, error } = await getSeries()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  } else if (req.method === 'POST') {
    const { title, description, release_date, created_by } = req.body
    const { data, error } = await addSeries({ title, description, release_date, created_by })
    if (error) return res.status(400).json({ error: error.message })
    return res.status(201).json(data)
  }
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}