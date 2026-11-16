'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search } from 'lucide-react';
import { FAQ_CATEGORIES, FAQ_ITEMS, FaqCategory } from './faq-data';

export default function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState<'All' | FaqCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesQuery =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-text tracking-tight">Frequently Asked Questions</h1>
        <p className="mt-3 text-base text-text-muted">
          Common questions about shopping, checkout, wallet payments, referrals, and selling on BuyNaija.
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search questions..."
          aria-label="Search FAQ"
          className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {(['All', ...FAQ_CATEGORIES] as const).map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-text-muted border-border hover:border-brand-500 hover:text-text'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-1 p-8 text-center">
          <p className="text-sm text-text-muted">No matching questions found. Try a different keyword or category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="rounded-xl border border-border bg-white overflow-hidden">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-surface-1 transition-colors"
                >
                  <div>
                    <span className="text-xs font-medium text-brand-600 uppercase tracking-wider block mb-1">
                      {item.category}
                    </span>
                    <span className="text-base font-semibold text-text">{item.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-text-muted shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-sm text-text-muted leading-relaxed border-t border-border/60">
                    <p className="pt-4">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-10 rounded-xl border border-border bg-surface-1 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-text">Still need help?</h2>
          <p className="text-sm text-text-muted mt-1">Our support team can assist with specific orders or merchant inquiries.</p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors shrink-0"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
