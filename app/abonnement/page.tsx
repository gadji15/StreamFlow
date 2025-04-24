import type { Metadata } from "next"
import AbonnementPageClient from "./AbonnementPageClient"

export const metadata: Metadata = {
  title: "Abonnements VIP | StreamFlow",
  description:
    "Découvrez nos offres d'abonnement premium pour accéder à du contenu exclusif et des fonctionnalités avancées.",
}

export default function AbonnementPage() {
  return <AbonnementPageClient />
}
