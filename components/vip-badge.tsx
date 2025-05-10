import Image from 'next/image';
import { Sparkles } from 'lucide-react';

// Version optimisée du badge VIP
export function VipBadge({ size = 'default', variant = 'default' }) {
  // Utilisation d'une image Cloudinary pour le badge VIP
  // TODO : Remplacer l’URL par celle de Supabase Storage
const badgeUrl = 'https://<project-ref>.supabase.co/storage/v1/object/public/images/vip-badge.png';
  
  // Tailles disponibles
  const sizeClasses = {
    small: 'text-xs px-1.5 py-0.5',
    default: 'text-sm px-2 py-1',
    large: 'text-base px-2.5 py-1'
  };
  
  // Variantes
  const variantClasses = {
    default: 'bg-gradient-to-r from-amber-400 to-yellow-600 text-black',
    outline: 'bg-transparent border border-amber-500 text-amber-500',
    subtle: 'bg-amber-500/20 text-amber-500'
  };
  
  return (
    <div className={`
      rounded-full font-bold inline-flex items-center
      ${sizeClasses[size] || sizeClasses.default}
      ${variantClasses[variant] || variantClasses.default}
    `}>
      <Sparkles className={`
        ${size === 'small' ? 'w-3 h-3 mr-0.5' : size === 'large' ? 'w-5 h-5 mr-1.5' : 'w-4 h-4 mr-1'}
      `} />
      VIP
    </div>
  );
}