import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { analyseJobDescription } from "@/lib/atsKeywords";
import type { CvVersion } from "@/data/cvVersions";

const AtsKeywordChecker = ({ version }: { version: CvVersion }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [submitted, setSubmitted] = useState("");

  const analysis = useMemo(
    () => (submitted.trim() ? analyseJobDescription(submitted, version) : null),
    [submitted, version],
  );

  return (
    <section className="no-print rounded-lg border border-border bg-muted/20 p-4 mb-8">
      <h2 className="text-sm font-semibold text-foreground">ATS keyword check</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Paste the job advert below to see which of its terms already appear in this document and which are missing.
      </p>
      <Textarea
        className="mt-3"
        rows={6}
        value={jobDescription}
        onChange={(event) => setJobDescription(event.target.value)}
        placeholder="Paste the full job description here…"
        aria-label="Job description"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => setSubmitted(jobDescription)} disabled={!jobDescription.trim()}>
          Check match
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setJobDescription("");
            setSubmitted("");
          }}
        >
          Clear
        </Button>
      </div>

      {analysis && (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{analysis.score}% match</span> — {analysis.matched.length} of {analysis.totalTerms} meaningful
            terms from this advert already appear in your document.
          </p>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Missing terms ({analysis.missing.length})</h3>
            {analysis.missing.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing missing — this document covers the advert well.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {analysis.missing.slice(0, 40).map((term) => (
                  <Badge key={term.term} variant="destructive" className="text-xs">
                    {term.term}{term.count > 1 ? ` ×${term.count}` : ""}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Already covered ({analysis.matched.length})</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.matched.slice(0, 40).map((term) => (
                <Badge key={term.term} variant="secondary" className="text-xs">
                  {term.term}{term.count > 1 ? ` ×${term.count}` : ""}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AtsKeywordChecker;
