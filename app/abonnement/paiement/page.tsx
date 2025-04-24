"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { mockSubscriptionPlans } from "@/lib/mock-data"

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planId = searchParams.get("plan") || "premium"

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")

  // Trouver le plan sélectionné
  const selectedPlan = mockSubscriptionPlans.find((plan) => plan.id === planId) || mockSubscriptionPlans[1]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simuler un traitement de paiement
    setTimeout(() => {
      router.push("/abonnement/confirmation")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <h1 className="text-3xl font-bold mb-8">Finaliser votre abonnement</h1>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit}>
                <Card className="bg-gray-950 border-gray-800 mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <Lock className="h-5 w-5 mr-2 text-green-500" />
                      Mode de paiement
                    </CardTitle>
                    <CardDescription>Toutes les transactions sont sécurisées et chiffrées</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      defaultValue="card"
                      className="space-y-4"
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center cursor-pointer">
                          <CreditCard className="h-5 w-5 mr-2" />
                          Carte bancaire
                        </Label>
                      </div>
                      <div className={paymentMethod === "card" ? "block" : "hidden"}>
                        <div className="space-y-4 mt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <Label htmlFor="cardNumber">Numéro de carte</Label>
                              <Input
                                id="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                className="bg-gray-900 border-gray-700"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="expiry">Date d'expiration</Label>
                              <Input id="expiry" placeholder="MM/AA" className="bg-gray-900 border-gray-700" required />
                            </div>
                            <div>
                              <Label htmlFor="cvc">CVC</Label>
                              <Input id="cvc" placeholder="123" className="bg-gray-900 border-gray-700" required />
                            </div>
                            <div className="col-span-2">
                              <Label htmlFor="nameOnCard">Nom sur la carte</Label>
                              <Input
                                id="nameOnCard"
                                placeholder="J. DUPONT"
                                className="bg-gray-900 border-gray-700"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal" className="cursor-pointer">
                          PayPal
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="applepay" id="applepay" />
                        <Label htmlFor="applepay" className="cursor-pointer">
                          Apple Pay
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                <Card className="bg-gray-950 border-gray-800 mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl">Informations de facturation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">Prénom</Label>
                          <Input id="firstName" className="bg-gray-900 border-gray-700" required />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Nom</Label>
                          <Input id="lastName" className="bg-gray-900 border-gray-700" required />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" className="bg-gray-900 border-gray-700" required />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="address">Adresse</Label>
                          <Input id="address" className="bg-gray-900 border-gray-700" required />
                        </div>
                        <div>
                          <Label htmlFor="postalCode">Code postal</Label>
                          <Input id="postalCode" className="bg-gray-900 border-gray-700" required />
                        </div>
                        <div>
                          <Label htmlFor="city">Ville</Label>
                          <Input id="city" className="bg-gray-900 border-gray-700" required />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-400 to-yellow-600 text-black hover:from-amber-500 hover:to-yellow-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Traitement en cours..." : `Payer ${selectedPlan.price}€`}
                </Button>
              </form>
            </div>

            <div>
              <Card className="bg-gray-950 border-gray-800 sticky top-24">
                <CardHeader>
                  <CardTitle>Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">{selectedPlan.name}</h3>
                      <p className="text-sm text-gray-400">
                        {selectedPlan.billingCycle === "monthly" ? "Facturation mensuelle" : "Facturation annuelle"}
                      </p>
                    </div>

                    <Separator className="bg-gray-800" />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Abonnement</span>
                        <span>{selectedPlan.price}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">TVA (20%)</span>
                        <span>{(selectedPlan.price * 0.2).toFixed(2)}€</span>
                      </div>
                    </div>

                    <Separator className="bg-gray-800" />

                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{(selectedPlan.price * 1.2).toFixed(2)}€</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start">
                  <p className="text-xs text-gray-400 mb-2">
                    En procédant au paiement, vous acceptez nos Conditions Générales d'Utilisation et notre Politique de
                    Confidentialité.
                  </p>
                  <p className="text-xs text-gray-400">
                    Vous pouvez annuler votre abonnement à tout moment depuis votre espace client.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
