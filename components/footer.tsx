import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
                StreamFlow
              </h2>
            </Link>
            <p className="text-gray-400 text-sm">
              Votre plateforme de streaming premium pour les films et séries du monde entier.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-white mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white text-sm">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/films" className="text-gray-400 hover:text-white text-sm">
                  Films
                </Link>
              </li>
              <li>
                <Link href="/series" className="text-gray-400 hover:text-white text-sm">
                  Séries
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-white text-sm">
                  Catégories
                </Link>
              </li>
              <li>
                <Link href="/nouveautes" className="text-gray-400 hover:text-white text-sm">
                  Nouveautés
                </Link>
              </li>
              <li>
                <Link href="/exclusif" className="text-gray-400 hover:text-white text-sm">
                  Exclusif VIP
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Aide et Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Aide et Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/compte" className="text-gray-400 hover:text-white text-sm">
                  Mon compte
                </Link>
              </li>
              <li>
                <Link href="/abonnement" className="text-gray-400 hover:text-white text-sm">
                  Abonnement
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/aide" className="text-gray-400 hover:text-white text-sm">
                  Aide et support
                </Link>
              </li>
              <li>
                <Link href="/appareils-compatibles" className="text-gray-400 hover:text-white text-sm">
                  Appareils compatibles
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <span className="text-gray-400 text-sm">support@streamflow.com</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <span className="text-gray-400 text-sm">+33 1 23 45 67 89</span>
              </li>
              <li className="mt-6">
                <Link href="/contact" className="inline-block bg-primary hover:bg-primary/90 text-white text-sm px-3 py-2 rounded">
                  Nous contacter
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {currentYear} StreamFlow. Tous droits réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/conditions-utilisation" className="text-gray-500 hover:text-gray-300">
              Conditions d&apos;utilisation
            </Link>
            <Link href="/confidentialite" className="text-gray-500 hover:text-gray-300">
              Politique de confidentialité
            </Link>
            <Link href="/mentions-legales" className="text-gray-500 hover:text-gray-300">
              Mentions légales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}