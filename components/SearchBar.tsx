'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, Loader2, Film, Tv } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Movie } from '@/lib/supabaseFilms';
import { Series } from '@/lib/supabaseSeries';

type ResultItem = (Movie & { _type: 'film' }) | (Series & { _type: 'series' });

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim() === '') {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const [filmsRes, seriesRes] = await Promise.all([
          supabase
            .from('films')
            .select('id,title,poster,year,isVIP')
            .ilike('title', `%${query.trim()}%`)
            .limit(5),
          supabase
            .from('series')
            .select('id,title,poster,startYear,endYear,isVIP')
            .ilike('title', `%${query.trim()}%`)
            .limit(5),
        ]);
        const films: ResultItem[] =
          (filmsRes.data?.map((f) => ({ ...f, _type: 'film' as const })) as ResultItem[]) || [];
        const series: ResultItem[] =
          (seriesRes.data?.map((s) => ({ ...s, _type: 'series' as const })) as ResultItem[]) || [];
        setResults([...films, ...series]);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    // Cleanup debounce on unmount
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Dropdown open/close management
  useEffect(() => {
    if (dropdownOpen && results.length === 0 && !loading) setDropdownOpen(false);
  }, [results, loading, dropdownOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen && results.length > 0) setDropdownOpen(true);
    if (e.key === 'ArrowDown') {
      setHighlighted((h) => (h < results.length - 1 ? h + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      setHighlighted((h) => (h > 0 ? h - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      if (results[highlighted]) {
        router.push(results[highlighted]._type === 'film'
          ? `/films/${results[highlighted].id}`
          : `/series/${results[highlighted].id}`);
        setDropdownOpen(false);
        setQuery('');
        setHighlighted(-1);
      }
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  };

  // Open dropdown when input focused and query not empty
  const handleFocus = () => {
    if (query.trim()) setDropdownOpen(true);
  };

  return (
    <div className="relative w-full max-w-xs" ref={dropdownRef}>
      <div className="flex items-center w-full">
        <input
          ref={inputRef}
          type="search"
          className="w-full rounded-md pl-10 pr-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition"
          placeholder="Rechercher un film ou une série..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setDropdownOpen(true);
            setHighlighted(-1);
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        <Search className="absolute left-2.5 top-2.5 text-gray-400 w-5 h-5 pointer-events-none" />
      </div>

      {dropdownOpen && (query.trim() || loading) && (
        <div
          className="absolute z-50 mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden"
          style={{ minWidth: '18rem' }}
        >
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-gray-400">
              <Loader2 className="animate-spin w-4 h-4" />
              Recherche...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-gray-400">
              Aucun résultat pour <span className="italic">{query}</span>
            </div>
          ) : (
            <>
              {results.map((item, idx) => (
                <Link
                  key={item._type + item.id}
                  href={item._type === 'film' ? `/films/${item.id}` : `/series/${item.id}`}
                  className={`flex items-center gap-3 px-4 py-2 hover:bg-primary/10 transition cursor-pointer
                    ${highlighted === idx ? 'bg-primary/20' : ''}
                  `}
                  onMouseEnter={() => setHighlighted(idx)}
                  onClick={() => {
                    setDropdownOpen(false);
                    setQuery('');
                    setHighlighted(-1);
                  }}
                >
                  <span className="flex-shrink-0">
                    {item._type === 'film' ? (
                      <Film className="w-6 h-6 text-primary" />
                    ) : (
                      <Tv className="w-6 h-6 text-purple-400" />
                    )}
                  </span>
                  <span className="truncate flex-1">{item.title}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {item._type === 'film'
                      ? item.year || ''
                      : item.startYear
                        ? item.endYear
                          ? `${item.startYear} - ${item.endYear}`
                          : item.startYear
                        : ''}
                  </span>
                  {item.isVIP && (
                    <span className="ml-2 text-amber-400 text-xs font-bold border border-amber-400 px-1 rounded">
                      VIP
                    </span>
                  )}
                </Link>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}