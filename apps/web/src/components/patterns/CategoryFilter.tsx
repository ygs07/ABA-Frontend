'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getCategoryMenu } from '@/features/category/api';
import { Category } from '@/features/category/types';
import { ChevronRight } from 'lucide-react';
import { cn } from 'cn';

const buildTree = (cats: Category[]) => {
  const map = new Map<string, Category>();
  const roots: Category[] = [];
  cats.forEach((c) => map.set(c.id, { ...c, children: [] }));
  cats.forEach((c) => {
    const node = map.get(c.id);
    if (!node) return;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
};

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  
  const isCategoryRoute = pathname.startsWith('/c/');
  const currentCategoryPath = isCategoryRoute
    ? pathname.slice(3).split('/').filter(Boolean).join('/')
    : searchParams.get('category') || '';
  
  useEffect(() => {
    let cancelled = false;
    const fetchMenu = async () => {
      try {
        const res = await getCategoryMenu();
        if (!cancelled) {
          setCategories(buildTree(res.data));
        }
      } catch (err) {
        console.error('Failed to load category menu', err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    void fetchMenu();
    return () => {
      cancelled = true;
    };
  }, []);


  const handleSelect = (fullPath: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('page');
    if (isCategoryRoute) {
      router.push(`/c/${fullPath}`);
      return;
    }
    if (currentCategoryPath === fullPath) {
      newParams.delete('category'); // Toggle off if already selected
    } else {
      newParams.set('category', fullPath);
    }
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const renderTree = (nodes: Category[], currentPathPrefix = '') => {
    return (
      <ul className="space-y-1">
        {nodes.map(node => {
          const path = currentPathPrefix ? `${currentPathPrefix}/${node.slug}` : node.slug;
          const isSelected = currentCategoryPath === path || currentCategoryPath.startsWith(path + '/');
          const isExact = currentCategoryPath === path;
          const hasChildren = node.children && node.children.length > 0;
          const isExpanded = expanded[node.id] ?? isSelected;

          return (
            <li key={node.id} className="text-sm">
              <div className="flex items-center gap-1 py-1 px-2 rounded-md hover:bg-surface-1 transition-colors">
                {hasChildren ? (
                  <button 
                    onClick={() => setExpanded(prev => ({ ...prev, [node.id]: !isExpanded }))}
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.name}`}
                    className="p-0.5 text-text-muted hover:text-text"
                  >
                    <ChevronRight className={cn('w-4 h-4 transition-transform duration-300', isExpanded && 'rotate-90')} />
                  </button>
                ) : (
                  <div className="w-5" />
                )}
                
                <button
                  onClick={() => handleSelect(path)}
                  className={cn(
                    "flex-1 text-left font-medium",
                    isExact ? "text-brand-600" : "text-text"
                  )}
                >
                  {node.name}
                  <span className="text-text-muted ml-2 text-xs font-normal">({node.productCount})</span>
                </button>
              </div>
              
              {hasChildren && (
                <div
                  className={cn(
                    'grid transition-[grid-template-rows,opacity] duration-300 ease-in-out',
                    isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  )}
                  aria-hidden={!isExpanded}
                >
                  <div className="overflow-hidden">
                    <div className="ml-4 pl-2 border-l border-border mt-1">
                      {renderTree(node.children!, path)}
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-border rounded-xl p-4 space-y-2">
        <h3 className="font-bold text-text mb-4 text-base">Categories</h3>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-6 bg-surface-2 animate-pulse rounded w-3/4" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white border border-border rounded-xl p-4">
        <h3 className="font-bold text-text mb-2 text-base">Categories</h3>
        <p className="text-sm text-text-muted">No categories available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <h3 className="font-bold text-text mb-4 text-base">Categories</h3>
      {renderTree(categories)}
    </div>
  );
}
