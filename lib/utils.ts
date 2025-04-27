import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine plusieurs classes CSS en une seule chaîne, en résolvant les conflits
 * entre les classes Tailwind.
 * @param inputs - Les classes CSS à combiner
 * @returns Une chaîne de classes CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate un prix en euros
 * @param price - Le prix à formater
 * @returns Une chaîne formatée
 */
export function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

/**
 * Tronque un texte s'il dépasse une certaine longueur
 * @param text - Le texte à tronquer
 * @param maxLength - La longueur maximale
 * @returns Le texte tronqué
 */
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Génère un slug à partir d'un texte
 * @param text - Le texte à transformer en slug
 * @returns Le slug
 */
export function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}