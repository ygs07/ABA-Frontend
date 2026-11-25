'use client';

import { useState, useRef, useEffect, useMemo, KeyboardEvent } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Category } from '@/features/category/types';
import { cn } from 'cn';
import { getCategoryMenu } from '@/features/category/api';
import { CategorySpotlightPanel } from '@/features/spotlight/components/CategorySpotlightPanel';

// Build a 3-level tree from a flat list
const buildMegaMenuTree = (cats: Category[]) => {
  const map = new Map<string, Category>();
  const roots: Category[] = [];

  cats.forEach((c) => {
    map.set(c.id, { ...c, children: [] });
  });

  cats.forEach((c) => {
    if (c.parentId) {
      const parent = map.get(c.parentId);
      if (parent) {
        parent.children?.push(map.get(c.id)!);
      }
    } else {
      roots.push(map.get(c.id)!);
    }
  });

  const sortFn = (a: Category, b: Category) => a.sortOrder - b.sortOrder;
  roots.sort(sortFn);
  roots.forEach((r) => {
    r.children?.sort(sortFn);
    r.children?.forEach((c) => c.children?.sort(sortFn));
  });

  return roots;
};

export function MegaMenu() {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Hover intent timeouts
  const enterTimeout = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: rawCategories } = useQuery({
    queryKey: ['category_menu'],
    queryFn: async () => (await getCategoryMenu()).data,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const categories = useMemo(
    () => (rawCategories ? buildMegaMenuTree(rawCategories) : []),
    [rawCategories],
  );

  const handleMouseEnter = (id: string) => {
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    enterTimeout.current = setTimeout(() => {
      setActiveItem(id);
      setIsOpen(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (enterTimeout.current) clearTimeout(enterTimeout.current);
    leaveTimeout.current = setTimeout(() => {
      setIsOpen(false);
      setActiveItem(null);
    }, 300);
  };

  const handleKeyDown = (e: KeyboardEvent, id: string, index: number) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveItem(id);
      setIsOpen(true);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveItem(null);
    } else if (e.key === 'ArrowRight') {
      // Focus next top-level
      const nextBtn = document.getElementById(`mega-menu-trigger-${index + 1}`);
      nextBtn?.focus();
    } else if (e.key === 'ArrowLeft') {
      // Focus prev top-level
      const prevBtn = document.getElementById(`mega-menu-trigger-${index - 1}`);
      prevBtn?.focus();
    }
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveItem(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const topLevel = categories.slice(0, 8);
  const hasMore = categories.length > 8;
  const activeCategory = categories.find(c => c.id === activeItem);

  if (categories.length === 0) {
    // Loading skeleton
    return (
      <div className="hidden lg:flex w-full bg-surface-1 h-12 border-b border-border items-center justify-center px-6">
        <div className="flex gap-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-24 h-4 bg-surface-2 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex border-b border-border bg-white w-full mx-auto px-2" ref={menuRef} onMouseLeave={handleMouseLeave}>
      <div className="w-full px-6 flex items-center relative h-12">
        <nav className="flex items-center gap-1 h-full" aria-label="Categories">
          {topLevel.map((category, idx) => (
            <button
              key={category.id}
              id={`mega-menu-trigger-${idx}`}
              className={cn(
                "h-full px-4 text-xs font-semibold transition-colors flex items-center border-b-2",
                activeItem === category.id
                  ? "text-brand-700 border-brand-500 bg-brand-50/50"
                  : "text-text-muted border-transparent hover:text-brand-600 hover:bg-surface-1"
              )}
              onMouseEnter={() => handleMouseEnter(category.id)}
              onKeyDown={(e) => handleKeyDown(e, category.id, idx)}
              aria-expanded={isOpen && activeItem === category.id}
              aria-controls={`mega-menu-panel-${category.id}`}
              onClick={() => {
                if (isOpen && activeItem === category.id) {
                  setIsOpen(false);
                  setActiveItem(null);
                } else {
                  setActiveItem(category.id);
                  setIsOpen(true);
                }
              }}
            >
              {category.name}
            </button>
          ))}
          {hasMore && (
            <Link
              href="/categories"
              className="h-full px-3 text-xs font-semibold text-text-muted transition-colors flex items-center hover:text-brand-600 hover:bg-surface-1 border-l border-border"
            >
              More 
            </Link>
          )}
        </nav>

        {/* Panel */}
        {isOpen && activeCategory && (() => {
          const subs = activeCategory.children ?? [];
          const leaves = subs.flatMap(s =>
            (s.children ?? []).map(l => ({ ...l, href: `/c/${activeCategory.slug}/${s.slug}/${l.slug}` }))
          );
          const subLinks = subs.map(s => ({ ...s, href: `/c/${activeCategory.slug}/${s.slug}` }));
          // Column 1: subcategories; Column 2: deeper categories (or the overflow of column 1)
          const half = Math.ceil(subLinks.length / 2);
          const popular = leaves.length > 0 ? subLinks : subLinks.slice(0, half);
          const more = leaves.length > 0 ? leaves.slice(0, 9) : subLinks.slice(half);
          const renderList = (items: { id: string; name: string; href: string }[]) => (
            <ul className="flex flex-col gap-3">
              {items.map(item => (
                <li key={item.id}>
                  <Link href={item.href} className="text-sm text-text hover:text-brand-600 hover:underline" onClick={() => setIsOpen(false)}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          );
          return (
            <div
              id={`mega-menu-panel-${activeCategory.id}`}
              className="absolute top-full left-0 w-full bg-white border border-border shadow-xl rounded-b-xl z-50 p-4 flex gap-6 max-h-[70vh] overflow-auto"
              onMouseEnter={() => {
                if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
              }}
            >
              <div className="w-56 shrink-0">
                <h3 className="text-xs font-bold text-text pb-2 mb-3 border-b border-border">Most popular categories</h3>
                {renderList(popular)}
              </div>
              <div className="w-56 shrink-0">
                <h3 className="text-xs font-bold text-text pb-2 mb-3 border-b border-border">More categories</h3>
                {renderList(more)}
              </div>
              <CategorySpotlightPanel 
                categorySlug={activeCategory.slug} 
                categoryName={activeCategory.name}
                onClose={() => setIsOpen(false)}
              />
            </div>
          );
        })()}
      </div>
    </div>
  );
}
