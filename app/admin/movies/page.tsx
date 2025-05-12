"use client"

import Link from "next/link"
import { useState } from "react"
import { Film, Search, Plus } from "lucide-react"
import AdminHeader from "@/components/admin/admin-header"

export default function MoviesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  
  return (
    <div className="flex min-h-screen bg-gray-950">
      <div className="flex-1">
        <AdminHeader title="Gestion des films" />
        <main className="pt-20 p-6">
          <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher un film..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64 h-10 bg-gray-800 border border-gray-700 rounded-md text-white"
              />
            </div>
            
            <button 
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un film
            </button>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-950/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Titre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Genres</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="hover:bg-gray-800/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-800 rounded flex items-center justify-center">
                            <Film className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">Film exemple {index + 1}</div>
                            <div className="text-sm text-gray-400">ID: {index + 1}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        2023-12-0{index + 1}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300">
                          Action
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-900/30 text-green-400 border border-green-800">
                          Publié
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        <button className="text-blue-400 hover:text-blue-300 mr-2">Modifier</button>
                        <button className="text-red-400 hover:text-red-300">Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}