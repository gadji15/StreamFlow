export default function AidePage() {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Aide et support</h1>
          
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-center text-gray-300 mb-10">
              Besoin d&apos;aide avec StreamFlow ? Notre équipe est là pour vous assister.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Centre d&apos;aide</h2>
                <p className="text-gray-300 mb-6">
                  Consultez notre base de connaissances pour trouver des réponses à vos questions et des guides d&apos;utilisation.
                </p>
                <a 
                  href="/faq" 
                  className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Visiter la FAQ
                </a>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Contacter le support</h2>
                <p className="text-gray-300 mb-6">
                  Notre équipe d&apos;assistance est disponible 7j/7, 24h/24 pour répondre à toutes vos questions.
                </p>
                <a 
                  href="mailto:support@streamflow.com" 
                  className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Envoyer un email
                </a>
              </div>
            </div>
            
            <div className="bg-gray-800/30 rounded-lg p-8 border border-gray-700 mb-12">
              <h2 className="text-xl font-semibold mb-6">Comment pouvons-nous vous aider ?</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-gray-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h16" />
                      <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4Z" />
                    </svg>
                  </div>
                  <h3 className="font-medium mb-2">Abonnement et facturation</h3>
                  <p className="text-sm text-gray-400">
                    Problèmes avec votre abonnement, facturation ou paiement
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-gray-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.48-8.48l8.48-8.48a4 4 0 0 1 5.66 5.66l-7.78 7.78a2 2 0 0 1-2.83-2.83l6.37-6.37" />
                    </svg>
                  </div>
                  <h3 className="font-medium mb-2">Problèmes techniques</h3>
                  <p className="text-sm text-gray-400">
                    Difficultés de connexion, problèmes de lecture ou bugs
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-gray-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                      <path d="M5 3v4" />
                      <path d="M19 17v4" />
                      <path d="M3 5h4" />
                      <path d="M17 19h4" />
                    </svg>
                  </div>
                  <h3 className="font-medium mb-2">Contenu et fonctionnalités</h3>
                  <p className="text-sm text-gray-400">
                    Questions sur les titres disponibles ou les fonctionnalités
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700">
              <h2 className="text-xl font-semibold mb-6">Nous contacter</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium mb-4">Service client</h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-primary flex-shrink-0 mt-1">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>+33 1 23 45 67 89 (7j/7, 24h/24)</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-primary flex-shrink-0 mt-1">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <span>support@streamflow.com</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-primary flex-shrink-0 mt-1">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                      <span>
                        StreamFlow SAS<br />
                        123 Avenue du Streaming<br />
                        75000 Paris, France
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Horaires d&apos;ouverture</h3>
                  <table className="w-full text-gray-300">
                    <tbody>
                      <tr className="border-b border-gray-700">
                        <td className="py-2">Lundi - Vendredi</td>
                        <td className="py-2 text-right">08:00 - 22:00</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-2">Samedi</td>
                        <td className="py-2 text-right">09:00 - 20:00</td>
                      </tr>
                      <tr>
                        <td className="py-2">Dimanche et jours fériés</td>
                        <td className="py-2 text-right">10:00 - 18:00</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-4 text-sm text-gray-400">
                    Notre chat en direct est disponible 24h/24, 7j/7. L&apos;assistance téléphonique est disponible selon les horaires ci-dessus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }