
export default async function CommissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div>Commission Detail {id}</div>;
}
