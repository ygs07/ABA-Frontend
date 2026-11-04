
export default async function JournalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div>Journal Detail {id}</div>;
}
