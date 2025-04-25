"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import SearchBar from "@/components/search-bar"

// Définir le composant VipBadge directement dans ce fichier
function VipBadge() {
  return (
    <span className="ml-1 text-xs bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full font-bold">
      VIP
    </span>
  );
}

export default function Header() {
  // Reste du fichier inchangé...