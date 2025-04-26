import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine et fusionne des classes Tailwind sans conflit
 * @param {string[]} inputs - Les classes à combiner
 * @returns {string} Les classes combinées et fusionnées
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Formater un nombre avec des séparateurs de milliers
 * @param {number} num - Le nombre à formater
 * @returns {string} Le nombre formaté
 */
export function formatNumber(num) {
  return new Intl.NumberFormat().format(num)
}

/**
 * Tronquer un texte à une longueur maximale
 * @param {string} text - Le texte à tronquer
 * @param {number} maxLength - La longueur maximale
 * @returns {string} Le texte tronqué
 */
export function truncate(text, maxLength) {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + "..."
}

/**
 * Extraire l'ID YouTube d'une URL
 * @param {string} url - L'URL YouTube
 * @returns {string|null} L'ID YouTube ou null
 */
export function getYoutubeId(url) {
  if (!url) return null
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  
  return (match && match[2].length === 11)
    ? match[2]
    : null
}

/**
 * Convertir un minutage en format heures/minutes
 * @param {number} minutes - Le nombre de minutes
 * @returns {string} Le format "Xh Ymin"
 */
export function formatDuration(minutes) {
  if (!minutes) return "0min"
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) return `${mins}min`
  if (mins === 0) return `${hours}h`
  
  return `${hours}h ${mins}min`
}