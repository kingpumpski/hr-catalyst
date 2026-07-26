import { profile } from "@/data/profile";
import type { CvVersion } from "@/data/cvVersions";

const CoverLetterDocument = ({ version }: { version: CvVersion }) => {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="cv-doc bg-card text-card-foreground rounded-lg border border-border p-8 md:p-12 leading-relaxed">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
        <p className="text-sm text-muted-foreground">
          {profile.location} · {profile.phone} · {profile.email}
        </p>
      </header>

      <p className="text-sm text-muted-foreground mb-6">{today}</p>

      <div className="text-sm text-foreground/90 mb-6">
        <p>Hiring Manager</p>
        <p>[Company Name]</p>
        <p>[Company Address]</p>
      </div>

      <p className="text-sm font-semibold text-foreground mb-4">
        Re: Application for the {version.title} position
      </p>

      <p className="text-sm text-foreground/90 mb-4">Dear Hiring Manager,</p>

      <div className="space-y-4 text-sm text-foreground/90">
        <p>{version.coverLetter.opening}</p>
        {version.coverLetter.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p>{version.coverLetter.closing}</p>
        <p>Thank you for your time and consideration.</p>
      </div>

      <div className="mt-8 text-sm text-foreground/90">
        <p>Yours sincerely,</p>
        <p className="mt-6 font-semibold">{profile.name}</p>
      </div>
    </article>
  );
};

export default CoverLetterDocument;