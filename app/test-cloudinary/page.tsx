"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RingLoader } from 'react-spinners'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadImage } from '@/lib/cloudinary'
import { toast } from '@/hooks/use-toast'
import { ArrowRight } from 'lucide-react'

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export default function TestCloudinaryPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [percent, setPercent] = useState(0)
  const [url, setUrl] = useState('')
  const [publicId, setPublicId] = useState('')
  const [name, setName] = useState('')
  const [testingFine, setTestingFine] = useState(false)

  useEffect(() => {
    async function upload() {
      if (!file) return
      setLoading(true)
      setPercent(0)
      setUrl('')
      setPublicId('')
      setName('')
      setTestingFine(false)

      try {
        const data = await uploadImage(file)
        setUrl(data.secure_url)
        setPublicId(data.public_id)
        setName(data.name)

        for (let i = 0; i <= 100; i++) {
          await sleep(20)
          setPercent(i)
        }

        for (let i = 0; i <= 100; i++) {
          await sleep(20)
        }

        setTestingFine(true)
      } catch (err) {
        toast({
          title: 'Erreur lors de l\'upload',
          description: (err as Error).message,
        })
      } finally {
        await sleep(500)
        setLoading(false)
        setPercent(0)
      }
    }
    upload()
  }, [file])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Test de Cloudinary</h1>
        <p className="text-gray-400 text-sm">
          Ce composant simule l'upload d'une image vers Cloudinary. 
        </p>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg shadow-md space-y-6">
        <div className="relative flex flex-col md:flex-row items-center md:space-x-6">
          <div className="md:w-1/2">
            <label htmlFor="file">
              <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-center">
                Cliquez ici pour sélectionner une image
              </div>
            </label>
            <input
              type="file"
              id="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="md:w-1/2 space-y-2 mt-8 md:mt-0">
            {loading && (
              <div className="flex justify-center items-center">
                <RingLoader size={64} color="#FFA500" />
              </div>
            )}
            {testingFine && (
              <div className="text-center">
                <h2 className="text-2xl font-bold">Upload réussi !</h2>
                <p className="text-green-500">
                  L'image a été uploadée sur Cloudinary avec succès.
                </p>
              </div>
            )}
          </div>
        </div>

        {url && (
          <div className="flex justify-center">
            <img src={url} alt="Uploaded" className="max-h-64 rounded-lg shadow-md" />
          </div>
        )}

        {publicId && (
          <div className="space-y-3">
            <p className="text-center">Public ID: {publicId}</p>
            <p className="text-center">Nom: {name}</p>
          </div>
        )}
      </div>

      {testingFine && (
        <div className="text-center mt-8">
          <Button 
            className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
            onClick={() => window.location.href = '/admin/films/add'}
          >
            Continuer vers l'ajout de films <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}