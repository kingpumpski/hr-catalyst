import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Printer } from "lucide-react";
import { getCvVersionFromCatalog } from "@/data/cvCatalog";
import CvDocument from "@/components/CvDocument";
import ResumeDocument from "@/components/ResumeDocument";
import CoverLetterDocument from "@/components/CoverLetterDocument";
import NotFound from "./NotFound";

const CvVersionPage = () => {
  const { slug } = useParams();
  const version = getCvVersionFromCatalog(slug);
  const [tab, setTab] = useState<"cv" | "resume" | "letter">("cv");
  const [recipientName, setRecipientName] = useState("Hiring Manager");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

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

          <div className="flex flex-wrap gap-2 mb-4">
            <Button variant={tab === "cv" ? "default" : "outline"} onClick={() => setTab("cv")}>
              CV
            </Button>
            <Button variant={tab === "resume" ? "default" : "outline"} onClick={() => setTab("resume")}>
              Resume
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

          {tab === "letter" && (
            <div className="mb-8 rounded-lg border border-border bg-muted/20 p-4 no-print">
              <h2 className="text-sm font-semibold text-foreground">Quick cover letter update</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Update the recipient and organisation details before printing or downloading.
              </p>
              <div className="grid md:grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="text-sm text-foreground mb-1 block">Recipient name</label>
                  <Input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Hiring Manager"
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground mb-1 block">Company name</label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company name"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="text-sm text-foreground mb-1 block">Company address</label>
                <Textarea
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="Company address"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {tab === "cv" ? (
          <CvDocument version={version} />
        ) : tab === "resume" ? (
          <ResumeDocument version={version} />
        ) : (
          <CoverLetterDocument
            version={version}
            recipientName={recipientName}
            companyName={companyName || "[Company Name]"}
            companyAddress={companyAddress || "[Company Address]"}
          />
        )}
      </div>
    </main>
  );
};

export default CvVersionPage;