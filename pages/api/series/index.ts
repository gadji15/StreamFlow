import type { NextApiRequest, NextApiResponse } from 'next'
import { getSeries, addSeries } from '../../../lib/supabaseSeries'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Correction : getSeries() retourne directement un tableau ou une erreur, pas un objet { data, error }
    try {
      const data = await getSeries()
      return res.status(200).json(data)
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    const { title, description, release_date, created_by } = req.body
    if (!title || !created_by) return res.status(400).json({ error: 'Titre et auteur requis' })
    try {
      // Correction : retirez 'created_by' si non supporté par le modèle Series
      const result = await addSeries({ title, description });
      if (!result) return res.status(400).json({ error: "Erreur lors de l'ajout de la série" });
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}