import React, { useState, ReactNode, Fragment } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Placeholder permission check - replace with your actual logic
function checkPermission(perms?: string[]): boolean {
  // TODO: Connect to your real permission system
  return !perms || perms.length === 0;
}

// Helper for dynamic icon rendering
// You can extend this to support Heroicons/FontAwesome if needed
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: dynamic(() => import("lucide-react").then(m => m.LayoutDashboard)),
  film: dynamic(() => import("lucide-react").then(m => m.Film)),
  tv: dynamic(() => import("lucide-react").then(m => m.Tv)),
  users: dynamic(() => import("lucide-react").then(m => m.Users)),
  settings: dynamic(() => import("lucide-react").then(m => m.Settings)),
  activity: dynamic(() => import("lucide-react").then(m => m.Activity)),
  plus: dynamic(() => import("lucide-react").then(m => m.PlusSquare)),
  list: dynamic(() => import("lucide-react").then(m => m.ListChecks)),
  external: dynamic(() => import("lucide-react").then(m => m.ExternalLink)),
  help: dynamic(() => import("lucide-react").then(m => m.HelpCircle)),
  bell: dynamic(() => import("lucide-react").then(m => m.Bell)),
  tv2: dynamic(() => import("lucide-react").then(m => m.Tv2)),
  // Ajoutez ici d'autres icônes selon votre mapping API
};

type SidebarItemData = {
  id: string;
  label: string;
  icon: string;
  route: string;
  permissions?: string[];
  children?: SidebarItemData[];
};

type SidebarItemProps = SidebarItemData & {
  level?: number;
  onNavigate?: () => void;
};

export const SidebarItem: React.FC<SidebarItemProps> = ({
  id,
  label,
  icon,
  route,
  permissions,
  children,
  level = 0,
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!checkPermission(permissions)) return null;

  const IconComponent = ICONS[icon] || ICONS["dashboard"];

  const hasChildren = !!children && children.length > 0;

  // Responsive: label hidden (compact) < lg, visible >= lg
  return (
    <li
      className={cn(
        "flex flex-col",
        level > 0 && "ml-4 pl-2 border-l border-gray-800"
      )}
      key={id}
    >
      <Link
        href={route || "#"}
        className={cn(
          "flex items-center p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
          "group",
          "focus:outline-none"
        )}
        onClick={hasChildren ? (e) => { e.preventDefault(); setIsOpen((v) => !v); } : onNavigate}
        aria-expanded={hasChildren ? isOpen : undefined}
        tabIndex={0}
      >
        {/* Icon */}
        {IconComponent && <IconComponent className="h-5 w-5 flex-shrink-0" />}
        {/* Label */}
        <span className={cn(
          "ml-2 transition-all",
          level === 0 ? "hidden lg:inline" : "text-sm"
        )}>
          {label}
        </span>
        {/* Dropdown chevron */}
        {hasChildren && (
          <ChevronDown
            className={cn(
              "ml-auto h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        )}
      </Link>
      {/* Children */}
      {hasChildren && isOpen && (
        <ul className="transition-all">
          {children.map((child) => (
            <SidebarItem
              {...child}
              key={child.id}
              level={level + 1}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default SidebarItem;