"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  User,
  Download,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Bell,
  Globe,
  Moon,
  Sun,
  Shield,
} from "lucide-react"
import MobileNavigation from "@/components/mobile/mobile-navigation"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"

export default function ProfilePage() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)

  const menuItems = [
    {
      icon: <Download className="h-5 w-5 text-purple-500" />,
      label: "Mes téléchargements",
      href: "/mobile/downloads",
    },
    {
      icon: <CreditCard className="h-5 w-5 text-blue-500" />,
      label: "Abonnement et facturation",
      href: "/mobile/subscription",
    },
    {
      icon: <Bell className="h-5 w-5 text-red-500" />,
      label: "Notifications",
      href: "/mobile/notifications",
    },
    {
      icon: <Shield className="h-5 w-5 text-green-500" />,
      label: "Confidentialité et sécurité",
      href: "/mobile/privacy",
    },
    {
      icon: <HelpCircle className="h-5 w-5 text-yellow-500" />,
      label: "Aide et support",
      href: "/mobile/help",
    },
    {
      icon: <Globe className="h-5 w-5 text-cyan-500" />,
      label: "Langue",
      value: "Français",
      href: "/mobile/language",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <MobileNavigation />

      <div className="pt-20 px-4">
        <h1 className="text-2xl font-bold text-white mb-6">Profil</h1>

        {/* User Profile */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6 flex items-center">
          <div className="relative h-16 w-16 rounded-full bg-purple-900 flex items-center justify-center mr-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-white font-medium text-lg">Jean Dupont</h2>
            <p className="text-gray-400">jean.dupont@example.com</p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto text-gray-400">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Theme Toggle */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-purple-500 mr-3" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-500 mr-3" />
              )}
              <span className="text-white font-medium">Thème</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Clair</span>
              <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
              <span className="text-gray-400 text-sm">Sombre</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-gray-900 rounded-lg overflow-hidden mb-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center justify-between p-4 ${
                index !== menuItems.length - 1 ? "border-b border-gray-800" : ""
              }`}
            >
              <div className="flex items-center">
                {item.icon}
                <span className="text-white ml-3">{item.label}</span>
              </div>
              <div className="flex items-center">
                {"value" in item && <span className="text-gray-400 mr-2">{item.value}</span>}
                <ChevronRight className="h-5 w-5 text-gray-500" />
              </div>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full border-gray-800 text-red-500 hover:text-red-400 hover:bg-gray-900 hover:border-gray-700"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Se déconnecter
        </Button>

        {/* App Version */}
        <p className="text-center text-gray-500 text-sm mt-6">StreamFlow Mobile v1.0.0</p>
      </div>
    </div>
  )
}
