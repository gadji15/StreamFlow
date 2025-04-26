import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      {/* Contenu du footer */}
      <div className="container mx-auto px-4 py-12">
        {/* ... le reste du contenu ... */}
      </div>
    </footer>
  )
}

// Ajout d'une exportation par défaut pour être compatible avec les deux styles d'importation
export default Footer;