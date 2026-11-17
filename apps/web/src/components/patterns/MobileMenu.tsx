'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, ArrowLeft, Store, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store';
import { getUserHome } from '@/features/auth/api/auth.api';
import { Category } from '@/features/category/types';
import { getCategoryMenu } from '@/features/category/api';

export function MobileMenu({ isOpen, onClose, navLinks }: { isOpen: boolean, onClose: () => void, navLinks: any[] }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const accountHref = user ? getUserHome(user) : '/auth/login';
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [history, setHistory] = useState<Category[]>([]); // stack of selected categories
  
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await getCategoryMenu();
        const tree = buildTree(res.data);
        setCategories(tree);
      } catch (err) {
        console.error('Failed to load category menu', err);
      }
    };
    fetchMenu();
  }, []);

  const buildTree = (cats: Category[]) => {
    const map = new Map<string, Category>();
    const roots: Category[] = [];
    cats.forEach(c => map.set(c.id, { ...c, children: [] }));
    cats.forEach(c => {
      if (c.parentId) {
        map.get(c.parentId)?.children?.push(map.get(c.id)!);
      } else {
        roots.push(map.get(c.id)!);
      }
    });
    const sortFn = (a: Category, b: Category) => a.sortOrder - b.sortOrder;
    roots.sort(sortFn);
    roots.forEach(r => {
      r.children?.sort(sortFn);
      r.children?.forEach(c => c.children?.sort(sortFn));
    });
    return roots;
  };

  const handleCategoryClick = (cat: Category) => {
    if (cat.children && cat.children.length > 0) {
      setHistory([...history, cat]);
    } else {
      const path = [...history, cat]
        .map((category) => category.slug)
        .filter((slug, index, slugs) => index === 0 || slug !== slugs[index - 1])
        .join('/');
      router.push(`/c/${path}`);
      onClose();
    }
  };

  const currentLevel = history.length === 0 ? categories : history[history.length - 1].children || [];
  const currentCategory = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="fixed inset-0 z-40 bg-white pt-20 pb-6 px-4 overflow-y-auto animate-in slide-in-from-right-full duration-300">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex gap-2 mb-4">
          {history.length > 0 && (
            <button 
              onClick={() => setHistory(history.slice(0, -1))}
              className="p-3 bg-surface-1 rounded-full text-text-muted hover:text-brand-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full h-12 pl-12 pr-4 rounded-full border bg-surface-1 text-base font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-sm"
            />
          </div>
        </div>

        {/* Drill-down Navigation */}
        <div className="flex flex-col space-y-1">
          {history.length === 0 && (
            <div className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Main Menu</div>
          )}
          {currentCategory && (
            <div className="text-xl font-bold text-text mb-4 border-b border-border pb-2">
              {currentCategory.name}
            </div>
          )}

          {currentLevel.map((cat) => (
            <button
              key={cat.id}
              className="px-4 py-4 rounded-2xl text-lg font-bold text-text hover:bg-surface-2 flex items-center justify-between text-left"
              onClick={() => handleCategoryClick(cat)}
            >
              {cat.name}
              {cat.children && cat.children.length > 0 && (
                <ArrowRight className="w-5 h-5 text-text-muted" />
              )}
            </button>
          ))}
          
          {history.length > 0 && currentCategory && (
            <Link
              href={`/c/${history.map((category) => category.slug).join('/')}`}
              className="px-4 py-4 rounded-2xl text-brand-600 font-bold hover:bg-surface-2 flex items-center justify-between text-left mt-2 border border-brand-200 bg-brand-50"
              onClick={onClose}
            >
              View all in {currentCategory.name}
            </Link>
          )}
        </div>

        {/* Featured Vendors (shown at each level if they exist) */}
        <div className="bg-surface-1 rounded-xl p-4 mt-6">
          <h4 className="font-bold text-sm text-text mb-3 uppercase tracking-wide">Featured Vendors</h4>
          <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {[1, 2, 3].map(i => (
              <div key={i} className="min-w-[140px] bg-white p-3 rounded-xl border border-border shrink-0">
                <div className="w-full h-20 bg-surface-2 rounded-lg mb-2"></div>
                <div className="font-bold text-sm text-text line-clamp-1">Vendor {i}</div>
                <div className="text-xs text-text-muted">★ 4.8</div>
              </div>
            ))}
          </div>
        </div>

        {/* Default Links (only at root level) */}
        {history.length === 0 && (
          <>
            <div className="border-t border-border pt-4 mt-4">
              <nav className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="px-4 py-3 rounded-2xl text-base font-bold text-text-muted hover:text-brand-600 hover:bg-surface-2 flex items-center justify-between"
                    onClick={onClose}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-border">
              {isAuthenticated ? (
                <Link
                  href={accountHref}
                  className="flex items-center justify-between px-4 py-4 rounded-2xl bg-brand-50 text-brand-900 hover:bg-brand-100 transition-colors uppercase tracking-wide font-bold"
                  onClick={onClose}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-700 shadow-sm">
                      {user?.name?.[0] || 'J'}{user?.name?.[1] || 'D'}
                    </div>
                    <span>My Account</span>
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href="/auth/register" className="w-full" onClick={onClose}>
                    <Button size="lg" className="w-full rounded-full h-14 text-white font-bold uppercase tracking-wide text-base shadow-md">
                      Register
                    </Button>
                  </Link>
                  <Link href="/auth/login" className="w-full" onClick={onClose}>
                    <Button variant="outline" size="lg" className="w-full rounded-full h-14 font-bold uppercase tracking-wide text-base border-2">
                      Log in
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
