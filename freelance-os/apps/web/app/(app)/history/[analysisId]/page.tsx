export default function AnalysisDetailPage({ params }: { params: { analysisId: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Analysis Details</h1>
      <p className="text-muted-foreground">Viewing analysis ID: {params.analysisId}</p>
    </div>
  );
}
