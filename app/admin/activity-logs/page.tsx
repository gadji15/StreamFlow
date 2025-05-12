'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Filter,
  User,
  Trash,
  Pencil,
  Plus,
  KeyRound,
  RefreshCcw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminHeader from '@/components/admin/admin-header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Structure du log d’admin réel
interface AdminLog {
  id: number;
  admin_id: string | null;
  action: string;
  details: Record<string, any> | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [superAdminRoleId, setSuperAdminRoleId] = useState<number | null>(null);

  // Vérification du rôle super_admin pour l’accès
  useEffect(() => {
    async function fetchCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        const { data: rolesList } = await supabase.from("roles").select("*");
        const superAdminRole = rolesList?.find((r: any) => r.name === "super_admin");
        setSuperAdminRoleId(superAdminRole?.id ?? null);

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

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      // Jointure sur profiles pour afficher l’admin
      const { data, error } = await supabase
        .from('admin_logs')
        .select(`
          *,
          profiles:admin_id (full_name, email, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      setError(error.message || "Erreur lors de la récupération des logs.");
    } finally {
      setLoading(false);
    }
  };

  // Liste des actions pour le filtrage (extraites dynamiquement)
  const actionOptions = Array.from(new Set(logs.map(log => log.action)));

  // Filtrer les logs
  const filteredLogs = logs.filter(log => {
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const detailsString = JSON.stringify(log.details || {}).toLowerCase();
      return (
        (log.profiles?.full_name || '').toLowerCase().includes(searchLower) ||
        (log.profiles?.email || '').toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        detailsString.includes(searchLower)
      );
    }
    return true;
  });

  // Affichage icône action
  const getActionIcon = (action: string) => {
    if (action.includes("ADD_ADMIN")) return <Plus className="h-4 w-4" />;
    if (action.includes("REMOVE_ADMIN")) return <Trash className="h-4 w-4" />;
    if (action.includes("ROLE_CHANGE")) return <KeyRound className="h-4 w-4" />;
    if (action.includes("UPDATE")) return <Pencil className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  // Affichage du badge d’action
  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Si non super_admin, afficher accès refusé
  if (
    currentUser &&
    superAdminRoleId !== null &&
    !currentUser.roles?.includes(superAdminRoleId)
  ) {
    return (
      <div className="min-h-screen flex bg-gray-950">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title="Journaux d'activité" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <Alert className="max-w-xl bg-red-900/10 border-red-700 text-red-700">
              <AlertDescription>
                <b>Accès refusé</b> : Cette page est réservée aux super administrateurs.
              </AlertDescription>
            </Alert>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-950">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Journaux d'activité (admin)" />
        <main className="flex-1 p-6">
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Rechercher dans les logs..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Type d'action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les actions</SelectItem>
                    {actionOptions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {formatAction(action)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={fetchLogs}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
              </div>
            </div>
          </div>
          {error && (
            <Alert className="mb-6 bg-red-900/10 border-red-700 text-red-700">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center p-12 border border-dashed rounded-lg">
              <p className="text-gray-500">Aucune activité trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map(log => (
                <Card key={log.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="bg-gray-800 p-2 rounded-full mr-4">
                        <Avatar className="h-8 w-8">
                          {log.profiles?.avatar_url ? (
                            <AvatarImage src={log.profiles.avatar_url} alt={log.profiles.full_name || ""} />
                          ) : (
                            <AvatarFallback className="bg-purple-900 text-white">
                              {(log.profiles?.full_name || log.profiles?.email || "?").substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <b className="text-white">{log.profiles?.full_name || log.profiles?.email || "?"}</b>
                          <Badge className="ml-2 flex items-center" variant="outline">
                            {getActionIcon(log.action)}
                            <span className="ml-1">{formatAction(log.action)}</span>
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center mb-2">
                          <span className="font-mono mr-2">{log.profiles?.email}</span>
                          <span className="flex items-center ml-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <div className="text-xs bg-gray-900 p-2 rounded mt-2 overflow-x-auto">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}