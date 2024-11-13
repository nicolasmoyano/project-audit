import { useState } from "react";
import { analyzeWebsite, type AnalysisResult } from "../../lib/analyze";
import { saveAudit, getAuditByUrlAndEmail } from "../../lib/db";
import toast from "react-hot-toast";

export function Hero() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsAnalyzing(true);

      // Check if we already have a recent analysis
      const existingAudit = await getAuditByUrlAndEmail(url, email);
      if (existingAudit) {
        const auditAge =
          Date.now() - new Date(existingAudit.created_at).getTime();
        if (auditAge < 24 * 60 * 60 * 1000) {
          toast.success("Retrieved recent analysis!");
          setAnalysis(JSON.parse(existingAudit.analysis));
          return;
        }
      }

      const analysisResult = await analyzeWebsite(url);
      await saveAudit(url, email, JSON.stringify(analysisResult));
      setAnalysis(analysisResult);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Website UX Analyzer
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Get instant UX feedback for any website
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL"
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
        <div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
        <button
          type="submit"
          disabled={isAnalyzing}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Website"}
        </button>
      </form>

      {analysis && (
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Summary</h2>
            <p className="mt-2 text-gray-600">{analysis.overview}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Issues</h2>
            <ul className="mt-2 list-disc pl-5">
              {analysis.issues.map((issue, i) => (
                <li key={i} className="text-gray-600">
                  <strong>{issue.severity}: </strong>
                  {issue.description}
                  <br />
                  <span className="text-sm italic">
                    Recommendation: {issue.recommendation}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Recommendations</h2>
            <ul className="mt-2 list-disc pl-5">
              {analysis.recommendations.map((recommendation, i) => (
                <li key={i} className="text-gray-600">
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
