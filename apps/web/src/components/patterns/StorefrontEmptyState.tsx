import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, FolderSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface StorefrontEmptyStateSuggestion {
  id: string | number;
  label: string;
  href: string;
}

export interface StorefrontEmptyStateProps {
  breadcrumbLabel?: string;
  icon?: React.ReactNode;
  title: string;
  description: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  suggestionsTitle?: string;
  suggestions?: StorefrontEmptyStateSuggestion[];
}

export function StorefrontEmptyState({
  breadcrumbLabel,
  icon,
  title,
  description,
  primaryAction = { label: 'Browse All Products', href: '/shop' },
  secondaryAction = { label: 'Back to Home', href: '/' },
  suggestionsTitle = 'Explore Available Options',
  suggestions = [],
}: StorefrontEmptyStateProps) {
  return (
    <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 md:px-6">
      {breadcrumbLabel && (
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <Link href="/" className="hover:text-brand-600">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="font-semibold text-text">{breadcrumbLabel}</span>
        </nav>
      )}

      <div className="rounded-2xl border border-border bg-white p-8 sm:p-12 text-center shadow-xs">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          {icon ?? <FolderSearch className="h-7 w-7" />}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text">{title}</h1>
        <p className="mt-3 text-sm sm:text-base text-text-muted max-w-lg mx-auto">
          {description}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href={primaryAction.href}>
            <Button>{primaryAction.label}</Button>
          </Link>
          <Link href={secondaryAction.href}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              {secondaryAction.label}
            </Button>
          </Link>
        </div>

        {suggestions.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
              {suggestionsTitle}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="px-4 py-2 rounded-full border border-border bg-surface-1 text-sm font-medium text-text hover:border-brand-500 hover:bg-brand-50/50 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
