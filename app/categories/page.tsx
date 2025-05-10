'use client';

import Link from 'next/link';
import { Film, Tv, Sparkles, Flame, Laugh, Star, Users, Globe, Rocket, BookOpen, Award } from 'lucide-react';

const categories = [
  {
    title: 'Films',
    description: 'Découvrez notre catalogue de films pour tous les goûts.',
    icon: <Film className="w-8 h-8" />,
    color: 'from-indigo-500 to-blue-600',
    href: '/films',
  },
  {
    title: 'Séries',
    description: 'Plongez dans nos séries captivantes et variées.',
    icon: <Tv className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-500',
    href: '/series',
  },
  {
    title: 'VIP',
    description: 'Accédez à des contenus exclusifs réservés aux membres VIP.',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'from-yellow-400 via-amber-500 to-orange-500',
    href: '/vip',
  },
  {
    title: 'Action',
    description: 'Films et séries riches en adrénaline et rebondissements.',
    icon: <Flame className="w-8 h-8" />,
    color: 'from-red-500 to-orange-600',
    href: '/films?genre=action',
  },
  {
    title: 'Comédie',
    description: 'Pour rire, sourire et passer un bon moment.',
    icon: <Laugh className="w-8 h-8" />,
    color: 'from-green-400 to-lime-500',
    href: '/films?genre=comedy',
  },
  {
    title: 'Drame',
    description: 'Des histoires touchantes et inspirantes.',
    icon: <Star className="w-8 h-8" />,
    color: 'from-gray-700 to-gray-900',
    href: '/films?genre=drama',
  },
  {
    title: 'Famille',
    description: 'Des contenus pour petits et grands à partager ensemble.',
    icon: <Users className="w-8 h-8" />,
    color: 'from-pink-400 to-fuchsia-500',
    href: '/films?genre=family',
  },
  {
    title: 'Science-Fiction',
    description: 'Voyages futuristes, mondes parallèles, et technologies avancées.',
    icon: <Rocket className="w-8 h-8" />,
    color: 'from-cyan-500 to-blue-800',
    href: '/films?genre=sci-fi',
  },
  {
    title: 'Aventure',
    description: 'Des épopées palpitantes à travers le monde.',
    icon: <Globe className="w-8 h-8" />,
    color: 'from-teal-400 to-emerald-600',
    href: '/films?genre=adventure',
  },
  {
    title: 'Documentaire',
    description: 'Explorez la réalité sous un nouveau jour.',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'from-yellow-600 to-yellow-900',
    href: '/films?genre=documentary',
  },
  {
    title: 'Primés',
    description: 'Les œuvres récompensées dans les festivals.',
    icon: <Award className="w-8 h-8" />,
    color: 'from-orange-400 to-amber-700',
    href: '/films?filter=awarded',
  },
];

export default function CategoriesPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">
        Explorez les Catégories
      </h1>
      <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
        Parcourez notre sélection de films et séries par catégorie, trouvez des nouveautés, des exclusivités VIP ou choisissez une ambiance selon vos envies.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <Link
            key={cat.title}
            href={cat.href}
            className={`group block rounded-xl shadow-lg bg-gradient-to-br ${cat.color} hover:scale-105 transform transition-all duration-300 relative overflow-hidden`}
          >
            <div className="flex items-center gap-4 p-6">
              <span className="flex-shrink-0 bg-black/20 rounded-full p-3 group-hover:bg-black/40 transition">{cat.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-white mb-1 group-hover:underline">{cat.title}</h2>
                <p className="text-gray-100 text-sm">{cat.description}</p>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 m-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="inline-block bg-black/30 text-white text-xs px-3 py-1 rounded-full">
                Découvrir &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}