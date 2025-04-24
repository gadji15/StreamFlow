"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({ name: "", email: "", subject: "", message: "" })

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)
    }, 1500)
  }

  return (
    <div className="pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2 font-poppins">Contactez-nous</h1>
        <p className="text-gray-400 mb-8">
          Nous sommes là pour vous aider. N'hésitez pas à nous contacter pour toute question.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-white">Informations de contact</h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-900/50 flex items-center justify-center mr-3">
                    <Mail className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <a
                      href="mailto:contact@streamflow.com"
                      className="text-white hover:text-purple-400 transition-colors duration-300"
                    >
                      contact@streamflow.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-900/50 flex items-center justify-center mr-3">
                    <Phone className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Téléphone</p>
                    <a
                      href="tel:+33123456789"
                      className="text-white hover:text-blue-400 transition-colors duration-300"
                    >
                      +33 1 23 45 67 89
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-900/50 flex items-center justify-center mr-3">
                    <MapPin className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Adresse</p>
                    <p className="text-white">
                      123 Avenue du Streaming
                      <br />
                      75001 Paris, France
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-3 text-white">Heures d'ouverture</h3>
                <div className="space-y-2 text-gray-300">
                  <p>Lundi - Vendredi: 9h - 18h</p>
                  <p>Samedi: 10h - 15h</p>
                  <p>Dimanche: Fermé</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-white">FAQ</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-medium">Comment puis-je réinitialiser mon mot de passe ?</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Vous pouvez réinitialiser votre mot de passe en cliquant sur "Mot de passe oublié" sur la page de
                    connexion.
                  </p>
                </div>
                <div>
                  <h3 className="text-white font-medium">Comment annuler mon abonnement ?</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Vous pouvez annuler votre abonnement à tout moment dans les paramètres de votre compte.
                  </p>
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    Puis-je télécharger des films pour les regarder hors ligne ?
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Oui, cette fonctionnalité est disponible pour les abonnés Premium.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-6 text-white">Envoyez-nous un message</h2>

              {isSubmitted ? (
                <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 text-green-400">
                  <p className="font-medium">Message envoyé avec succès!</p>
                  <p className="text-sm mt-1">Nous vous répondrons dans les plus brefs délais.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="form-label">
                        Nom complet
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="form-input mt-1"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="form-label">
                        Adresse email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="form-input mt-1"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject" className="form-label">
                      Sujet
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="form-input mt-1"
                      placeholder="Comment pouvons-nous vous aider ?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="form-label">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="form-input mt-1 min-h-[150px]"
                      placeholder="Écrivez votre message ici..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="privacy"
                      name="privacy"
                      type="checkbox"
                      required
                      className="h-4 w-4 rounded border-gray-700 text-purple-600 focus:ring-purple-500"
                    />
                    <Label htmlFor="privacy" className="ml-2 block text-sm text-gray-300">
                      J'accepte la{" "}
                      <a
                        href="/confidentialite"
                        className="text-purple-500 hover:text-purple-400 transition-colors duration-300"
                      >
                        politique de confidentialité
                      </a>
                    </Label>
                  </div>

                  <div>
                    <Button type="submit" className="btn-primary w-full md:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Envoi en cours...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Send className="h-4 w-4 mr-2" />
                          Envoyer le message
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
