export default function AppareilsCompatiblesPage() {
  const devices = [
    {
      category: "Ordinateurs",
      items: [
        {
          name: "Windows PC",
          requirements: "Windows 10 ou supérieur, navigateur récent (Chrome, Firefox, Edge)",
          features: "Qualité HD disponible, téléchargements non disponibles"
        },
        {
          name: "Mac",
          requirements: "macOS 10.14 ou supérieur, navigateur récent (Chrome, Firefox, Safari)",
          features: "Qualité HD disponible, téléchargements non disponibles"
        },
        {
          name: "Chromebook",
          requirements: "Chrome OS récent, navigateur Chrome",
          features: "Qualité HD disponible, téléchargements non disponibles"
        }
      ]
    },
    {
      category: "Smartphones et tablettes",
      items: [
        {
          name: "iPhone et iPad",
          requirements: "iOS/iPadOS 14.0 ou supérieur, application StreamFlow",
          features: "Qualité HD disponible, téléchargements disponibles"
        },
        {
          name: "Android",
          requirements: "Android 8.0 ou supérieur, application StreamFlow",
          features: "Qualité HD disponible, téléchargements disponibles"
        },
        {
          name: "Tablettes Amazon Fire",
          requirements: "Fire OS 7 ou supérieur, application StreamFlow",
          features: "Qualité HD disponible, téléchargements disponibles"
        }
      ]
    },
    {
      category: "Smart TV et Box TV",
      items: [
        {
          name: "Smart TV Samsung",
          requirements: "Modèles 2018 ou plus récents avec Tizen OS",
          features: "Qualité 4K disponible avec abonnement VIP, téléchargements non disponibles"
        },
        {
          name: "Smart TV LG",
          requirements: "Modèles 2018 ou plus récents avec webOS",
          features: "Qualité 4K disponible avec abonnement VIP, téléchargements non disponibles"
        },
        {
          name: "Android TV / Google TV",
          requirements: "Android TV 9.0 ou supérieur, Google TV",
          features: "Qualité 4K disponible avec abonnement VIP, téléchargements non disponibles"
        },
        {
          name: "Apple TV",
          requirements: "Apple TV 4K (toutes générations) ou Apple TV HD, tvOS 14.0 ou supérieur",
          features: "Qualité 4K disponible avec abonnement VIP, téléchargements non disponibles"
        },
        {
          name: "Amazon Fire TV",
          requirements: "Fire TV Stick (2e génération et supérieures), Fire TV Cube",
          features: "Qualité 4K disponible avec abonnement VIP, téléchargements non disponibles"
        },
        {
          name: "Chromecast",
          requirements: "Chromecast 2e génération ou supérieure, Google TV",
          features: "Qualité 4K disponible avec abonnement VIP, téléchargements non disponibles"
        },
        {
          name: "Roku",
          requirements: "Roku Streaming Stick, Streaming Stick+, Ultra ou TV Roku",
          features: "Qualité 4K disponible avec abonnement VIP, téléchargements non disponibles"
        }
      ]
    },
    {
      category: "Consoles de jeux",
      items: [
        {
          name: "PlayStation",
          requirements: "PlayStation 4, PlayStation 5",
          features: "Qualité 4K disponible avec abonnement VIP, téléchargements non disponibles"
        },
        {
          name: "Xbox",
          requirements: "Xbox One, Xbox Series X/S",
          features: "Qualité 4K disponible avec abonnement VIP, téléchargements non disponibles"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Appareils compatibles</h1>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
          StreamFlow est disponible sur une large gamme d&apos;appareils. Découvrez ci-dessous ceux qui sont compatibles avec notre service.
        </p>
        
        <div className="max-w-4xl mx-auto">
          {devices.map((category, i) => (
            <div key={i} className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 border-b border-gray-800 pb-2">
                {category.category}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.items.map((device, j) => (
                  <div key={j} className="bg-gray-800/30 border border-gray-700 rounded-lg p-5">
                    <h3 className="text-lg font-medium mb-3">{device.name}</h3>
                    <div className="text-sm space-y-3">
                      <div>
                        <span className="text-gray-400 block mb-1">Configuration requise :</span>
                        <p className="text-gray-300">{device.requirements}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-1">Fonctionnalités :</span>
                        <p className="text-gray-300">{device.features}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="mt-12 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Configuration Internet recommandée</h2>
            <p className="text-gray-300 mb-4">
              Pour une expérience optimale sur StreamFlow, nous recommandons les débits Internet suivants :
            </p>
            <ul className="space-y-2 text-gray-300">
              <li>• 3 Mbps pour une qualité standard (SD)</li>
              <li>• 5 Mbps pour une qualité haute définition (HD)</li>
              <li>• 15 Mbps pour une qualité Full HD (1080p)</li>
              <li>• 25 Mbps pour une qualité Ultra HD/4K (abonnement VIP uniquement)</li>
            </ul>
            <p className="mt-4 text-gray-400 text-sm">
              Note : StreamFlow ajustera automatiquement la qualité vidéo en fonction de votre connexion internet pour assurer une lecture fluide.
            </p>
          </div>
          
          <div className="mt-10 text-center">
            <h2 className="text-xl font-semibold mb-4">Vous avez des questions ?</h2>
            <p className="text-gray-400 mb-6">
              Notre équipe d&apos;assistance est disponible pour vous aider à configurer StreamFlow sur votre appareil.
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                href="/faq" 
                className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Consulter la FAQ
              </a>
              <a 
                href="/aide" 
                className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Contacter le support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}