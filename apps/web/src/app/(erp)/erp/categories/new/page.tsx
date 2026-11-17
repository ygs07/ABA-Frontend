import { PageHeader } from '@/components/patterns/PageHeader';
import { CategoryForm } from '@/features/category/components/CategoryForm';
import {Suspense} from "react";

export default function NewCategoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className="space-y-6 pb-20">
      <PageHeader 
        title="Add Category" 
        description="Create a top-level product category or a subcategory under an existing category."
        backHref="/erp/categories"
      />
      <CategoryForm />
      </div>
    </Suspense>
  );
}
