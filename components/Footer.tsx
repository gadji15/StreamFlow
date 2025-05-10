import { Film } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-[#191724] via-[#232336] to-[#16151b] text-gray-200 py-6 mt-auto border-t border-[#232336]">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
          <Film className="w-6 h-6" />
          StreamFlow
          <span className="text-xs text-gray-400 ml-2">&copy; {new Date().getFullYear()}</span>
        </div>
        <div className="text-sm text-gray-400">
          Tous droits réservés &bull; 
          <a href="/mentions-legales" className="ml-2 hover:text-amber-400 transition-colors">Mentions légales</a>
        </div>
      </div>
    </footer>
  )
}