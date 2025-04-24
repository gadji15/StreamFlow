"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConfirmationPage() {
  const router = useRouter()

  // Rediriger vers la page d'accueil après 10 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/")
    }, 10000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto bg-gray-950 border-gray-800">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Félicitations !</CardTitle>
            <CardDescription className="text-lg">Votre abonnement VIP a été activé avec succès</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-amber-400/20 to-yellow-600/20 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2 text-amber-400">Votre compte est maintenant VIP</h3>
              <p className="text-gray-300">
                Vous avez désormais accès à tout le contenu exclusif et aux fonctionnalités premium de StreamFlow.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Que pouvez-vous faire maintenant ?</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-amber-400 mr-2 shrink-0 mt-0.5" />
                  <span>Explorer le contenu exclusif dans la section "Exclusif VIP"</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-amber-400 mr-2 shrink-0 mt-0.5" />
                  <span>Profiter de la qualité vidéo 4K HDR sur tous vos appareils</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-amber-400 mr-2 shrink-0 mt-0.5" />
                  <span>Télécharger du contenu pour le visionner hors ligne</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-amber-400 mr-2 shrink-0 mt-0.5" />
                  <span>Accéder aux avant-premières et contenus en exclusivité</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-400">
                Un email de confirmation a été envoyé à votre adresse email. Vous pouvez gérer votre abonnement à tout
                moment depuis votre espace client.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center space-x-4">
            <Link href="/exclusif">
              <Button className="bg-gradient-to-r from-amber-400 to-yellow-600 text-black hover:from-amber-500 hover:to-yellow-700">
                Découvrir le contenu exclusif
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Retour à l'accueil</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
