import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  Film,
  Tv,
  Sparkles,
  User,
  Home,
  HelpCircle,
  Layers,
  MonitorSmartphone,
  Smartphone
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-tr from-gray-900 via-gray-950 to-blue-950 border-t border-gray-800 shadow-inner">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block group">
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-fuchsia-500 to-blue-500 text-transparent bg-clip-text group-hover:scale-110 transition-transform">
                <Film className="inline-block w-7 h-7 mr-2 text-fuchsia-400 group-hover:text-blue-400 transition-colors" />
                StreamFlow
              </h2>
            </Link>
            <p className="text-gray-400 text-sm">
              Votre plateforme de streaming premium pour les films et séries du monde entier.
            </p>
            <div className="flex space-x-4 mt-2">
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-sky-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          {/* Aide et Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Aide et Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="flex items-center text-gray-400 hover:text-fuchsia-400 transition-colors text-sm">
                  <HelpCircle className="w-4 h-4 mr-1" />
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/aide" className="flex items-center text-gray-400 hover:text-fuchsia-400 transition-colors text-sm">
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Aide et Support
                </Link>
              </li>
              <li>
                <Link href="/appareils-compatibles" className="flex items-center text-gray-400 hover:text-fuchsia-400 transition-colors text-sm">
                  <MonitorSmartphone className="w-4 h-4 mr-1" />
                  Appareils compatibles
                </Link>
              </li>
              <li>
                <Link href="/mobile" className="flex items-center text-gray-400 hover:text-fuchsia-400 transition-colors text-sm">
                  <Smartphone className="w-4 h-4 mr-1" />
                  Installer l'application
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-white mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="flex items-center text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  <Home className="w-4 h-4 mr-1" />
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/films" className="flex items-center text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  <Film className="w-4 h-4 mr-1" />
                  Films
                </Link>
              </li>
              <li>
                <Link href="/series" className="flex items-center text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  <Tv className="w-4 h-4 mr-1" />
                  Séries
                </Link>
              </li>
              <li>
                <Link href="/categories" className="flex items-center text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  <Layers className="w-4 h-4 mr-1" />
                  Catégories
                </Link>
              </li>
              <li>
                <Link href="/exclusif" className="flex items-center text-amber-400 hover:text-yellow-400 transition-colors text-sm">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Exclusif VIP
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
                <span className="text-gray-400 text-sm">sunimarketing@gmail.com</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <span className="text-gray-400 text-sm">+221 76 630 43 80</span>
              </li>
              <li className="mt-6">
                <Link href="/contact" className="inline-block bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-fuchsia-500 hover:to-indigo-500 text-white text-sm px-3 py-2 rounded shadow transition-all">
                  Nous contacter
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {currentYear} StreamFlow. Tous droits réservés 🇸🇳.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/conditions-utilisation" className="text-gray-500 hover:text-fuchsia-400 transition-colors">
              Conditions d'utilisation
            </Link>
            <Link href="/confidentialite" className="text-gray-500 hover:text-fuchsia-400 transition-colors">
              Politique de confidentialité
            </Link>
            <Link href="/mentions-legales" className="text-gray-500 hover:text-fuchsia-400 transition-colors">
              Mentions légales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}