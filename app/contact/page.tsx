"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Check } from "lucide-react";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    
    // Validation simple
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus("error");
      setErrorMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    
    try {
      // Simuler un envoi d'API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Simulation de succès
      setFormStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      
      // Réinitialiser le formulaire après 3 secondes
      setTimeout(() => {
        setFormStatus("idle");
      }, 3000);
    } catch (error) {
      setFormStatus("error");
      setErrorMessage("Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.");
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text mb-8 text-center">
        Contactez-nous
      </h1>
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Nos coordonnées</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-purple-500 mt-1 mr-3" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:support@streamflow.com" className="text-gray-400 hover:text-white">
                    support@streamflow.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-purple-500 mt-1 mr-3" />
                <div>
                  <p className="font-medium">Téléphone</p>
                  <a href="tel:+33123456789" className="text-gray-400 hover:text-white">
                    +33 1 23 45 67 89
                  </a>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-purple-500 mt-1 mr-3" />
                <div>
                  <p className="font-medium">Adresse</p>
                  <p className="text-gray-400">
                    123 Avenue du Streaming<br />
                    75001 Paris, France
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Horaires d'assistance</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p>Lundi - Vendredi</p>
                <p className="text-gray-400">9h - 19h</p>
              </div>
              <div className="flex justify-between">
                <p>Samedi</p>
                <p className="text-gray-400">10h - 17h</p>
              </div>
              <div className="flex justify-between">
                <p>Dimanche</p>
                <p className="text-gray-400">Fermé</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">FAQ</h2>
            <p className="text-gray-400 mb-4">
              Consultez notre section FAQ pour trouver des réponses aux questions les plus fréquentes.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href="/faq">Voir la FAQ</a>
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Envoyez-nous un message</h2>
          
          {formStatus === "success" ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-medium">Message envoyé !</h3>
              <p className="text-gray-400">
                Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  className="bg-gray-700 border-gray-600"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre.email@exemple.com"
                  className="bg-gray-700 border-gray-600"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Sujet</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Sujet de votre message"
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Écrivez votre message ici..."
                  className="bg-gray-700 border-gray-600 min-h-[150px]"
                  required
                />
              </div>
              
              {formStatus === "error" && (
                <div className="p-3 bg-red-500/20 border border-red-500 rounded-md">
                  <p className="text-red-500 text-sm">{errorMessage}</p>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                disabled={formStatus === "submitting"}
              >
                {formStatus === "submitting" ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer le message
                  </>
                )}
              </Button>
              
              <p className="text-xs text-gray-400 text-center mt-4">
                Les champs marqués d'un <span className="text-red-500">*</span> sont obligatoires
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}