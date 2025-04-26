'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre adresse email.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await resetPassword(email);
      
      setSuccess(true);
      
      toast({
        title: "Email envoyé",
        description: "Un email de réinitialisation de mot de passe a été envoyé à votre adresse.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'email de réinitialisation.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la connexion
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Réinitialiser votre mot de passe
          </h1>
          <p className="text-gray-400">
            Nous vous enverrons un email pour réinitialiser votre mot de passe
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-8">
          {success ? (
            <div className="text-center py-6">
              <div className="mx-auto h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <Send className="h-6 w-6 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Email envoyé!</h2>
              <p className="text-gray-400 mb-6">
                Nous avons envoyé un email à <span className="font-medium">{email}</span> avec
                les instructions pour réinitialiser votre mot de passe.
              </p>
              <Button onClick={() => router.push('/login')}>
                Retour à la connexion
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer les instructions
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}