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
import { Search, UserPlus, Trash, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [openNewAdminDialog, setOpenNewAdminDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [formData, setFormData] = useState<{
    user_id: string;
    role_id: number | null;
    full_name: string;
    email: string;
    avatar_url: string;
  }>({
    user_id: "",
    role_id: null,
    full_name: "",
    email: "",
    avatar_url: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Rôles "admin" et "super_admin" (ids)
  const [adminRoleId, setAdminRoleId] = useState<number | null>(null);
  const [superAdminRoleId, setSuperAdminRoleId] = useState<number | null>(null);

  // Récupérer l’utilisateur courant et ses rôles
  useEffect(() => {
    async function fetchCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role_id")
          .eq("user_id", user.id);
        setCurrentUser({
          ...profile,
          user_id: user.id,
          roles: userRoles?.map(ur => ur.role_id) || [],
        });
      }
    }
    fetchCurrentUser();
  }, []);

  // Récupère la liste des rôles
  useEffect(() => {
    async function fetchRoles() {
      const { data } = await supabase.from("roles").select("*");
      setRolesList(data || []);
      if (data) {
        const adminRole = data.find((r: any) => r.name === "admin");
        const superAdminRole = data.find((r: any) => r.name === "super_admin");
        setAdminRoleId(adminRole?.id ?? null);
        setSuperAdminRoleId(superAdminRole?.id ?? null);
      }
    }
    fetchRoles();
  }, []);

  // Liste tous les users ayant le rôle admin OU super_admin
  useEffect(() => {
    async function fetchAdmins() {
      setLoading(true);
      if (adminRoleId === null && superAdminRoleId === null) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select(`
          user_id,
          role_id,
          roles (name),
          profiles (full_name, email, avatar_url, created_at)
        `)
        .in("role_id", [adminRoleId, superAdminRoleId]);
      if (data) setAdmins(data);
      setLoading(false);
    }
    fetchAdmins();
  }, [adminRoleId, superAdminRoleId]);

  // Recherche filtrée
  const filteredAdmins = admins.filter((admin) =>
    admin.profiles.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.profiles.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.roles.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ajout d’un rôle "admin" ou "super_admin" à un user existant
  const handleNewAdmin = async () => {
    if (!formData.user_id || !formData.role_id) {
      setErrors({ submit: "Utilisateur et rôle obligatoires" });
      return;
    }
    setLoading(true);
    try {
      const { error: insertErr } = await supabase
        .from("user_roles")
        .insert([{ user_id: formData.user_id, role_id: formData.role_id }]);
      if (insertErr) throw insertErr;
      await supabase.from("admin_logs").insert([{
        admin_id: currentUser.user_id,
        action: "ADD_ADMIN",
        details: { target_user_id: formData.user_id, role_id: formData.role_id },
      }]);
      setSuccessMessage("Rôle administrateur ajouté avec succès.");
      setOpenNewAdminDialog(false);
      setFormData({ user_id: "", role_id: null, full_name: "", email: "", avatar_url: "" });
    } catch (err: any) {
      setErrors({ submit: err.message || "Erreur lors de l’ajout du rôle admin" });
    }
    setLoading(false);
  };

  // Retirer le rôle d’admin à un user (suppression)
  const handleDeleteAdmin = async () => {
    if (!currentAdmin) return;
    if (currentAdmin.user_id === currentUser.user_id || currentAdmin.role_id === superAdminRoleId) {
      setErrors({ submit: "Impossible de supprimer ce rôle." });
      return;
    }
    setLoading(true);
    try {
      const { error: delErr } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", currentAdmin.user_id)
        .eq("role_id", currentAdmin.role_id);
      if (delErr) throw delErr;
      await supabase.from("admin_logs").insert([{
        admin_id: currentUser.user_id,
        action: "REMOVE_ADMIN",
        details: { target_user_id: currentAdmin.user_id, role_id: currentAdmin.role_id },
      }]);
      setSuccessMessage("Rôle administrateur retiré avec succès.");
      setOpenDeleteDialog(false);
    } catch (err: any) {
      setErrors({ submit: err.message || "Erreur lors de la suppression du rôle admin" });
    }
    setLoading(false);
  };

  // Préparation modale ajout d’admin
  const prepareNewAdmin = () => {
    setFormData({ user_id: "", role_id: adminRoleId, full_name: "", email: "", avatar_url: "" });
    setOpenNewAdminDialog(true);
  };

  // Préparation modale suppression admin
  const prepareDeleteAdmin = (admin: any) => {
    setCurrentAdmin(admin);
    setOpenDeleteDialog(true);
  };

  // UI : badge rôle
  const getRoleBadge = (role_name: string) => {
    switch (role_name) {
      case "super_admin":
        return <Badge className="bg-red-500/20 text-red-400">Super Admin</Badge>
      case "admin":
        return <Badge className="bg-blue-500/20 text-blue-400">Admin</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">{role_name}</Badge>
    }
  };

  // Liste des users éligibles à devenir admin (hors déjà admin/super_admin)
  const [eligibleUsers, setEligibleUsers] = useState<any[]>([]);
  useEffect(() => {
    async function fetchEligibleUsers() {
      const { data: allProfiles } = await supabase.from("profiles").select("id, full_name, email, avatar_url");
      const alreadyAdmins = admins.map(a => a.user_id);
      setEligibleUsers((allProfiles || []).filter((p: any) => !alreadyAdmins.includes(p.id)));
    }
    fetchEligibleUsers();
  }, [admins]);

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

            {currentUser?.roles?.includes(superAdminRoleId) && (
              <Dialog open={openNewAdminDialog} onOpenChange={setOpenNewAdminDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={prepareNewAdmin}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Ajouter un administrateur
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-800 text-white">
                  <DialogHeader>
                    <DialogTitle>Ajouter un administrateur</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Sélectionnez un utilisateur à promouvoir administrateur.
                    </DialogDescription>
                  </DialogHeader>
                  {errors.submit && (
                    <Alert className="bg-red-900/20 border-red-800 text-red-400">
                      <AlertDescription>{errors.submit}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="user_id">Utilisateur</Label>
                      <Select
                        value={formData.user_id}
                        onValueChange={(value) => {
                          const selected = eligibleUsers.find(u => u.id === value);
                          setFormData(prev => ({
                            ...prev,
                            user_id: value,
                            full_name: selected?.full_name || "",
                            email: selected?.email || "",
                            avatar_url: selected?.avatar_url || "",
                          }))
                        }}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Sélectionner l'utilisateur" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          {eligibleUsers.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name || user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role_id">Rôle</Label>
                      <Select
                        value={formData.role_id?.toString() || ""}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, role_id: parseInt(value) }))}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Sélectionner le rôle" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          {rolesList.filter(r => ["admin", "super_admin"].includes(r.name)).map((role: any) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.name === "admin" ? "Admin" : "Super Admin"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenNewAdminDialog(false)} className="bg-gray-800 border-gray-700 text-white">
                      Annuler
                    </Button>
                    <Button onClick={handleNewAdmin} className="bg-purple-600 hover:bg-purple-700" disabled={loading}>
                      {loading ? "Ajout en cours..." : "Ajouter"}
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
                  <TableHead className="text-gray-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                      Chargement des administrateurs...
                    </TableCell>
                  </TableRow>
                ) : filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                      Aucun administrateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((admin: any) => (
                    <TableRow key={admin.user_id + "_" + admin.role_id} className="border-gray-800 hover:bg-gray-800/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            {admin.profiles.avatar_url ? (
                              <AvatarImage src={admin.profiles.avatar_url} alt={admin.profiles.full_name} />
                            ) : (
                              <AvatarFallback className="bg-purple-900 text-white">
                                {(admin.profiles.full_name || admin.profiles.email || "?").substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="text-white">{admin.profiles.full_name || admin.profiles.email}</div>
                            {admin.user_id === currentUser?.user_id && (
                              <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700">
                                Vous
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{admin.profiles.email}</TableCell>
                      <TableCell>{getRoleBadge(admin.roles.name)}</TableCell>
                      <TableCell className="text-gray-300">
                        {admin.profiles.created_at ? new Date(admin.profiles.created_at).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {currentUser?.roles?.includes(superAdminRoleId) &&
                            admin.user_id !== currentUser.user_id &&
                            admin.role_id !== superAdminRoleId && (
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

          {/* Dialog Supprimer administrateur */}
          <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
            <DialogContent className="bg-gray-900 border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>Retirer le droit d'administration</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Êtes-vous sûr de vouloir retirer le rôle d'administrateur à cet utilisateur ?
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
                      <p className="text-white font-medium">{currentAdmin.profiles.full_name || currentAdmin.profiles.email}</p>
                      <p className="text-gray-400">{currentAdmin.profiles.email}</p>
                      <div className="mt-1">{getRoleBadge(currentAdmin.roles.name)}</div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDeleteDialog(false)} className="bg-gray-800 border-gray-700 text-white">
                  Annuler
                </Button>
                <Button variant="destructive" onClick={handleDeleteAdmin} disabled={loading}>
                  {loading ? "Suppression en cours..." : "Retirer le rôle"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}