import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { analyseEditorDocument, createEvidenceBasedTailoring, type TailoringResult } from "@/lib/atsKeywords";
import type { CvVersion } from "@/data/cvVersions";
import type { CvEditorData } from "@/lib/cvEditor";

type Props = { version: CvVersion; editorData: CvEditorData; onApply: (data: CvEditorData) => void };

const AtsKeywordChecker = ({ version, editorData, onApply }: Props) => {
  const [jobDescription, setJobDescription] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [proposal, setProposal] = useState<TailoringResult | null>(null);
  const analysis = useMemo(
    () => (submitted.trim() ? analyseEditorDocument(submitted, editorData) : null),
    [submitted, editorData],
  );

  const runTailoring = () => {
    if (!analysis) return;
    setProposal(createEvidenceBasedTailoring(editorData, version, analysis.missing.map((item) => item.term)));
  };

  return (
    <section className="no-print rounded-lg border border-border bg-muted/20 p-4 mb-8">
      <h2 className="text-sm font-semibold text-foreground">ATS keyword check</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Paste the job advert to compare it with the CV or resume currently shown and exported below.
      </p>
      <Textarea className="mt-3" rows={6} value={jobDescription}
        onChange={(event) => { setJobDescription(event.target.value); setSubmitted(""); setProposal(null); }}
        placeholder="Paste the full job description here…" aria-label="Job description" />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => { setSubmitted(jobDescription); setProposal(null); }} disabled={!jobDescription.trim()}>
          Check match
        </Button>
        <Button variant="outline" onClick={() => { setJobDescription(""); setSubmitted(""); setProposal(null); }}>
          Clear
        </Button>
      </div>

      {analysis && (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{analysis.score}% match</span> — {analysis.matched.length} of {analysis.totalTerms} meaningful
            terms from this advert appear in the current editable document.
          </p>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Missing terms ({analysis.missing.length})</h3>
            {analysis.missing.length === 0 ? <p className="text-sm text-muted-foreground">Nothing missing — this document covers the advert well.</p> :
              <div className="flex flex-wrap gap-2">{analysis.missing.slice(0, 40).map((term) => (
                <Badge key={term.term} variant="destructive" className="text-xs">{term.term}{term.count > 1 ? ` ×${term.count}` : ""}</Badge>
              ))}</div>}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Already covered ({analysis.matched.length})</h3>
            <div className="flex flex-wrap gap-2">{analysis.matched.slice(0, 40).map((term) => (
              <Badge key={term.term} variant="secondary" className="text-xs">{term.term}{term.count > 1 ? ` ×${term.count}` : ""}</Badge>
            ))}</div>
          </div>
          {analysis.missing.length > 0 && !proposal && (
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-sm text-muted-foreground mb-3">Create a concise, evidence-based revision using relevant missing terms. Unsupported requirements will be left out rather than invented.</p>
              <Button onClick={runTailoring}>Tailor CV / Resume using missing terms</Button>
            </div>
          )}
          {proposal && (
            <div className="rounded-lg border border-border bg-background p-3 space-y-3">
              <h3 className="font-semibold text-sm">Proposed CV / Resume updates</h3>
              {proposal.changes.length ? <ul className="list-disc pl-5 text-sm space-y-1">{proposal.changes.map((change) => <li key={change}>{change}</li>)}</ul> :
                <p className="text-sm text-muted-foreground">No safe revisions could be generated from the current evidence. Add or correct relevant experience in the editor first.</p>}
              <p className="text-sm"><strong>Terms supported:</strong> {proposal.appliedTerms.length ? proposal.appliedTerms.join(", ") : "None"}</p>
              {proposal.skippedTerms.length > 0 && <p className="text-sm text-muted-foreground"><strong>Not inserted:</strong> {proposal.skippedTerms.join(", ")}. These terms need evidence or confirmation before they can truthfully appear in the document.</p>}
              <div className="flex flex-wrap gap-2">
                <Button disabled={!proposal.changes.length} onClick={() => { onApply(proposal.data); setProposal(null); }}>
                  Apply updates to this CV / Resume
                </Button>
                <Button variant="outline" onClick={() => setProposal(null)}>Discard proposal</Button>
              </div>
              <p className="text-xs text-muted-foreground">After applying, run Check match again. The score will be calculated against the updated document, not the original template.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default AtsKeywordChecker;
