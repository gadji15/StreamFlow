"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Heart, Film, Bell, Settings, Shield, CreditCard, LogOut } from "lucide-react";

export default function MonComptePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Simulation de la vérification du statut de connexion
  useEffect(() => {
    // Récupérer les données utilisateur depuis un stockage local ou une API
    const checkLoginStatus = () => {
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!user);
      setIsLoading(false);
    };
    
    // Simuler un délai réseau
    const timer = setTimeout(() => {
      checkLoginStatus();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (!isLoggedIn) {
    return null; // La redirection sera gérée par le useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text mb-8">
        Mon Compte
      </h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="favorites">Favoris</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="subscription">Abonnement</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations Personnelles</CardTitle>
              <CardDescription>
                Gérez vos informations personnelles et vos préférences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row md:space-x-4">
                <div className="mb-4 md:mb-0 flex justify-center">
                  <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center">
                    <UserCircle className="w-24 h-24 text-gray-500" />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom</Label>
                      <Input id="name" defaultValue="Jean Dupont" className="bg-gray-800 border-gray-700" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue="jean.dupont@example.com" className="bg-gray-800 border-gray-700" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input id="username" defaultValue="jean_dupont" className="bg-gray-800 border-gray-700" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Annuler</Button>
              <Button>Enregistrer</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Changer le mot de passe</CardTitle>
              <CardDescription>
                Mettez à jour votre mot de passe pour sécuriser votre compte.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <Input id="current-password" type="password" className="bg-gray-800 border-gray-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input id="new-password" type="password" className="bg-gray-800 border-gray-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input id="confirm-password" type="password" className="bg-gray-800 border-gray-700" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Changer le mot de passe</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="favorites" className="space-y-6">
          <h2 className="text-xl font-semibold">Mes favoris</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="bg-gray-800 rounded-lg overflow-hidden group relative">
                <div className="aspect-[2/3] bg-gray-700 flex items-center justify-center">
                  <Film className="w-12 h-12 text-gray-600" />
                </div>
                <div className="p-3">
                  <h3 className="font-medium">Film favori {item}</h3>
                  <p className="text-sm text-gray-400">Genre • Année</p>
                </div>
                <div className="absolute top-2 right-2">
                  <button className="p-1 bg-gray-800 rounded-full">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {[1, 2, 3, 4, 5].length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Heart className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <p>Vous n'avez pas encore de favoris</p>
              <p className="text-sm mt-2">
                Ajoutez des films et séries à vos favoris en cliquant sur le cœur.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <h2 className="text-xl font-semibold">Historique de visionnage</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-gray-800 p-4 rounded-lg flex items-center gap-4">
                <div className="h-20 w-36 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                  <Film className="w-8 h-8 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Film récemment regardé {item}</h3>
                  <div className="flex items-center text-sm text-gray-400 mt-1">
                    <span>75% terminé</span>
                    <span className="mx-2">•</span>
                    <span>Il y a 3 jours</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full">Voir plus</Button>
        </TabsContent>
        
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-purple-500" />
                Abonnement Standard
              </CardTitle>
              <CardDescription>
                Votre abonnement est actif et sera automatiquement renouvelé.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Prochain paiement</p>
                    <p className="text-gray-400">15 juin 2023</p>
                  </div>
                  <p className="text-xl font-bold">9.99€</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Passez à l'abonnement VIP</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium">Standard</h4>
                        <p className="text-sm text-gray-400">Votre abonnement actuel</p>
                      </div>
                      <p className="font-bold">9.99€/mois</p>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Accès à tous les films et séries standard</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Qualité HD</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>2 écrans simultanés</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-purple-600 relative">
                    <div className="absolute -top-3 right-4 bg-purple-600 text-white px-2 py-1 rounded-md text-xs font-bold">
                      RECOMMANDÉ
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium text-purple-400">VIP</h4>
                        <p className="text-sm text-gray-400">Expérience premium</p>
                      </div>
                      <p className="font-bold">14.99€/mois</p>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Tout le contenu standard</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Contenu exclusif VIP</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Qualité 4K et HDR</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>4 écrans simultanés</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Sans publicité</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                      Passer au VIP
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="flex items-center w-full justify-between">
                <p className="text-sm text-gray-400">Renouvellement automatique</p>
                <Switch defaultChecked />
              </div>
              <Button variant="outline" className="w-full text-red-500 hover:text-red-600">
                Annuler l'abonnement
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Méthodes de paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded mr-4">
                    <div className="text-blue-800 font-bold">VISA</div>
                  </div>
                  <div>
                    <p className="font-medium">Visa se terminant par 4242</p>
                    <p className="text-sm text-gray-400">Expire le 12/25</p>
                  </div>
                </div>
                <div>
                  <Button variant="ghost" size="sm">Modifier</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Ajouter une méthode de paiement</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Choisissez quand et comment vous souhaitez être notifié.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Nouveaux contenus</div>
                  <div className="text-sm text-gray-400">
                    Notifications pour les nouveaux films et séries
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Mises à jour exclusives</div>
                  <div className="text-sm text-gray-400">
                    Informations exclusives sur les prochaines sorties
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Promotions et offres</div>
                  <div className="text-sm text-gray-400">
                    Notifications sur les offres spéciales
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Préférences de lecture</CardTitle>
              <CardDescription>
                Personnalisez votre expérience de visionnage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Lecture automatique</div>
                  <div className="text-sm text-gray-400">
                    Lire automatiquement le prochain épisode
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Aperçus</div>
                  <div className="text-sm text-gray-400">
                    Lire des aperçus lorsque vous survolez le contenu
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Qualité de streaming préférée</div>
                  <div className="text-sm text-gray-400">
                    Sélectionnez la qualité par défaut pour le streaming
                  </div>
                </div>
                <select className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-sm">
                  <option>Auto (Recommandé)</option>
                  <option>HD (720p)</option>
                  <option>Full HD (1080p)</option>
                  <option>4K (2160p)</option>
                </select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Danger</CardTitle>
              <CardDescription>
                Actions irréversibles concernant votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter de tous les appareils
              </Button>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" className="w-full">
                Supprimer le compte
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}