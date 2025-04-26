import Link from 'next/link';
import { Search, Home, Film, Tv } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-theme(space.24))] flex flex-col items-center justify-center text-center px-4 py-16">
      <h1 className="text-6xl font-bold text-indigo-500 mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-2">Page non trouvée</h2>
      <p className="text-gray-400 mb-8 max-w-md">
        Oups ! La page que vous recherchez semble s'être égarée dans l'univers numérique.
      </p>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Link href="/" className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors">
          <Home className="mr-2 h-4 w-4" /> Retour à l'accueil
        </Link>
        <Link href="/films" className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors">
          <Film className="mr-2 h-4 w-4" /> Voir les films
        </Link>
        <Link href="/series" className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors">
          <Tv className="mr-2 h-4 w-4" /> Voir les séries
        </Link>
      </div>

      <p className="text-sm text-gray-500">
        Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à <Link href="/contact" className="text-indigo-400 hover:underline">nous contacter</Link>.
      </p>
    </div>
  );
}