import type { NextApiRequest, NextApiResponse } from "next";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

type SidebarItemData = {
  id: string;
  label: string;
  icon: string;
  route: string;
  permissions?: string[];
  children?: SidebarItemData[];
};

// Example menu - replace with your real DB/logic
const allSidebarItems: SidebarItemData[] = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    icon: "dashboard",
    route: "/admin",
    permissions: ["admin","manager"],
  },
  {
    id: "users",
    label: "Utilisateurs",
    icon: "users",
    route: "/admin/users",
    permissions: ["admin"],
  },
  {
    id: "content",
    label: "Contenus",
    icon: "film",
    route: "#",
    permissions: ["admin","editor"],
    children: [
      {
        id: "films",
        label: "Films",
        icon: "film",
        route: "/admin/films",
        permissions: ["admin","editor"],
      },
      {
        id: "series",
        label: "Séries",
        icon: "tv",
        route: "/admin/series",
        permissions: ["admin","editor"],
      },
    ],
  },
  {
    id: "settings",
    label: "Paramètres",
    icon: "settings",
    route: "/admin/settings",
    permissions: ["admin"],
  },
];

function filterItemsByRole(items: SidebarItemData[], roles: string[]) {
  return items
    .filter(item => !item.permissions || item.permissions.some(p => roles.includes(p)))
    .map(item => ({
      ...item,
      children: item.children ? filterItemsByRole(item.children, roles) : undefined,
    }));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createRouteHandlerClient({ cookies });
  // Get user from Supabase session (cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fallback to userId from query param if needed
  const userId = user?.id || req.query.userId;

  if (!userId) {
    return res.status(401).json({ error: "Utilisateur non authentifié" });
  }

  // Fetch user roles from Supabase profiles table (adapt to your schema)
  let roles: string[] = [];
  if (userId) {
    // Example: get roles from "profiles" table (adapt field/table if needed)
    const { data, error } = await supabase
      .from("profiles")
      .select("roles")
      .eq("id", userId)
      .single();
    if (data?.roles) {
      // roles can be an array or a comma-separated string depending on your schema
      if (Array.isArray(data.roles)) {
        roles = data.roles;
      } else if (typeof data.roles === "string") {
        roles = data.roles.split(",").map((r: string) => r.trim());
      }
    }
    // Optionally, fallback if no roles found
    if (!roles.length) roles = ["user"];
  }

  // Filter menu by permissions
  const sidebarItems = filterItemsByRole(allSidebarItems, roles);

  res.status(200).json(sidebarItems);
}