import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: "#", label: "Facebook" },
    { icon: <Twitter className="h-5 w-5" />, href: "#", label: "Twitter" },
    { icon: <Instagram className="h-5 w-5" />, href: "#", label: "Instagram" },
    { icon: <Youtube className="h-5 w-5" />, href: "#", label: "Youtube" },
  ]

  const legalLinks = [
    { href: "/mentions-legales", label: "Mentions légales" },
    { href: "/cgu", label: "Conditions Générales d'Utilisation" },
    { href: "/confidentialite", label: "Politique de confidentialité" },
    { href: "/cookies", label: "Politique de cookies" },
    { href: "/contact", label: "Contact" },
  ]

  const categoryLinks = [
    { href: "/films", label: "Films" },
    { href: "/series", label: "Séries" },
    { href: "/nouveautes", label: "Nouveautés" },
    { href: "/tendances", label: "Tendances" },
  ]

  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span
                className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                StreamFlow
              </span>
            </Link>
            <p className="text-gray-400 text-sm">
              Votre plateforme de streaming pour regarder des films et séries en illimité, avec une expérience
              utilisateur fluide et immersive.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  aria-label={link.label}
                  className="text-gray-400 hover:text-white transition-colors duration-300 neon-glow"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "var(--font-poppins)" }}>
              Catégories
            </h3>
            <ul className="space-y-2">
              {categoryLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "var(--font-poppins)" }}>
              Informations légales
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "var(--font-poppins)" }}>
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                <a href="mailto:contact@streamflow.com" className="hover:text-white transition-colors duration-300">
                  contact@streamflow.com
                </a>
              </li>
              <li className="flex items-center text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                <a href="tel:+33123456789" className="hover:text-white transition-colors duration-300">
                  +33 1 23 45 67 89
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">&copy; {currentYear} StreamFlow. Tous droits réservés.</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link href="/faq" className="text-gray-500 hover:text-white text-sm transition-colors duration-300">
              FAQ
            </Link>
            <Link href="/aide" className="text-gray-500 hover:text-white text-sm transition-colors duration-300">
              Centre d'aide
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
