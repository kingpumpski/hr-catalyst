import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { cvVersions } from "@/data/cvVersions";

const CvLibrary = () => {
  return (
    <main className="min-h-screen py-16 px-6">
      <div className="container max-w-5xl mx-auto">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to portfolio
          </Link>
        </Button>

        <h1 className="text-foreground mb-3">CVs & Cover Letters</h1>
        {/* <h1 className="text-foreground mb-3">Tailored CVs & Cover Letters</h1> */}
        <p className="text-muted-foreground text-lg mb-10 max-w-2xl">
          All my professional CV and cover letter versions, tailored to each career track. <br />
          {/* ATS-optimised, single-column documents tailored to each career track. <br /> */}
          Open a version to read, print or save it as PDF.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {cvVersions.map((v) => (
            <Card key={v.slug} className="p-6 shadow-soft hover:shadow-medium transition-smooth">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
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
              <Button asChild className="w-full">
                <Link to={`/cv/${v.slug}`}>View CV & cover letter</Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
};

export default CvLibrary;