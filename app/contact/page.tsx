"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simuler un envoi de formulaire
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitSuccess(true)
      setFormState({
        name: "",
        email: "",
        subject: "",
        message: ""
      })
      
      // Réinitialiser le message de succès après 5 secondes
      setTimeout(() => setSubmitSuccess(false), 5000)
    }, 1500)
  }
  
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Contactez-nous</h1>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-10">
          Une question, un problème, une suggestion ? N&apos;hésitez pas à nous contacter. Notre équipe vous répondra dans les plus brefs délais.
        </p>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Coordonnées */}
          <div className="md:col-span-1 bg-gray-800/30 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-6">Nos coordonnées</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-gray-300 font-medium mb-2">Adresse</h3>
                <p className="text-gray-400">
                  StreamFlow SAS<br />
                  123 Avenue du Streaming<br />
                  75000 Paris, France
                </p>
              </div>
              
              <div>
                <h3 className="text-gray-300 font-medium mb-2">Téléphone</h3>
                <p className="text-gray-400">
                  +221 76 630 43 80
                </p>
              </div>
              
              <div>
                <h3 className="text-gray-300 font-medium mb-2">Email</h3>
                <p className="text-gray-400">
                  sunumarketing@gmail.com
                </p>
              </div>
              
              <div>
                <h3 className="text-gray-300 font-medium mb-2">Horaires</h3>
                <p className="text-gray-400">
                  Lun - Ven: 08:00 - 22:00<br />
                  Sam: 09:00 - 20:00<br />
                  Dim: 10:00 - 18:00
                </p>
              </div>
            </div>
          </div>
          
          {/* Formulaire */}
          <div className="md:col-span-2">
            {submitSuccess ? (
              <div className="bg-green-900/30 border border-green-800 rounded-lg p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-green-500">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h2 className="text-xl font-semibold text-white mb-2">Message envoyé !</h2>
                <p className="text-gray-300">
                  Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                      Nom complet
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formState.name}
                      onChange={handleInputChange}
                      placeholder="Votre nom"
                      required
                      className="w-full bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={handleInputChange}
                      placeholder="votre@email.com"
                      required
                      className="w-full bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300">
                    Sujet
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formState.subject}
                    onChange={handleInputChange}
                    placeholder="Sujet de votre message"
                    required
                    className="w-full bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Votre message"
                    required
                    className="w-full rounded-md bg-gray-800 border border-gray-700 text-white px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}