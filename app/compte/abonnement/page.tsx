"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Download, CreditCard, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockUserSubscription, mockPaymentMethods, mockMovies, mockSeries } from "@/lib/mock-data"

export default function SubscriptionManagementPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const subscription = mockUserSubscription

  // Filtrer le contenu exclusif VIP
  const exclusiveContent = {
    movies: mockMovies.filter((movie) => movie.vipOnly).slice(0, 3),
    series: mockSeries.filter((series) => series.vipOnly).slice(0, 2),
  }

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Mon abonnement</h1>
          <p className="text-gray-400 mb-8">Gérez votre abonnement et vos informations de paiement</p>

          <Tabs defaultValue="overview" className="space-y-8" onValueChange={setActiveTab}>
            <TabsList className="bg-gray-900">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="payment">Paiement</TabsTrigger>
              <TabsTrigger value="exclusive">Contenu exclusif</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="bg-gray-950 border-gray-800">
                <CardHeader>
                  <CardTitle>Statut de l'abonnement</CardTitle>
                  <CardDescription>Détails de votre abonnement actuel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Abonnement VIP</h3>
                      <p className="text-sm text-gray-400">Facturation mensuelle</p>
                    </div>
                    <div className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-sm font-medium">
                      Actif
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Prochain paiement</p>
                      <p className="font-medium">{formatDate(subscription.nextBillingDate)}</p>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Montant</p>
                      <p className="font-medium">14,99 €</p>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Méthode de paiement</p>
                      <p className="font-medium">Carte •••• {subscription.paymentMethod.last4}</p>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-500">Avantages de votre abonnement VIP</h4>
                        <ul className="mt-2 space-y-1 text-sm text-gray-300">
                          <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 text-amber-500 mr-1 shrink-0 mt-0.5" />
                            <span>Accès à tout le contenu exclusif</span>
                          </li>
                          <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 text-amber-500 mr-1 shrink-0 mt-0.5" />
                            <span>Streaming en 4K HDR</span>
                          </li>
                          <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 text-amber-500 mr-1 shrink-0 mt-0.5" />
                            <span>Téléchargements illimités</span>
                          </li>
                          <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 text-amber-500 mr-1 shrink-0 mt-0.5" />
                            <span>Visionnage sur 4 appareils simultanément</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Changer de forfait
                  </Button>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    Annuler l'abonnement
                  </Button>
                </CardFooter>
              </Card>

              {subscription.billingHistory && subscription.billingHistory.length > 0 && (
                <div className="space-y-6">
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Historique de facturation</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-gray-400 text-sm">
                            <th className="pb-4 font-medium">Date</th>
                            <th className="pb-4 font-medium">Description</th>
                            <th className="pb-4 font-medium">Montant</th>
                            <th className="pb-4 font-medium">Statut</th>
                            <th className="pb-4 font-medium">Facture</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subscription.billingHistory.map((item) => (
                            <tr key={item.id} className="border-t border-gray-800">
                              <td className="py-4">{formatDate(item.date)}</td>
                              <td className="py-4">{item.description}</td>
                              <td className="py-4">{item.amount} €</td>
                              <td className="py-4">
                                <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded-full text-xs">
                                  {item.status === "paid" ? "Payé" : item.status}
                                </span>
                              </td>
                              <td className="py-4">
                                <Button variant="ghost" size="sm" className="h-8 px-2">
                                  <Download className="h-4 w-4 mr-1" />
                                  PDF
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="payment" className="space-y-6">
              <Card className="bg-gray-950 border-gray-800">
                <CardHeader>
                  <CardTitle>Méthodes de paiement</CardTitle>
                  <CardDescription>Gérez vos méthodes de paiement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mockPaymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        method.isDefault ? "border-amber-500 bg-amber-500/10" : "border-gray-800 bg-gray-900"
                      }`}
                    >
                      <div className="flex items-center">
                        <CreditCard className="h-10 w-10 mr-4 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} •••• {method.last4}
                          </p>
                          <p className="text-sm text-gray-400">
                            Expire le {method.expiryMonth.toString().padStart(2, "0")}/{method.expiryYear}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {method.isDefault && (
                          <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-1 rounded-full mr-4">
                            Par défaut
                          </span>
                        )}
                        <Button variant="ghost" size="sm">
                          Modifier
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button>Ajouter une méthode de paiement</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="exclusive" className="space-y-6">
              <Card className="bg-gray-950 border-gray-800">
                <CardHeader>
                  <CardTitle>Contenu exclusif VIP</CardTitle>
                  <CardDescription>Découvrez le contenu disponible uniquement pour les abonnés VIP</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Films exclusifs</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {exclusiveContent.movies.map((movie) => (
                        <Link key={movie.id} href={`/films/${movie.id}`}>
                          <div className="group relative overflow-hidden rounded-lg">
                            <div className="aspect-[2/3] bg-gray-900">
                              <img
                                src={movie.poster || "/placeholder.svg"}
                                alt={movie.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-2 py-0.5 rounded-full text-xs font-bold">
                              VIP
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 flex items-end">
                              <div className="p-4">
                                <h4 className="font-medium text-white">{movie.title}</h4>
                                <p className="text-sm text-gray-300">{movie.releaseDate.split("-")[0]}</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Séries exclusives</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {exclusiveContent.series.map((series) => (
                        <Link key={series.id} href={`/series/${series.id}`}>
                          <div className="group relative overflow-hidden rounded-lg">
                            <div className="aspect-[2/3] bg-gray-900">
                              <img
                                src={series.poster || "/placeholder.svg"}
                                alt={series.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-2 py-0.5 rounded-full text-xs font-bold">
                              VIP
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 flex items-end">
                              <div className="p-4">
                                <h4 className="font-medium text-white">{series.title}</h4>
                                <p className="text-sm text-gray-300">{series.releaseDate.split("-")[0]}</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/exclusif">
                    <Button className="bg-gradient-to-r from-amber-400 to-yellow-600 text-black hover:from-amber-500 hover:to-yellow-700">
                      Voir tout le contenu exclusif
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
