'use client';

import Link from 'next/link';
import { Menu, LogOut, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export default function AdminHeaderClient() {
  const { logout } = useAuth();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté de l'interface d'administration.",
      });
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-gray-800 shadow-md z-30 flex items-center justify-between px-4">
      <div className="md:hidden">
        <Button variant="ghost" size="icon" className="p-2">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="flex-1 md:flex-auto">
        <h1 className="text-lg font-semibold md:pl-2">
          StreamFlow <span className="text-indigo-400">Admin</span>
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <Link 
          href="/" 
          target="_blank" 
          className="text-sm text-gray-300 hover:text-white flex items-center"
        >
          <Eye className="h-4 w-4 mr-1" />
          <span className="hidden md:inline">Voir le site</span>
        </Link>
        
        <button
          onClick={handleLogout}
          className="text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded px-3 py-2 flex items-center"
        >
          <LogOut className="h-4 w-4 mr-1" />
          <span className="hidden md:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}