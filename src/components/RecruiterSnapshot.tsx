import { BriefcaseBusiness, GraduationCap, Globe2, MapPin } from "lucide-react";
import { profile } from "@/data/profile";

type SnapshotItem = {
  label: string;
  value: string;
  detail: string;
  icon: typeof BriefcaseBusiness;
};

const items: SnapshotItem[] = [
  {
    label: "Experience",
    value: "6+ years",
    detail: "Claims, accounting & operations",
    icon: BriefcaseBusiness,
  },
  {
    label: "Education",
    value: "BSc Accounting",
    detail: "University College of Management Studies",
    icon: GraduationCap,
  },
  {
    label: "Location",
    value: profile.location,
    detail: "Open to remote & international opportunities",
    icon: MapPin,
  },
  {
    label: "Availability",
    value: profile.availability,
    detail: "Ready for suitable opportunities",
    icon: Globe2,
  },
];

const RecruiterSnapshot = () => {
  return (
    <section id="recruiter-snapshot" className="recruiter-snapshot px-6 py-10 scroll-mt-20">
      <div className="container mx-auto max-w-6xl">
        <div className="recruiter-snapshot__grid">
          {items.map(({ label, value, detail, icon: Icon }) => (
            <article key={label} className="recruiter-snapshot__item">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
                <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecruiterSnapshot;
