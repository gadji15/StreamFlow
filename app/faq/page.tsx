"use client"

import { useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqItems = [
  {
    question: "Qu'est-ce que StreamFlow ?",
    answer: "StreamFlow est une plateforme de streaming qui offre une large sélection de films et séries en haute qualité. Notre service vous permet de regarder vos contenus préférés quand vous voulez, où vous voulez, sur tous vos appareils connectés."
  },
  {
    question: "Comment fonctionne l'abonnement StreamFlow ?",
    answer: "StreamFlow propose différentes formules d'abonnement mensuel ou annuel. Une fois abonné, vous avez accès à l'intégralité de notre catalogue sans limitation. Nos abonnements sont sans engagement, vous pouvez donc vous désabonner à tout moment."
  },
  {
    question: "Qu'est-ce que l'offre VIP ?",
    answer: "L'offre VIP est notre formule premium qui vous donne accès à des contenus exclusifs en avant-première, des films et séries spécialement sélectionnés, ainsi qu'une qualité vidéo supérieure en 4K UHD avec HDR quand disponible. Les membres VIP profitent également d'une expérience sans publicité."
  },
  {
    question: "Sur quels appareils puis-je utiliser StreamFlow ?",
    answer: "StreamFlow est compatible avec la plupart des appareils connectés : ordinateurs (Windows, Mac), smartphones et tablettes (iOS, Android), téléviseurs connectés (Smart TV), consoles de jeux (PlayStation, Xbox), et lecteurs multimédias (Apple TV, Chromecast, Amazon Fire TV)."
  },
  {
    question: "Puis-je regarder StreamFlow hors connexion ?",
    answer: "Oui, les abonnés peuvent télécharger certains films et épisodes sur leurs appareils mobiles pour les regarder hors connexion. Cette fonctionnalité est disponible sur nos applications iOS et Android."
  },
  {
    question: "Puis-je partager mon compte avec ma famille ?",
    answer: "Selon votre formule d'abonnement, vous pouvez créer jusqu'à 5 profils différents sur un même compte. Chaque profil aura ses propres recommandations et historique de visionnage. StreamFlow est conçu pour être utilisé par les membres d'un même foyer."
  },
  {
    question: "Comment puis-je annuler mon abonnement ?",
    answer: "Vous pouvez annuler votre abonnement à tout moment en vous rendant dans les paramètres de votre compte, section 'Abonnement'. L'annulation prendra effet à la fin de votre période de facturation en cours. Vous continuerez à avoir accès au service jusqu'à cette date."
  },
  {
    question: "StreamFlow propose-t-il des sous-titres et doublages ?",
    answer: "Oui, la majorité de nos contenus proposent des sous-titres et doublages en plusieurs langues. Vous pouvez choisir vos préférences de langue dans les paramètres de votre compte ou directement pendant le visionnage."
  },
  {
    question: "Quelle qualité vidéo est disponible sur StreamFlow ?",
    answer: "StreamFlow adapte automatiquement la qualité vidéo selon votre connexion internet. Nous proposons différentes résolutions : SD (définition standard), HD (haute définition), Full HD (1080p) et 4K UHD (ultra haute définition, disponible avec l'abonnement VIP)."
  },
  {
    question: "Comment puis-je contacter le service client ?",
    answer: "Notre équipe d'assistance est disponible 7j/7, 24h/24. Vous pouvez nous contacter par email à support@streamflow.com, par chat en direct depuis votre compte, ou par téléphone au +33 1 23 45 67 89."
  }
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredFAQs = searchQuery
    ? faqItems.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqItems;
  
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Foire Aux Questions</h1>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-8">
          Trouvez les réponses aux questions les plus fréquemment posées sur StreamFlow, notre service et nos abonnements.
        </p>
        
        {/* Recherche */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une question..."
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {/* Liste FAQ */}
        <div className="max-w-2xl mx-auto">
          {filteredFAQs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-800">
                  <AccordionTrigger className="text-lg font-medium py-4 hover:no-underline hover:text-primary">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300 pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400">Aucun résultat trouvé pour "{searchQuery}"</p>
              <button
                className="mt-4 text-primary hover:underline"
                onClick={() => setSearchQuery("")}
              >
                Réinitialiser la recherche
              </button>
            </div>
          )}
        </div>
        
        {/* Section contact */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <h2 className="text-xl font-semibold mb-4">Vous n&apos;avez pas trouvé votre réponse ?</h2>
          <p className="text-gray-400 mb-6">
            Notre équipe d&apos;assistance est disponible 7j/7, 24h/24 pour répondre à toutes vos questions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="mailto:support@streamflow.com" 
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Nous contacter par email
            </a>
            <a 
              href="tel:+33123456789" 
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Nous appeler
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}