import type { Metadata } from "next"
import AuthGuard from "@/components/admin/auth-guard"

export const metadata: Metadata = {
  title: "StreamFlow Admin",
  description: "Panneau d'administration StreamFlow",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-950">
        {children}
      </div>
    </AuthGuard>
  )
}