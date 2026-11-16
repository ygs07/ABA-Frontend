import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function TakeBusinessOnline() {
    return (
        <section className="py-16 bg-brand-50 border-b border-brand-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
                <h2 className="text-3xl font-extrabold text-brand-900 mb-4 animate-in slide-in-from-bottom-4 duration-700">Take Your Business Online</h2>
                <p className="text-lg text-text-muted mb-8">
                    Whether you run a shop, workshop, fashion business, restaurant, or growing brand, BuyNaija gives you a digital storefront to reach millions of buyers nationwide.
                </p>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-sm font-medium text-brand-700">
                    <span className="flex items-center gap-2 hover:text-brand-900 transition-colors cursor-default"><CheckCircle2 className="w-4 h-4" /> Create your storefront</span>
                    <span className="flex items-center gap-2 hover:text-brand-900 transition-colors cursor-default"><CheckCircle2 className="w-4 h-4" /> List your products</span>
                    <span className="flex items-center gap-2 hover:text-brand-900 transition-colors cursor-default"><CheckCircle2 className="w-4 h-4" /> Manage orders</span>
                </div>
                <Link href="/merchants/onboarding">
                    <Button size="lg" className="bg-brand-600 hover:bg-brand-700 text-white rounded-full font-bold px-8 hover:scale-105 hover:shadow-lg transition-all duration-300">
                        Become a Merchant
                    </Button>
                </Link>
            </div>
        </section>
    );
}
