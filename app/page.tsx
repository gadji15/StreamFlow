'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { Sparkles, Film, Tv, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
// Corrigez cet import pour utiliser un export nommé ou par défaut selon le cas
import HeroSection from '@/components/hero-section';
import ContentSection from '@/components/content-section';
import { useAuth } from '@/hooks/use-auth';

// Le reste du fichier reste identique
export default function HomePage() {
  // ...
}