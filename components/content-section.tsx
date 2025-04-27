import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface ContentSectionProps {
  title: string;
  viewAllLink?: string;
  className?: string;
  children: React.ReactNode;
}

export function ContentSection({ 
  title, 
  viewAllLink, 
  className = '', 
  children 
}: ContentSectionProps) {
  return (
    <section className={`mb-8 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        
        {viewAllLink && (
          <Link 
            href={viewAllLink}
            className="text-sm text-gray-400 hover:text-primary flex items-center"
          >
            Voir tout
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        )}
      </div>
      
      {children}
    </section>
  );
}

export default ContentSection;