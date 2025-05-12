import type { NextApiRequest, NextApiResponse } from "next";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Helper to check if user has at least one allowed role
function hasAllowedRole(userRoles: string[], allowed: string[]) {
  return userRoles.some((r) => allowed.includes(r));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createRouteHandlerClient({ cookies });

  // Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  // Fetch roles from profiles table (adapt to your schema)
  let roles: string[] = [];
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  if (profile?.roles) {
    if (Array.isArray(profile.roles)) {
      roles = profile.roles;
    } else if (typeof profile.roles === "string") {
      roles = profile.roles.split(",").map((r: string) => r.trim());
    }
  }

  // Authorization: only admin and manager can see users
  if (!hasAllowedRole(roles, ["admin", "manager"])) {
    return res.status(403).json({ error: "Accès refusé" });
  }

  // Fetch users from Supabase (adapt to your schema)
  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select("id, email, full_name, roles")
    .limit(100);

  if (usersError) {
    return res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
  }

  res.status(200).json(users);
}