import Link from 'next/link';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = "force-dynamic";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-6">
        <WifiOff size={36} className="text-gray-400" />
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Vous êtes hors ligne</h1>
      
      <p className="text-gray-400 max-w-md mb-8">
        Impossible de charger cette page. Vérifiez votre connexion internet et réessayez.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => window.location.reload()}
          className="flex items-center"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Actualiser la page
        </Button>
        
        <Button 
          variant="outline" 
          asChild
        >
          <Link href="/">
            Retour à l'accueil
          </Link>
        </Button>
      </div>
      
      <div className="mt-12 text-sm text-gray-500 max-w-md">
        <h2 className="font-medium mb-3">Contenus disponibles hors ligne :</h2>
        <p>
          Vous pouvez toujours accéder au contenu que vous avez déjà visionné récemment
          ou que vous avez marqué comme favori lors de votre dernière connexion.
        </p>
      </div>
    </div>
  );
}