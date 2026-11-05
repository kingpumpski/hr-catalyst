import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  analyseJobDescription,
  getSupportedCvWordingSuggestions,
  type CvWordingSuggestion,
} from "@/lib/atsKeywords";
import type { CvDocumentContent } from "@/data/cvDocumentContent";
import type { CvVersion } from "@/data/cvVersions";

type AtsKeywordCheckerProps = {
  version: CvVersion;
  content: CvDocumentContent;
  onApplyContent: (content: CvDocumentContent) => void;
};

const AtsKeywordChecker = ({ version, content, onApplyContent }: AtsKeywordCheckerProps) => {
  const [jobDescription, setJobDescription] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<string[]>([]);

  const analysis = useMemo(
    () => (submitted.trim() ? analyseJobDescription(submitted, version, content) : null),
    [submitted, version, content],
  );
  const suggestions = useMemo(
    () => analysis ? getSupportedCvWordingSuggestions(content, analysis.missing.map(({ term }) => term)) : [],
    [analysis, content],
  );
  const missingSuggestionTerms = analysis
    ? analysis.missing.filter(({ term }) => !suggestions.some((suggestion) => suggestion.term === term))
    : [];

  const handleApplySuggestions = () => {
    const selected = suggestions.filter(({ id }) => selectedSuggestionIds.includes(id));
    if (!selected.length) return;
    const updatedContent = selected.reduce(
      (nextContent, suggestion) => suggestion.apply(nextContent),
      content,
    );
    onApplyContent(updatedContent);
    setShowSuggestions(false);
    setSelectedSuggestionIds([]);
  };

  return (
    <section className="no-print rounded-lg border border-border bg-muted/20 p-4 mb-8">
      <h2 className="text-sm font-semibold text-foreground">ATS keyword check</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Paste the job advert below to compare it with the current CV or resume. Common word forms are counted together.
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
            setShowSuggestions(false);
            setSelectedSuggestionIds([]);
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

          {analysis.missing.length > 0 && (
            <div className="rounded-md border border-border bg-background/70 p-4">
              {!showSuggestions ? (
                <Button variant="outline" onClick={() => setShowSuggestions(true)}>
                  Review safe wording suggestions
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Optional, fact-supported wording</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Suggestions only rephrase facts already in this CV. Select the changes you approve; nothing is applied or saved automatically.
                      The match report will recalculate against this edited preview. No wording change can guarantee a particular match score.
                    </p>
                  </div>
                  {suggestions.length > 0 ? (
                    <div className="space-y-3">
                      {suggestions.map((suggestion) => (
                        <SuggestionOption
                          key={suggestion.id}
                          suggestion={suggestion}
                          checked={selectedSuggestionIds.includes(suggestion.id)}
                          onCheckedChange={(checked) => setSelectedSuggestionIds((current) =>
                            checked
                              ? [...current, suggestion.id]
                              : current.filter((id) => id !== suggestion.id),
                          )}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No missing terms can be added safely from the current CV facts. Add or confirm the information yourself in the editor before using it.
                    </p>
                  )}
                  {missingSuggestionTerms.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      No verified wording suggestion for: {missingSuggestionTerms.map(({ term }) => term).join(", ")}.
                      These terms are intentionally not inserted because the current CV does not support them.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleApplySuggestions} disabled={selectedSuggestionIds.length === 0}>
                      Apply selected and recheck
                    </Button>
                    <Button variant="ghost" onClick={() => setShowSuggestions(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

const SuggestionOption = ({
  suggestion,
  checked,
  onCheckedChange,
}: {
  suggestion: CvWordingSuggestion;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <label className="flex cursor-pointer gap-3 rounded-md border border-border p-3">
    <input
      type="checkbox"
      className="mt-1 h-4 w-4 accent-primary"
      checked={checked}
      onChange={(event) => onCheckedChange(event.target.checked)}
      aria-label={`Accept ${suggestion.term} wording suggestion`}
    />
    <span className="min-w-0 text-sm">
      <span className="font-semibold text-foreground">Add “{suggestion.term}” · {suggestion.section}</span>
      <span className="mt-1 block text-muted-foreground"><strong>Before:</strong> {suggestion.before}</span>
      <span className="mt-1 block text-foreground"><strong>Suggested:</strong> {suggestion.after}</span>
      <span className="mt-1 block text-xs text-muted-foreground">{suggestion.evidence}</span>
    </span>
  </label>
);

export default AtsKeywordChecker;
