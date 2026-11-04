
export default async function EditRulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div>Edit Rule {id}</div>;
}
