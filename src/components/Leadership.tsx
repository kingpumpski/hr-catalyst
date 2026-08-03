import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users } from "lucide-react";
import { leadership } from "@/data/profile";

const Leadership = () => {
  return (
    <section id="leadership" className="py-20 px-6 scroll-mt-20">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-foreground mb-4">Leadership & Volunteer Experience</h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Demonstrated leadership in community and organisational settings through service, financial stewardship, stakeholder coordination, and team engagement. These experiences highlight accountability, collaboration, and a strong commitment to supporting people and programmes effectively.
          </p>
        </div>

        <div className="space-y-6">
          {leadership.map((entry) => {
            const displayRoles = entry.roles.length > 0
              ? entry.roles
              : [
                  {
                    title: entry.title,
                    employmentType: entry.employmentType,
                    location: entry.location,
                    period: entry.period,
                    duration: entry.duration,
                    summary: entry.summary,
                    contributions: entry.contributions,
                    skills: entry.skills,
                  },
                ];

            return (
              <Card key={`${entry.company}-${entry.title}`} className="p-6 md:p-8 shadow-soft animate-fade-in">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl text-foreground">{entry.company || "Volunteer Leadership Role"}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{entry.totalPeriod || entry.period}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" /> {entry.location}
                    </p>
                  </div>
                </div>

                <ol className="relative border-l border-border ml-6 space-y-8">
                  {displayRoles.map((role) => (
                    <li key={role.title + role.period} className="pl-6">
                      <span className="absolute -left-[6px] mt-2 h-3 w-3 rounded-full bg-primary" />
                      <h4 className="text-lg font-semibold text-foreground">{role.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {role.employmentType} · {role.period} · {role.duration}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">{role.location}</p>
                      <p className="text-sm text-foreground/90 mb-3">{role.summary}</p>
                      <ul className="space-y-2 mb-4">
                        {role.contributions.map((c) => (
                          <li key={c} className="flex items-start gap-3 text-muted-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span className="text-sm">{c}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-2">
                        {role.skills.map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {s.replace(/^•\s*/, "").trim()}
                          </Badge>
                        ))}
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Leadership;
