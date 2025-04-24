"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Star, Award, Download, Tv, Film, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { mockSubscriptionPlans } from "@/lib/mock-data"

export default function AbonnementPageClient() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [selectedPlan, setSelectedPlan] = useState<"standard" | "premium" | "vip">("standard")

  // Définition des plans
  const plans = {
    standard: {
      name: "Standard",
      price: billingPeriod === "monthly" ? "9,99 €" : "99,99 €",
      priceValue: billingPeriod === "monthly" ? 9.99 : 99.99,
      savings: billingPeriod === "yearly" ? "20%" : null,
      features: {
        quality: "HD (1080p)",
        devices: 2,
        downloads: false,
        ads: true,
        exclusiveContent: false,
        advancedFilters: false,
        offlineViewing: false,
        multipleProfiles: 2,
      },
    },
    premium: {
      name: "Premium",
      price: billingPeriod === "monthly" ? "14,99 €" : "149,99 €",
      priceValue: billingPeriod === "monthly" ? 14.99 : 149.99,
      savings: billingPeriod === "yearly" ? "17%" : null,
      features: {
        quality: "Full HD (1080p)",
        devices: 4,
        downloads: true,
        ads: false,
        exclusiveContent: false,
        advancedFilters: false,
        offlineViewing: true,
        multipleProfiles: 4,
      },
    },
    vip: {
      name: "VIP",
      price: billingPeriod === "monthly" ? "19,99 €" : "179,99 €",
      priceValue: billingPeriod === "monthly" ? 19.99 : 179.99,
      savings: billingPeriod === "yearly" ? "25%" : null,
      features: {
        quality: "4K + HDR",
        devices: "Illimité",
        downloads: true,
        ads: false,
        exclusiveContent: true,
        advancedFilters: true,
        offlineViewing: true,
        multipleProfiles: 6,
      },
      badge: "Recommandé",
    },
  }

  // Animation variants
  const cardVariants = {
    selected: {
      scale: 1.05,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
      borderColor: "rgba(139, 92, 246, 0.8)",
      transition: { duration: 0.3 },
    },
    notSelected: {
      scale: 1,
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      borderColor: "rgba(75, 85, 99, 0.3)",
      transition: { duration: 0.3 },
    },
  }

  // Fonctionnalités détaillées pour la section FAQ
  const vipFeatures = [
    {
      title: "Qualité vidéo 4K + HDR",
      description:
        "Profitez de vos films et séries préférés avec une qualité d'image exceptionnelle en 4K et HDR pour une expérience visuelle immersive.",
      icon: <Tv className="h-6 w-6 text-purple-500" />,
    },
    {
      title: "Contenu exclusif VIP",
      description:
        "Accédez à des films, séries et documentaires exclusifs disponibles uniquement pour nos abonnés VIP, avec des avant-premières et du contenu original.",
      icon: <Star className="h-6 w-6 text-purple-500" />,
    },
    {
      title: "Téléchargements illimités",
      description:
        "Téléchargez autant de contenu que vous le souhaitez pour le visionner hors ligne, parfait pour les voyages ou les zones à faible connectivité.",
      icon: <Download className="h-6 w-6 text-purple-500" />,
    },
    {
      title: "Streaming sur appareils illimités",
      description:
        "Regardez StreamFlow sur autant d'appareils que vous le souhaitez, sans restriction, et partagez votre compte avec toute votre famille.",
      icon: <Zap className="h-6 w-6 text-purple-500" />,
    },
    {
      title: "Filtres de recherche avancés",
      description:
        "Trouvez exactement ce que vous cherchez grâce à nos filtres de recherche avancés par genre, acteur, réalisateur, année, note et bien plus encore.",
      icon: <Film className="h-6 w-6 text-purple-500" />,
    },
    {
      title: "Recommandations personnalisées",
      description:
        "Notre algorithme d'IA analyse vos préférences pour vous recommander du contenu parfaitement adapté à vos goûts.",
      icon: <Award className="h-6 w-6 text-purple-500" />,
    },
  ]

  const handleSelectPlan = (plan: "standard" | "premium" | "vip") => {
    setSelectedPlan(plan)
  }

  const handleContinue = () => {
    // Rediriger vers la page de paiement avec le plan sélectionné
    window.location.href = `/abonnement/paiement?plan=${selectedPlan}&period=${billingPeriod}`
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Abonnements StreamFlow VIP</h1>
          <p className="text-xl text-gray-400 mb-8">
            Accédez à du contenu exclusif et des fonctionnalités premium avec nos abonnements VIP
          </p>

          <div className="bg-gradient-to-r from-amber-400/20 to-yellow-600/20 p-6 rounded-xl mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-amber-400">Pourquoi choisir l'abonnement VIP ?</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-black/40 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2 text-amber-300">Contenu Exclusif</h3>
                <p className="text-gray-300">
                  Accédez à des films et séries en avant-première et du contenu disponible uniquement pour nos membres
                  VIP.
                </p>
              </div>
              <div className="bg-black/40 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2 text-amber-300">Qualité Supérieure</h3>
                <p className="text-gray-300">
                  Profitez de vos contenus préférés en 4K HDR avec un son immersif sur tous vos appareils.
                </p>
              </div>
              <div className="bg-black/40 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2 text-amber-300">Sans Publicité</h3>
                <p className="text-gray-300">
                  Une expérience de visionnage ininterrompue, sans aucune publicité ni interruption.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {mockSubscriptionPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`border ${plan.isPopular ? "border-amber-500 bg-gradient-to-b from-amber-950/40 to-black" : "border-gray-800 bg-gray-950"}`}
            >
              <CardHeader>
                {plan.isPopular && (
                  <div className="py-1 px-3 bg-gradient-to-r from-amber-400 to-yellow-600 text-black text-sm font-bold rounded-full w-fit mb-2">
                    Populaire
                  </div>
                )}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>
                  <div className="flex items-baseline mt-2">
                    <span className="text-3xl font-bold text-white">{plan.price}€</span>
                    <span className="text-gray-400 ml-1">/{plan.billingCycle === "monthly" ? "mois" : "an"}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href={`/abonnement/paiement?plan=${plan.id}`} className="w-full">
                  <Button
                    className={`w-full ${
                      plan.isPopular
                        ? "bg-gradient-to-r from-amber-400 to-yellow-600 text-black hover:from-amber-500 hover:to-yellow-700"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    Choisir ce forfait
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">Questions fréquentes</h2>
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">Puis-je annuler mon abonnement à tout moment ?</h3>
              <p className="text-gray-400">
                Oui, vous pouvez annuler votre abonnement à tout moment. L'annulation prendra effet à la fin de votre
                période de facturation en cours.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">Comment puis-je accéder au contenu VIP ?</h3>
              <p className="text-gray-400">
                Une fois abonné, tout le contenu exclusif sera automatiquement déverrouillé et accessible depuis la
                section "Exclusif VIP" dans le menu principal.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">Quels modes de paiement acceptez-vous ?</h3>
              <p className="text-gray-400">
                Nous acceptons les cartes de crédit (Visa, Mastercard, American Express), PayPal, et dans certains pays,
                le paiement via votre opérateur mobile.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">Puis-je partager mon compte avec ma famille ?</h3>
              <p className="text-gray-400">
                Oui, nos forfaits Premium et Famille permettent le visionnage simultané sur plusieurs appareils. Le
                forfait Famille offre jusqu'à 6 profils distincts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
