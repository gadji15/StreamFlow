"use client"

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeader from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Edit, Trash, Shield, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import supabase from "@/lib/supabaseClient";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [openNewAdminDialog, setOpenNewAdminDialog] = useState(false)
  const [openEditAdminDialog, setOpenEditAdminDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "content_manager",
    password: "",
    confirmPassword: "",
    avatar_url: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState("")
  const [currentAdmin, setCurrentAdmin] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Récupérer l’admin courant connecté via Supabase Auth
  useEffect(() => {
    async function fetchCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // On va chercher le profil admin dans la table "admins"
        const { data, error } = await supabase
          .from("admins")
          .select("*")
          .eq("email", user.email)
          .single();
        if (data) setCurrentUser(data);
      }
    }
    fetchCurrentUser();
  }, []);

  // Liste des admins depuis Supabase
  useEffect(() => {
    async function fetchAdmins() {
      setLoading(true);
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setAdmins(data);
      setLoading(false);
    }
    fetchAdmins();
  }, []);

  // Recherche filtrée
  const filteredAdmins = admins.filter(admin =>
    admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Gestion formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validation
  const validateForm = (edit = false) => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Le nom est requis"
    if (!formData.email.trim()) newErrors.email = "L'email est requis"
    if (!formData.email.includes('@')) newErrors.email = "L'email est invalide"
    if (!edit) {
      if (!formData.password) newErrors.password = "Le mot de passe est requis"
      if (formData.password.length < 6) newErrors.password = "Le mot de passe doit contenir au moins 6 caractères"
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Ajout admin (avec création Supabase Auth + table admins)
  const handleNewAdmin = async () => {
    if (!validateForm()) return
    setLoading(true)
    setErrors({})
    try {
      // 1. Créer l'utilisateur dans Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true
      });
      if (signUpError) throw signUpError

      // 2. Ajouter les infos dans la table "admins"
      const { data, error } = await supabase.from("admins").insert([{
        name: formData.name,
        email: formData.email,
        role: formData.role,
        avatar_url: formData.avatar_url || null
      }]);
      if (error) throw error

      setSuccessMessage("Administrateur créé avec succès");
      setAdmins(prev => [
        { ...formData, created_at: new Date().toISOString(), last_login: new Date().toISOString() },
        ...prev
      ]);
      setOpenNewAdminDialog(false)
      setFormData({
        name: "",
        email: "",
        role: "content_manager",
        password: "",
        confirmPassword: "",
        avatar_url: "",
      });
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error: any) {
      setErrors({ submit: error.message || "Erreur lors de la création de l'administrateur" });
    }
    setLoading(false)
  }

  // Edition admin (mise à jour de la table admins)
  const handleEditAdmin = async () => {
    if (!validateForm(true)) return
    setLoading(true)
    setErrors({})
    try {
      const { data, error } = await supabase
        .from("admins")
        .update({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          avatar_url: formData.avatar_url || null
        })
        .eq("id", currentAdmin.id)
        .select();
      if (error) throw error

      setAdmins(prev => prev.map(a => a.id === currentAdmin.id ? { ...a, ...formData } : a));
      setOpenEditAdminDialog(false);
      setSuccessMessage("Administrateur mis à jour avec succès");
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error: any) {
      setErrors({ submit: error.message || "Erreur lors de la mise à jour" });
    }
    setLoading(false)
  }

  // Suppression admin (table admins + Supabase Auth)
  const handleDeleteAdmin = async () => {
    if (!currentAdmin) return
    setLoading(true)
    setErrors({})
    try {
      // 1. Supprimer dans la table admins
      const { error: tableError } = await supabase
        .from("admins")
        .delete()
        .eq("id", currentAdmin.id);
      if (tableError) throw tableError

      // 2. Récupérer l'user Auth correspondant (par email)
      const { data: usersList, error: getUserErr } = await supabase.auth.admin.listUsers();
      if (getUserErr) throw getUserErr
      const userAuth = usersList.users.find((u: any) => u.email === currentAdmin.email)
      if (userAuth) {
        // 3. Supprimer dans Auth
        await supabase.auth.admin.deleteUser(userAuth.id)
      }
      setAdmins(prev => prev.filter(a => a.id !== currentAdmin.id));
      setOpenDeleteDialog(false)
      setSuccessMessage("Administrateur supprimé avec succès");
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error: any) {
      setErrors({ submit: error.message || "Erreur lors de la suppression" });
    }
    setLoading(false)
  };

  const prepareEditAdmin = (admin: any) => {
    setCurrentAdmin(admin)
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      password: "",
      confirmPassword: "",
      avatar_url: admin.avatar_url || "",
    })
    setOpenEditAdminDialog(true)
  }

  const prepareDeleteAdmin = (admin: any) => {
    setCurrentAdmin(admin)
    setOpenDeleteDialog(true)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Badge className="bg-red-500/20 text-red-400">Super Admin</Badge>
      case "content_manager":
        return <Badge className="bg-blue-500/20 text-blue-400">Gestionnaire de contenu</Badge>
      case "moderator":
        return <Badge className="bg-green-500/20 text-green-400">Modérateur</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">{role}</Badge>
    }
  }

  const canEditAdmin = (admin: any) => {
    if (currentUser?.role === "super_admin" && admin.id !== currentUser.id) return true
    return false
  }

  const canDeleteAdmin = (admin: any) => {
    if (currentUser?.role === "super_admin" &&
      admin.id !== currentUser.id &&
      admin.role !== "super_admin") return true
    return false
  }

  // --- UI ---
  return (
    <div className="min-h-screen bg-gray-950 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Gestion des administrateurs" />
        <main className="flex-1 p-6">
          {successMessage && (
            <Alert className="mb-6 bg-green-900/20 border-green-800 text-green-400">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between items-center mb-6">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-800 text-white"
              />
            </div>

            {currentUser?.role === "super_admin" && (
              <Dialog open={openNewAdminDialog} onOpenChange={setOpenNewAdminDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Ajouter un administrateur
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-800 text-white">
                  <DialogHeader>
                    <DialogTitle>Ajouter un administrateur</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Créez un nouveau compte administrateur pour gérer la plateforme.
                    </DialogDescription>
                  </DialogHeader>
                  {errors.submit && (
                    <Alert className="bg-red-900/20 border-red-800 text-red-400">
                      <AlertDescription>{errors.submit}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Jean Dupont"
                      />
                      {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Adresse email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="jean.dupont@exemple.com"
                      />
                      {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rôle</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          <SelectItem value="content_manager">Gestionnaire de contenu</SelectItem>
                          <SelectItem value="moderator">Modérateur</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="avatar_url">Photo (URL)</Label>
                      <Input
                        id="avatar_url"
                        name="avatar_url"
                        value={formData.avatar_url}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="bg-gray-800 border-gray-700 text-white pr-10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="••••••••"
                      />
                      {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenNewAdminDialog(false)} className="bg-gray-800 border-gray-700 text-white">
                      Annuler
                    </Button>
                    <Button onClick={handleNewAdmin} className="bg-purple-600 hover:bg-purple-700" disabled={loading}>
                      {loading ? "Création en cours..." : "Créer l'administrateur"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-gray-900">
                  <TableHead className="text-gray-400">Administrateur</TableHead>
                  <TableHead className="text-gray-400">Email</TableHead>
                  <TableHead className="text-gray-400">Rôle</TableHead>
                  <TableHead className="text-gray-400">Date de création</TableHead>
                  <TableHead className="text-gray-400">Dernière connexion</TableHead>
                  <TableHead className="text-gray-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                      Chargement des administrateurs...
                    </TableCell>
                  </TableRow>
                ) : filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                      Aucun administrateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((admin) => (
                    <TableRow key={admin.id} className="border-gray-800 hover:bg-gray-800/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            {admin.avatar_url ? (
                              <AvatarImage src={admin.avatar_url} alt={admin.name} />
                            ) : (
                              <AvatarFallback className="bg-purple-900 text-white">
                                {admin.name?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="text-white">{admin.name}</div>
                            {admin.id === currentUser?.id && (
                              <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700">
                                Vous
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{admin.email}</TableCell>
                      <TableCell>{getRoleBadge(admin.role)}</TableCell>
                      <TableCell className="text-gray-300">
                        {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {admin.last_login ? new Date(admin.last_login).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {canEditAdmin(admin) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => prepareEditAdmin(admin)}
                              className="h-8 w-8 text-gray-400 hover:text-white"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDeleteAdmin(admin) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => prepareDeleteAdmin(admin)}
                              className="h-8 w-8 text-gray-400 hover:text-red-500"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Dialog Modifier administrateur */}
          <Dialog open={openEditAdminDialog} onOpenChange={setOpenEditAdminDialog}>
            <DialogContent className="bg-gray-900 border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>Modifier un administrateur</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Modifiez les informations de l'administrateur.
                </DialogDescription>
              </DialogHeader>
              {errors.submit && (
                <Alert className="bg-red-900/20 border-red-800 text-red-400">
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nom complet</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Adresse email</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Rôle</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="content_manager">Gestionnaire de contenu</SelectItem>
                      <SelectItem value="moderator">Modérateur</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-avatar_url">Photo (URL)</Label>
                  <Input
                    id="edit-avatar_url"
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenEditAdminDialog(false)} className="bg-gray-800 border-gray-700 text-white">
                  Annuler
                </Button>
                <Button onClick={handleEditAdmin} className="bg-purple-600 hover:bg-purple-700" disabled={loading}>
                  {loading ? "Mise à jour en cours..." : "Enregistrer les modifications"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog Supprimer administrateur */}
          <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
            <DialogContent className="bg-gray-900 border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>Supprimer un administrateur</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Êtes-vous sûr de vouloir supprimer cet administrateur ? Cette action est irréversible.
                </DialogDescription>
              </DialogHeader>
              {errors.submit && (
                <Alert className="bg-red-900/20 border-red-800 text-red-400">
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}
              {currentAdmin && (
                <div className="py-4">
                  <div className="flex items-center bg-red-900/20 p-4 rounded-md border border-red-800">
                    <Shield className="h-10 w-10 text-red-400 mr-4" />
                    <div>
                      <p className="text-white font-medium">{currentAdmin.name}</p>
                      <p className="text-gray-400">{currentAdmin.email}</p>
                      <div className="mt-1">{getRoleBadge(currentAdmin.role)}</div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDeleteDialog(false)} className="bg-gray-800 border-gray-700 text-white">
                  Annuler
                </Button>
                <Button variant="destructive" onClick={handleDeleteAdmin} disabled={loading}>
                  {loading ? "Suppression en cours..." : "Supprimer définitivement"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}prev, [name]: value }))
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) newErrors.name = "Le nom est requis"
    if (!formData.email.trim()) newErrors.email = "L'email est requis"
    if (!formData.email.includes('@')) newErrors.email = "L'email est invalide"
    
    if (!openEditAdminDialog) {
      if (!formData.password) newErrors.password = "Le mot de passe est requis"
      if (formData.password.length < 6) newErrors.password = "Le mot de passe doit contenir au moins 6 caractères"
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleNewAdmin = async () => {
    if (!validateForm()) return
    
    try {
      setLoading(true)
      
      // Simuler la création d'un nouvel administrateur
      const newAdmin = await firebase.createAdmin({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        // Dans une app réelle, le mot de passe serait haché
      })
      
      setAdmins(prev => [...prev, newAdmin])
      setOpenNewAdminDialog(false)
      setSuccessMessage("Administrateur créé avec succès")
      
      // Réinitialiser le formulaire
      setFormData({
        name: "",
        email: "",
        role: "content_manager",
        password: "",
        confirmPassword: "",
      })
      
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Erreur lors de la création de l'administrateur:", error)
      setErrors({ submit: "Une erreur est survenue lors de la création de l'administrateur" })
    } finally {
      setLoading(false)
    }
  }
  
  const handleEditAdmin = async () => {
    if (!validateForm()) return
    
    try {
      setLoading(true)
      
      // Simuler la mise à jour d'un administrateur
      const updatedAdmin = await firebase.updateAdmin(currentAdmin.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      })
      
      setAdmins(prev => prev.map(admin => admin.id === currentAdmin.id ? updatedAdmin : admin))
      setOpenEditAdminDialog(false)
      setSuccessMessage("Administrateur mis à jour avec succès")
      
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'administrateur:", error)
      setErrors({ submit: "Une erreur est survenue lors de la mise à jour de l'administrateur" })
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteAdmin = async () => {
    if (!currentAdmin) return
    
    try {
      setLoading(true)
      
      // Simuler la suppression d'un administrateur
      await firebase.deleteAdmin(currentAdmin.id)
      
      setAdmins(prev => prev.filter(admin => admin.id !== currentAdmin.id))
      setOpenDeleteDialog(false)
      setSuccessMessage("Administrateur supprimé avec succès")
      
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Erreur lors de la suppression de l'administrateur:", error)
    } finally {
      setLoading(false)
    }
  }
  
  const prepareEditAdmin = (admin: any) => {
    setCurrentAdmin(admin)
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      password: "",
      confirmPassword: "",
    })
    setOpenEditAdminDialog(true)
  }
  
  const prepareDeleteAdmin = (admin: any) => {
    setCurrentAdmin(admin)
    setOpenDeleteDialog(true)
  }
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Badge className="bg-red-500/20 text-red-400">Super Admin</Badge>
      case "content_manager":
        return <Badge className="bg-blue-500/20 text-blue-400">Gestionnaire de contenu</Badge>
      case "moderator":
        return <Badge className="bg-green-500/20 text-green-400">Modérateur</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">{role}</Badge>
    }
  }
  
  const canEditAdmin = (admin: any) => {
    // Un super admin peut modifier n'importe qui sauf lui-même
    if (currentUser?.role === "super_admin" && admin.id !== currentUser.id) return true
    return false
  }
  
  const canDeleteAdmin = (admin: any) => {
    // Un super admin peut supprimer n'importe qui sauf lui-même
    // et pas d'autres super admins
    if (currentUser?.role === "super_admin" && 
        admin.id !== currentUser.id && 
        admin.role !== "super_admin") return true
    return false
  }
  
  return (
    <div className="min-h-screen bg-gray-950 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Gestion des administrateurs" />
        <main className="flex-1 p-6">
          {successMessage && (
            <Alert className="mb-6 bg-green-900/20 border-green-800 text-green-400">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
        
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-800 text-white"
              />
            </div>
            
            {currentUser?.role === "super_admin" && (
              <Dialog open={openNewAdminDialog} onOpenChange={setOpenNewAdminDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Ajouter un administrateur
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-800 text-white">
                  <DialogHeader>
                    <DialogTitle>Ajouter un administrateur</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Créez un nouveau compte administrateur pour gérer la plateforme.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {errors.submit && (
                    <Alert className="bg-red-900/20 border-red-800 text-red-400">
                      <AlertDescription>{errors.submit}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Jean Dupont"
                      />
                      {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Adresse email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="jean.dupont@exemple.com"
                      />
                      {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Rôle</Label>
                      <Select 
                        value={formData.role} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          <SelectItem value="content_manager">Gestionnaire de contenu</SelectItem>
                          <SelectItem value="moderator">Modérateur</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="bg-gray-800 border-gray-700 text-white pr-10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="••••••••"
                      />
                      {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenNewAdminDialog(false)} className="bg-gray-800 border-gray-700 text-white">
                      Annuler
                    </Button>
                    <Button onClick={handleNewAdmin} className="bg-purple-600 hover:bg-purple-700" disabled={loading}>
                      {loading ? "Création en cours..." : "Créer l'administrateur"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-gray-900">
                  <TableHead className="text-gray-400">Administrateur</TableHead>
                  <TableHead className="text-gray-400">Email</TableHead>
                  <TableHead className="text-gray-400">Rôle</TableHead>
                  <TableHead className="text-gray-400">Date de création</TableHead>
                  <TableHead className="text-gray-400">Dernière connexion</TableHead>
                  <TableHead className="text-gray-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                      Chargement des administrateurs...
                    </TableCell>
                  </TableRow>
                ) : filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                      Aucun administrateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((admin) => (
                    <TableRow key={admin.id} className="border-gray-800 hover:bg-gray-800/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback className="bg-purple-900 text-white">
                              {admin.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-white">{admin.name}</div>
                            {admin.id === currentUser?.id && (
                              <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700">
                                Vous
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{admin.email}</TableCell>
                      <TableCell>{getRoleBadge(admin.role)}</TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(admin.lastLogin).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {canEditAdmin(admin) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => prepareEditAdmin(admin)}
                              className="h-8 w-8 text-gray-400 hover:text-white"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {canDeleteAdmin(admin) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => prepareDeleteAdmin(admin)}
                              className="h-8 w-8 text-gray-400 hover:text-red-500"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Dialog Modifier administrateur */}
          <Dialog open={openEditAdminDialog} onOpenChange={setOpenEditAdminDialog}>
            <DialogContent className="bg-gray-900 border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>Modifier un administrateur</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Modifiez les informations de l'administrateur.
                </DialogDescription>
              </DialogHeader>
              
              {errors.submit && (
                <Alert className="bg-red-900/20 border-red-800 text-red-400">
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nom complet</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Adresse email</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Rôle</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="content_manager">Gestionnaire de contenu</SelectItem>
                      <SelectItem value="moderator">Modérateur</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenEditAdminDialog(false)} className="bg-gray-800 border-gray-700 text-white">
                  Annuler
                </Button>
                <Button onClick={handleEditAdmin} className="bg-purple-600 hover:bg-purple-700" disabled={loading}>
                  {loading ? "Mise à jour en cours..." : "Enregistrer les modifications"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Dialog Supprimer administrateur */}
          <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
            <DialogContent className="bg-gray-900 border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>Supprimer un administrateur</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Êtes-vous sûr de vouloir supprimer cet administrateur ? Cette action est irréversible.
                </DialogDescription>
              </DialogHeader>
              
              {currentAdmin && (
                <div className="py-4">
                  <div className="flex items-center bg-red-900/20 p-4 rounded-md border border-red-800">
                    <Shield className="h-10 w-10 text-red-400 mr-4" />
                    <div>
                      <p className="text-white font-medium">{currentAdmin.name}</p>
                      <p className="text-gray-400">{currentAdmin.email}</p>
                      <div className="mt-1">{getRoleBadge(currentAdmin.role)}</div>
                    </div>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDeleteDialog(false)} className="bg-gray-800 border-gray-700 text-white">
                  Annuler
                </Button>
                <Button variant="destructive" onClick={handleDeleteAdmin} disabled={loading}>
                  {loading ? "Suppression en cours..." : "Supprimer définitivement"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}