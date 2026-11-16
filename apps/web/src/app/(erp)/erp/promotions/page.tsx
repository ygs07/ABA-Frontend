import { PageHeader } from '@/components/patterns/PageHeader';

export default function PromotionsAdminPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Spotlight Applications"
        description="Merchant spotlight applications will be available here once the platform rules and approval workflow are finalised."
      />
      <div className="rounded-xl border border-border bg-surface p-6 text-sm text-text-muted">
        Promotions are no longer offered on Naijahands. Use the storefront spotlight programme when it becomes available.
      </div>
    </div>
  );
}
