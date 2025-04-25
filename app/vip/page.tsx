"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Check, Crown, Users, Clock, Sparkles, Smartphone, Download, CreditCard, AlertTriangle } from "lucide-react";
import { upgradeToVIP } from "@/lib/auth";

export default function VIPPage() {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
    name: "",
  });
  
  const plans = {
    monthly: {
      price: "9,99 €",
      billingPeriod: "par mois",
      saving: null,
    },
    annual: {
      price: "99,99 €",
      billingPeriod: "par an",
      saving: "Économisez 20%",
    },
  };
  
  const features = [
    {
      icon: <Sparkles className="w-5 h-5 text-yellow-400" />,
      title: "Contenu premium exclusif",
      description: "Accédez à notre bibliothèque de films et séries exclusifs avant tout le monde.",
    },
    {
      icon: <Clock className="w-5 h-5 text-purple-400" />,
      title: "Avant-premières",
      description: "Regardez les nouveautés en avant-première, plusieurs jours avant leur sortie officielle.",
    },
    {
      icon: <Download className="w-5 h-5 text-blue-400" />,
      title: "Téléchargements illimités",
      description: "Téléchargez vos films et séries préférés pour les regarder hors-ligne.",
    },
    {
      icon: <Smartphone className="w-5 h-5 text-green-400" />,
      title: "Streaming sur tous vos appareils",
      description: "Regardez sur 5 appareils simultanément, où que vous soyez.",
    },
    {
      icon: <Users className="w-5 h-5 text-red-400" />,
      title: "Plusieurs profils",
      description: "Créez jusqu'à 5 profils différents pour toute la famille.",
    },
  ];
  
  const vipExamples = [
    { title: "Dune: Deuxième partie", image: "/images/dune-poster.jpg" },
    { title: "The Batman", image: "/images/batman-poster.jpg" },
    { title: "Joker: Folie à Deux", image: "/images/joker-poster.jpg" },
    { title: "Alien: Romulus", image: "/images/alien-poster.jpg" },
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsProcessing(true);
    
    try {
      // Validate payment info
      if (!validatePaymentInfo()) {
        setError("Veuillez remplir tous les champs de paiement correctement");
        setIsProcessing(false);
        return;
      }
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would process the payment here
      // Then call the upgradeToVIP function
      await upgradeToVIP("user123", selectedPlan, {
        method: "card",
        id: `payment_${Date.now()}`,
        // Don't store the full card details in production!
        last4: paymentInfo.cardNumber.slice(-4),
      });
      
      // Redirect to success page
      window.location.href = "/vip/success";
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors du traitement du paiement");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const validatePaymentInfo = () => {
    return (
      paymentInfo.cardNumber.length >= 16 &&
      paymentInfo.expiry.length === 5 &&
      paymentInfo.cvc.length >= 3 &&
      paymentInfo.name.length > 3
    );
  };
  
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };
  
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };
  
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-amber-900/30 z-0"></div>
        
        {/* Floating Elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute right-[10%] top-20 w-24 h-36 rounded-lg overflow-hidden shadow-2xl transform rotate-6 z-0"
        >
          <Image src="/images/dune-poster.jpg" alt="VIP Movie" fill className="object-cover" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="absolute left-[5%] bottom-20 w-20 h-28 rounded-lg overflow-hidden shadow-2xl transform -rotate-12 z-0"
        >
          <Image src="/images/batman-poster.jpg" alt="VIP Movie" fill className="object-cover" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="absolute right-[20%] bottom-10 w-16 h-24 rounded-lg overflow-hidden shadow-2xl transform rotate-12 z-0"
        >
          <Image src="/images/joker-poster.jpg" alt="VIP Movie" fill className="object-cover" />
        </motion.div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 flex justify-center"
            >
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full shadow-lg">
                <Crown className="w-10 h-10 text-gray-900" />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Devenez membre <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">VIP</span> aujourd'hui
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-300 mb-8"
            >
              Accédez à du contenu exclusif, aux avant-premières et bien plus encore
            </motion.p>
          </div>
        </div>
      </section>
      
      {/* Plan Selection */}
      <section className="py-12 px-4 bg-surface">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Choisissez votre plan</h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-xl border-2 ${
                selectedPlan === "monthly" 
                  ? "border-primary bg-primary/10" 
                  : "border-gray-700 bg-surface-light"
              } transition-all cursor-pointer`}
              onClick={() => setSelectedPlan("monthly")}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-1">Mensuel</h3>
                  <p className="text-gray-400 text-sm">Flexibilité maximale</p>
                </div>
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-primary">
                  {selectedPlan === "monthly" && (
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-end">
                  <span className="text-3xl font-bold">{plans.monthly.price}</span>
                  <span className="text-gray-400 ml-1">{plans.monthly.billingPeriod}</span>
                </div>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>Sans engagement</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>Annulable à tout moment</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>Tous les avantages VIP</span>
                </li>
              </ul>
            </motion.div>
            
            {/* Annual Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-xl border-2 ${
                selectedPlan === "annual" 
                  ? "border-primary bg-primary/10" 
                  : "border-gray-700 bg-surface-light"
              } transition-all cursor-pointer relative overflow-hidden`}
              onClick={() => setSelectedPlan("annual")}
            >
              {/* Best Value Badge */}
              <div className="absolute -right-10 top-5 bg-secondary text-white text-xs font-bold py-1 px-10 transform rotate-45">
                MEILLEUR PRIX
              </div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-1">Annuel</h3>
                  <p className="text-gray-400 text-sm">Économisez 20%</p>
                </div>
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-primary">
                  {selectedPlan === "annual" && (
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-end">
                  <span className="text-3xl font-bold">{plans.annual.price}</span>
                  <span className="text-gray-400 ml-1">{plans.annual.billingPeriod}</span>
                </div>
                <div className="text-secondary text-sm mt-1">Économisez 20% par rapport au forfait mensuel</div>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>Meilleur rapport qualité-prix</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>Accès prioritaire aux nouveautés</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>Tous les avantages VIP</span>
                </li>
              </ul>
            </motion.div>
          </div>
          
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowPaymentForm(true)}
              className="btn-primary bg-gradient-to-r from-amber-500 to-yellow-300 hover:from-amber-600 hover:to-yellow-400 text-black text-lg py-3 px-8"
            >
              <Crown className="w-5 h-5 mr-2" />
              Devenir VIP maintenant
            </button>
            <p className="text-sm text-gray-400 mt-3">
              Annulable à tout moment. Voir nos conditions générales.
            </p>
          </div>
        </div>
      </section>
      
      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-surface border border-gray-800 rounded-xl p-6 w-full max-w-md relative"
          >
            <button
              onClick={() => setShowPaymentForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              &times;
            </button>
            
            <h3 className="text-xl font-bold mb-6">Finaliser votre abonnement VIP</h3>
            
            <div className="bg-surface-light p-4 rounded-lg mb-6">
              <div className="flex justify-between mb-2">
                <span>Plan sélectionné:</span>
                <span className="font-medium">
                  {selectedPlan === "monthly" ? "Mensuel" : "Annuel"}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{plans[selectedPlan].price}</span>
              </div>
            </div>
            
            {error && (
              <div className="mb-6 p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="cardNumber" className="block text-sm font-medium mb-2">
                  Numéro de carte
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="cardNumber"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => setPaymentInfo({
                      ...paymentInfo,
                      cardNumber: formatCardNumber(e.target.value),
                    })}
                    className="w-full bg-surface-light border border-gray-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium mb-2">
                    Date d'expiration
                  </label>
                  <input
                    id="expiry"
                    value={paymentInfo.expiry}
                    onChange={(e) => setPaymentInfo({
                      ...paymentInfo,
                      expiry: formatExpiry(e.target.value),
                    })}
                    className="w-full bg-surface-light border border-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label htmlFor="cvc" className="block text-sm font-medium mb-2">
                    CVC
                  </label>
                  <input
                    id="cvc"
                    value={paymentInfo.cvc}
                    onChange={(e) => setPaymentInfo({
                      ...paymentInfo,
                      cvc: e.target.value.replace(/\D/g, "").slice(0, 4),
                    })}
                    className="w-full bg-surface-light border border-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Nom sur la carte
                </label>
                <input
                  id="name"
                  value={paymentInfo.name}
                  onChange={(e) => setPaymentInfo({
                    ...paymentInfo,
                    name: e.target.value,
                  })}
                  className="w-full bg-surface-light border border-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Jean Dupont"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-300 hover:from-amber-600 hover:to-yellow-400 text-black font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Confirmer l'abonnement
                  </>
                )}
              </button>
            </form>
            
            <p className="text-xs text-gray-400 mt-4 text-center">
              Vos informations de paiement sont sécurisées et cryptées.
            </p>
          </motion.div>
        </div>
      )}
      
      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Avantages VIP</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-surface p-6 rounded-xl border border-gray-800"
              >
                <div className="flex items-center justify-center p-3 bg-surface-light rounded-full w-12 h-12 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* VIP Content Preview */}
      <section className="py-16 px-4 bg-surface">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6">Découvrez le contenu VIP</h2>
          <p className="text-center text-gray-400 max-w-2xl mx-auto mb-12">
            Voici un aperçu des films et séries premium exclusivement disponibles pour nos membres VIP
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {vipExamples.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end">
                  <div className="p-4">
                    <span className="badge-vip mb-2">VIP</span>
                    <h3 className="font-medium">{item.title}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              href="/vip/catalogue"
              className="inline-flex items-center text-primary hover:underline"
            >
              Voir tout le catalogue VIP
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
          
          <div className="space-y-6">
            <div className="bg-surface p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold mb-2">Puis-je annuler mon abonnement VIP ?</h3>
              <p className="text-gray-400">
                Oui, vous pouvez annuler votre abonnement à tout moment. Si vous annulez, vous conserverez l'accès VIP jusqu'à la fin de votre période de facturation.
              </p>
            </div>
            
            <div className="bg-surface p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold mb-2">Est-ce que je peux changer de plan ?</h3>
              <p className="text-gray-400">
                Oui, vous pouvez passer du plan mensuel au plan annuel (ou inversement) à tout moment dans les paramètres de votre compte.
              </p>
            </div>
            
            <div className="bg-surface p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold mb-2">Combien de nouveaux films VIP sont ajoutés chaque mois ?</h3>
              <p className="text-gray-400">
                Nous ajoutons au moins 10 nouveaux films et 5 nouvelles séries exclusives chaque mois pour nos membres VIP.
              </p>
            </div>
            
            <div className="bg-surface p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold mb-2">Puis-je partager mon compte VIP ?</h3>
              <p className="text-gray-400">
                Votre abonnement VIP vous permet de créer jusqu'à 5 profils différents pour les membres de votre famille, et de regarder sur 5 appareils simultanément.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call-to-Action */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-amber-900/30 z-0"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Prêt à passer au niveau supérieur ?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Rejoignez notre communauté VIP et découvrez le meilleur du streaming
            </p>
            
            <button
              onClick={() => setShowPaymentForm(true)}
              className="btn-primary bg-gradient-to-r from-amber-500 to-yellow-300 hover:from-amber-600 hover:to-yellow-400 text-black text-lg py-3 px-8"
            >
              <Crown className="w-5 h-5 mr-2" />
              Devenir VIP maintenant
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}