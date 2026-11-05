'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { getShopProducts, getShopMerchants } from '@/features/shop/api';
import { ProductCard } from '@/components/storefront/ProductCard';
import { CategoryFilter } from '@/components/patterns/CategoryFilter';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Pagination } from '@/components/ui/pagination';

import { AdsBanner } from './_components/AdsBanner';
import { ProductCarouselSection } from './_components/ProductCarouselSection';
import { PopularBrands } from './_components/PopularBrands';
import { RelatedSearches } from './_components/RelatedSearches';
import { ShopFilters } from './_components/ShopFilters';
import { Product } from '@/features/products/types';
import { ProductQuickViewModal } from '../merchants/_components/ProductQuickViewModal';

export default function ShopPage() {
    return (
        <React.Suspense fallback={<div className="h-96 flex items-center justify-center" aria-busy="true">Loading…</div>}>
            <ShopContent />
        </React.Suspense>
    );
}

function ShopContent() {
    const searchParams = useSearchParams();
    const selectedCategory = searchParams.get('category');
    const searchTerm = searchParams.get('search');

    const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

    const { data: productsData, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['shop_products', selectedCategory, selectedMerchant, searchTerm],
        queryFn: async () => {
            const res = await getShopProducts({
                categorySlug: selectedCategory || undefined,
                merchantId: selectedMerchant || undefined,
                q: searchTerm || undefined,
            });
            return res.data;
        }
    });

    const { data: merchantsData } = useQuery({
        queryKey: ['shop_merchants'],
        queryFn: async () => (await getShopMerchants()).data
    });

    return (
        <div className="flex mx-auto flex-col mt-20 w-full font-sans animate-in fade-in duration-1000 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Breadcrumbs & Title */}
                <div className="mb-6">
                    <nav className="text-sm text-text-muted mb-2">
                        <Link href="/" className="hover:text-brand-600">Home</Link>
                        <span className="mx-2">&rsaquo;</span>
                        <span className="text-text">Shop</span>
                    </nav>
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-text">{searchTerm ? `Search results for "${searchTerm}"` : `Shop ${selectedCategory ? selectedCategory : 'All Categories'}`}</h1>
                        <Sheet>
                            <SheetTrigger render={<Button variant="outline" className="lg:hidden flex items-center gap-2" />}>
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[340px] overflow-y-auto">
                                <SheetHeader className="mb-4">
                                    <SheetTitle>Filters</SheetTitle>
                                </SheetHeader>
                                <div className="space-y-6">
                                    <CategoryFilter />
                                    <ShopFilters
                                        merchants={merchantsData || []}
                                        selectedMerchant={selectedMerchant}
                                        setSelectedMerchant={setSelectedMerchant}
                                    />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>


                <div className="flex flex-col md:flex-row gap-8 mt-8">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-[240px] shrink-0 hidden lg:block space-y-6 sticky top-40 self-start">
                        <CategoryFilter />
                        <ShopFilters
                            merchants={merchantsData || []}
                            selectedMerchant={selectedMerchant}
                            setSelectedMerchant={setSelectedMerchant}
                        />
                    </aside>

                    {/* Main Product Grid */}
                    <div className="flex-1 min-w-0">


                        {/* Top Bar */}
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm text-text-muted">
                                {isLoadingProducts ? 'Loading...' : `Showing ${productsData?.length || 0} results`}
                            </span>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-text-muted">Sort by:</span>
                                <select className="h-9 px-3 py-1 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                                    <option>Relevance</option>
                                    <option>Newest Arrivals</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                    <option>Highest Rated</option>
                                </select>
                            </div>
                        </div>

                        <AdsBanner />
                        <ProductCarouselSection title="Best Selling" sliceStart={0} sliceEnd={10} />
                        <ProductCarouselSection title="Limited Time Deals" sliceStart={4} sliceEnd={12} />

                        {/* Grid */}
                        {isLoadingProducts ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                            </div>
                        ) : productsData?.length === 0 ? (
                            <EmptyState
                                title={'No products found matching your filters.'}
                                description={'Try adjusting your search or filters.'}
                            />
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {productsData?.map(product => (
                                    <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        <Pagination
                            meta={{
                                page: 1,
                                totalPages: Math.ceil((productsData?.length || 0) / 10),
                                total: productsData?.length || 0,
                            }}
                            variant="numbered"
                            onPageChange={() => {
                            }}
                        />
                    </div>
                </div>

                <PopularBrands />
                <RelatedSearches />
            </div>

            <ProductQuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </div>
    );
}
