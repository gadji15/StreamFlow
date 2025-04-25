"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, Bell, User } from "lucide-react"

export default function AdminHeader({ title = "Tableau de bord" }) {
  return (
    <header className="fixed top-0 right-0 left-16 md:left-64 h-16 bg-gray-900 border-b border-gray-800 shadow-md z-40 px-4 flex items-center justify-between">
      <div className="text-xl font-bold text-white">{title}</div>
      
      <div className="flex items-center space-x-2">
        <button className="p-2 text-gray-400 hover:text-white rounded-full">
          <Bell className="h-5 w-5" />
        </button>
        
        <button className="p-2 text-gray-400 hover:text-white rounded-full">
          <User className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}