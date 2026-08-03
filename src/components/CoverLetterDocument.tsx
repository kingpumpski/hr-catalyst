import { profile } from "@/data/profile";
import type { CvVersion } from "@/data/cvVersions";

type CoverLetterDocumentProps = {
  version: CvVersion;
  recipientName?: string;
  companyName?: string;
  companyAddress?: string;
};

const CoverLetterDocument = ({
  version,
  recipientName = "Hiring Manager",
  companyName = "[Company Name]",
  companyAddress = "[Company Address]",
}: CoverLetterDocumentProps) => {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="cv-doc bg-card text-card-foreground rounded-lg border border-border p-8 md:p-12 leading-relaxed">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <p>{profile.address}</p>
          <p>
            {profile.phone} · {profile.email} · {profile.whatsapp}
          </p>
          <p>{profile.linkedin}</p>
        </div>
      </header>

      <p className="text-sm text-muted-foreground mb-6">{today}</p>

      <div className="text-sm text-foreground/90 mb-6">
        <p>{recipientName}</p>
        <p>{companyName}</p>
        <p>{companyAddress}</p>
      </div>

      <p className="text-sm font-semibold text-foreground mb-4">
        Re: Application for the {version.title} position
      </p>

      <p className="text-sm text-foreground/90 mb-4">Dear {recipientName},</p>

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