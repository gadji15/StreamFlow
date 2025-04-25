"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Activity } from "lucide-react"
import firebase from "@/lib/admin/firebase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState<string>("all")
  const [filterEntity, setFilterEntity] = useState<string>("all")

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await firebase.getActivityLogs()
        setLogs(data)
      } catch (error) {
        console.error("Erreur lors de la récupération des logs d'activité:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchLogs()
  }, [])
  
  const filteredLogs = logs.filter(log => {
    // Filtrer par recherche
    const matchesSearch = 
      log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filtrer par action
    const matchesAction = filterAction === "all" || log.action === filterAction
    
    // Filtrer par type d'entité
    const matchesEntity = filterEntity === "all" || log.entityType === filterEntity
    
    return matchesSearch && matchesAction && matchesEntity
  })
  
  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return <Badge className="bg-green-500/20 text-green-400">Création</Badge>
      case "UPDATE":
        return <Badge className="bg-blue-500/20 text-blue-400">Modification</Badge>
      case "DELETE":
        return <Badge className="bg-red-500/20 text-red-400">Suppression</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">{action}</Badge>
    }
  }
  
  const getEntityBadge = (entityType: string) => {
    switch (entityType) {
      case "MOVIE":
        return <Badge className="bg-purple-500/20 text-purple-400">Film</Badge>
      case "SERIES":
        return <Badge className="bg-blue-500/20 text-blue-400">Série</Badge>
      case "USER":
        return <Badge className="bg-green-500/20 text-green-400">Utilisateur</Badge>
      case "ADMIN":
        return <Badge className="bg-red-500/20 text-red-400">Admin</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">{entityType}</Badge>
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-950 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Journaux d'activité" />
        <main className="flex-1 p-6">
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Rechercher dans les logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-800 text-white"
                />
              </div>
              
              <div className="w-48">
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="bg-gray-900 border-gray-800 text-white">
                    <SelectValue placeholder="Type d'action" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="all">Toutes les actions</SelectItem>
                    <SelectItem value="CREATE">Création</SelectItem>
                    <SelectItem value="UPDATE">Modification</SelectItem>
                    <SelectItem value="DELETE">Suppression</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-48">
                <Select value={filterEntity} onValueChange={setFilterEntity}>
                  <SelectTrigger className="bg-gray-900 border-gray-800 text-white">
                    <SelectValue placeholder="Type d'entité" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="all">Toutes les entités</SelectItem>
                    <SelectItem value="MOVIE">Films</SelectItem>
                    <SelectItem value="SERIES">Séries</SelectItem>
                    <SelectItem value="USER">Utilisateurs</SelectItem>
                    <SelectItem value="ADMIN">Administrateurs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-gray-900">
                  <TableHead className="text-gray-400">Date & Heure</TableHead>
                  <TableHead className="text-gray-400">Administrateur</TableHead>
                  <TableHead className="text-gray-400">Action</TableHead>
                  <TableHead className="text-gray-400">Type</TableHead>
                  <TableHead className="text-gray-400">Entité</TableHead>
                  <TableHead className="text-gray-400">Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                      Chargement des journaux d'activité...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                      Aucun journal d'activité trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-gray-800 hover:bg-gray-800/50">
                      <TableCell className="text-gray-300">
                        <div>
                          <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white font-medium">{log.adminName}</TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>{getEntityBadge(log.entityType)}</TableCell>
                      <TableCell className="text-white">
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-2 text-gray-500" />
                          {log.entityName}
                          <span className="text-gray-500 text-xs ml-2">(ID: {log.entityId})</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          {log.details.ip}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  )
}