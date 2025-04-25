"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader title="Tableau de bord" />
        <main className="pt-20 p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Bienvenue dans l'interface d'administration</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Statistiques */}
            {Array.from({ length: 4 }).map((_, index) => (
              <div 
                key={index} 
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-lg"
              >
                <div className="text-gray-400 mb-2">Statistique {index + 1}</div>
                <div className="text-2xl font-bold text-white">0</div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Graphiques */}
            {Array.from({ length: 2 }).map((_, index) => (
              <div 
                key={index} 
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-lg min-h-[300px] flex items-center justify-center"
              >
                <div className="text-gray-400">Graphique {index + 1}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}