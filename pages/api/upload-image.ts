import type { NextApiRequest, NextApiResponse } from 'next'
import { uploadToStorage } from '../../lib/supabaseStorage'

export const config = {
  api: {
    bodyParser: false, // Pour gérer les fichiers (multipart/form-data)
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  // Import dynamique de busboy pour éviter les erreurs SSR
  const Busboy = (await import('busboy')).default
  const bb = Busboy({ headers: req.headers })
  let uploadFile: Buffer | null = null
  let fileName = ''

  bb.on('file', (_name: string, file: any, info: { filename: string }) => {
    fileName = `${Date.now()}-${info.filename}`
    const chunks: Buffer[] = []
    file.on('data', (chunk: Buffer) => chunks.push(chunk))
    file.on('end', () => {
      uploadFile = Buffer.concat(chunks)
    })
  })

  bb.on('finish', async () => {
    if (!uploadFile) return res.status(400).json({ error: 'Aucun fichier reçu' })
    const { publicUrl, error } = await uploadToStorage('images', fileName, uploadFile)
    if (error || !publicUrl) return res.status(500).json({ error: error?.message || 'Erreur upload' })
    return res.status(200).json({ url: publicUrl })
  })

  req.pipe(bb)
}