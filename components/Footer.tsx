import { Github, Twitter, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-black via-gray-900 to-transparent border-t border-gray-800 text-gray-400 py-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <span className="font-bold text-amber-400 text-lg">StreamFlow</span>
          <span className="text-xs opacity-60 ml-2">&copy; {new Date().getFullYear()} Tous droits réservés</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-white transition">
            <Github className="w-5 h-5" />
          </a>
          <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-white transition">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-white transition">
            <Youtube className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  )
}