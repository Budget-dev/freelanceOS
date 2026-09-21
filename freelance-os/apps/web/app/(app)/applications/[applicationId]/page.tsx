export default function ApplicationDetailPage({ params }: { params: { applicationId: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Application Details</h1>
      <p className="text-muted-foreground">Viewing application ID: {params.applicationId}</p>
    </div>
  );
}
