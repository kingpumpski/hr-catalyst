import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer } from "lucide-react";
import { getCvVersion } from "@/data/cvVersions";
import CvDocument from "@/components/CvDocument";
import CoverLetterDocument from "@/components/CoverLetterDocument";
import NotFound from "./NotFound";

const CvVersionPage = () => {
  const { slug } = useParams();
  const version = getCvVersion(slug);
  const [tab, setTab] = useState<"cv" | "letter">("cv");

  if (!version) return <NotFound />;

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="container max-w-3xl mx-auto">
        <div className="no-print">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/cv">
              <ArrowLeft className="mr-2 h-4 w-4" /> All versions
            </Link>
          </Button>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">{version.title}</h1>
              <p className="text-sm text-muted-foreground">{version.targetRoles}</p>
            </div>
            <Button onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print / Save as PDF
            </Button>
          </div>

          <div className="flex gap-2 mb-4">
            <Button variant={tab === "cv" ? "default" : "outline"} onClick={() => setTab("cv")}>
              CV
            </Button>
            <Button
              variant={tab === "letter" ? "default" : "outline"}
              onClick={() => setTab("letter")}
            >
              Cover letter
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {version.keywords.map((k) => (
              <Badge key={k} variant="secondary" className="text-xs">
                {k}
              </Badge>
            ))}
          </div>
        </div>

        {tab === "cv" ? (
          <CvDocument version={version} />
        ) : (
          <CoverLetterDocument version={version} />
        )}
      </div>
    </main>
  );
};

export default CvVersionPage;