'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CreditCard, Check, ArrowLeft, Lock, 
  CreditCardIcon, Wallet, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { upgradeToVIP } from '@/lib/auth';
import { useAuth } from '@/hooks/use-auth';

export default function PaiementPage() {
  const { user, isLoggedIn, refreshUserData } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams?.get("plan") || "premium";
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  
  // Plans disponibles et leurs prix
  const plans = {
    standard: {
      id: "standard",
      name: "Standard",
      price: 5.99,
      durationMonths: 1
    },
    premium: {
      id: "premium",
      name: "Premium",
      price: 9.99,
      durationMonths: 1
    },
    annual: {
      id: "annual",
      name: "Annuel",
      price: 99.99,
      durationMonths: 12
    }
  };
  
  // Récupérer le plan sélectionné
  const selectedPlan = plans[planId as keyof typeof plans] || plans.premium;
  
  // Effectuer le paiement
  const handlePayment = async () => {
    if (!isLoggedIn || !user) {
      router.push('/login?redirect=' + encodeURIComponent('/abonnement/paiement?plan=' + planId));
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Appeler la fonction de mise à niveau VIP
      const result = await upgradeToVIP(
        user.uid,
        selectedPlan,
        { method: paymentMethod, timestamp: new Date() }
      );
      
      if (result.success) {
        // Rafraîchir les données utilisateur
        await refreshUserData();
        
        // Rediriger vers la page de confirmation
        router.push('/abonnement/confirmation');
      } else {
        alert("Erreur lors du paiement: " + result.message);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Erreur de paiement:", error);
      alert("Une erreur est survenue lors du traitement du paiement");
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link 
          href="/abonnement" 
          className="text-sm flex items-center text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux plans
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Finaliser votre abonnement</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Mode de paiement</CardTitle>
              <CardDescription>Choisissez comment vous souhaitez payer</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={setPaymentMethod}
                className="space-y-4"
              >
                <div className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-700'}`}>
                  <RadioGroupItem value="card" id="card" />
                  <label htmlFor="card" className="flex flex-1 items-center cursor-pointer">
                    <CreditCardIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <p className="font-medium">Carte bancaire</p>
                      <p className="text-sm text-gray-400">Paiement sécurisé par Stripe</p>
                    </div>
                  </label>
                </div>
                
                <div className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer ${paymentMethod === 'paypal' ? 'border-primary bg-primary/5' : 'border-gray-700'}`}>
                  <RadioGroupItem value="paypal" id="paypal" />
                  <label htmlFor="paypal" className="flex flex-1 items-center cursor-pointer">
                    <Wallet className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <p className="font-medium">PayPal</p>
                      <p className="text-sm text-gray-400">Paiement via votre compte PayPal</p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
              
              <div className="mt-6 p-4 border border-amber-600/30 rounded-lg bg-amber-950/20">
                <div className="flex">
                  <Lock className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-gray-300">
                    Vos informations de paiement sont cryptées et sécurisées. Nous ne stockons pas vos données de carte bancaire.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button 
              size="lg" 
              onClick={handlePayment}
              disabled={isProcessing}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
            >
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Traitement en cours...
                </>
              ) : (
                <>
                  Payer {selectedPlan.price.toFixed(2)}€
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Plan sélectionné</h3>
                  <p className="text-amber-400 font-bold">{selectedPlan.name}</p>
                  <p className="text-sm text-gray-400">
                    {selectedPlan.durationMonths === 1 
                      ? 'Facturation mensuelle' 
                      : `Facturation annuelle (${selectedPlan.durationMonths} mois)`}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-700">
                  <h3 className="font-semibold mb-2">Avantages inclus</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Accès à tout le contenu VIP</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Visionnage en HD et 4K</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Sans publicité</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Téléchargements pour visionnage hors-ligne</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start border-t border-gray-700 pt-4">
              <div className="flex justify-between w-full mb-2">
                <span>Prix</span>
                <span>{selectedPlan.price.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between w-full text-lg font-bold">
                <span>Total</span>
                <span>{selectedPlan.price.toFixed(2)}€</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {selectedPlan.durationMonths === 1 
                  ? 'Facturation mensuelle. Annulez à tout moment.' 
                  : `Facturation annuelle de ${selectedPlan.price.toFixed(2)}€. Annulez à tout moment.`}
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}