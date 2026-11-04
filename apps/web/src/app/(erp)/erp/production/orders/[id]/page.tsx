
export default async function ProductionOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div>Order Detail {id}</div>;
}
