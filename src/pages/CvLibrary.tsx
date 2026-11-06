import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Search, X } from "lucide-react";
import { cvCatalog } from "@/data/cvCatalog";
import { getShareLink } from "@/lib/shareLinks";
import { useSeo } from "@/lib/seo";

const CvLibrary = () => {
  const [query, setQuery] = useState("");
  useSeo({
    title: "CV Library | Kingsley Junior Norku",
    description:
      "Tailored, ATS-friendly CVs, resumes and cover letters by Kingsley Junior Norku for claims, healthcare operations, accounting, finance and administration roles.",
    path: "/cv",
  });

  const filteredVersions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return cvCatalog;

    return cvCatalog.filter((version) =>
      [
        version.title,
        version.targetRoles,
        version.summary,
        ...version.coreSkills,
        ...version.keywords,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  return (
    <main className="min-h-screen py-16 px-6">
      <div className="container max-w-5xl mx-auto">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to portfolio
          </Link>
        </Button>

        <div className="mb-8">
          {/* <h1 className="text-foreground mb-3">CVs & Cover Letters</h1> */}
          <h1 className="text-foreground mb-3">Rrcruiters Documents</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Browse recruiter-ready CV, resume and cover-letter versions tailored to different career tracks.
          </p>
        </div>

        <Card className="p-4 mb-8 border-border/80 bg-card/80">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by role, skill, industry or keyword"
                aria-label="Search CV versions"
                className="pl-9"
              />
            </div>
            {query && (
              <Button variant="outline" onClick={() => setQuery("")}>
                <X className="mr-2 h-4 w-4" /> Clear
              </Button>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">
            Showing {filteredVersions.length} of {cvCatalog.length} career tracks
          </p>
        </Card>

        {filteredVersions.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredVersions.map((v) => (
              <Card key={v.slug} className="p-6 shadow-soft hover:shadow-medium transition-smooth">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{v.title}</h2>
                    <p className="text-sm text-muted-foreground">{v.targetRoles}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-4">{v.summary}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {v.coreSkills.slice(0, 5).map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild className="flex-1">
                    <Link to={`/cv/${v.slug}`}>Open full version</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={getShareLink(v.slug, "cv")}>Share CV</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={getShareLink(v.slug, "resume")}>Share Resume</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={getShareLink(v.slug, "letter")}>Share Letter</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center">
            <h2 className="text-xl font-semibold text-foreground">No matching career track</h2>
            <p className="mt-2 text-muted-foreground">
              Try a broader role, skill or industry keyword.
            </p>
            <Button variant="outline" className="mt-5" onClick={() => setQuery("")}>
              Reset search
            </Button>
          </Card>
        )}
      </div>
    </main>
  );
};

export default CvLibrary;
