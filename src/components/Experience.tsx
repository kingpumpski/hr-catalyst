import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin } from "lucide-react";
import { companies } from "@/data/profile";

const getRoleDuration = (period: string, fallback: string) => {
  const match = period.match(/^(\w+) (\d{4}) - (Present|\w+ \d{4})$/);
  if (!match) return fallback;

  const [, startMonth, startYear, end] = match;
  const startDate = new Date(Date.UTC(Number(startYear), new Date(`${startMonth} 1, 2000`).getUTCMonth(), 1));
  const endDate = end === "Present" ? new Date() : new Date(Date.UTC(Number(end.slice(-4)), new Date(`${end.slice(0, -5)} 1, 2000`).getUTCMonth(), 1));

  const months =
    (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
    (endDate.getUTCMonth() - startDate.getUTCMonth());

  if (months < 0) return fallback;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) return `${remainingMonths} mos`;
  if (remainingMonths === 0) return `${years} ${years === 1 ? "yr" : "yrs"}`;
  return `${years} ${years === 1 ? "yr" : "yrs"} ${remainingMonths} mos`;
};

const Experience = () => {
  return (
    <section id="experience" className="py-20 px-6 bg-muted/30 scroll-mt-20">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-foreground mb-4">Professional Experience</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {/* 13+ years across healthcare claims, finance, operations and logistics */}
            Operations, healthcare administration, and finance professional with over six years of progressive experience leading operational coordination, claims management, financial administration, executive support, and IT-enabled process improvement within fast-paced healthcare environments.
            Experienced in coordinating cross-functional teams, improving operational workflows, supporting executive decision-making, managing administrative and financial processes, and implementing technology solutions that improve efficiency and service delivery. Recognized for taking ownership of complex operational challenges, maintaining high standards of accuracy, and delivering reliable results under pressure.
            Combines analytical thinking with strong organizational skills and a growing expertise in artificial intelligence, automation, and software technology. Passionate about building scalable operational systems, improving business processes, and enabling high-performing teams through structured execution and continuous improvement.
            Seeking to contribute these strengths in an Operations Lead / Chief of Staff role where operational excellence, strategic execution, and AI-enabled productivity are central to organizational success.
          </p>
        </div>

        <div className="space-y-6">
          {companies.map((company) => (
            <Card key={company.company} className="p-6 md:p-8 shadow-soft animate-fade-in">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl text-foreground">{company.company}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{company.totalPeriod}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5" /> {company.location}
                  </p>
                </div>
              </div>

              <ol className="relative border-l border-border ml-6 space-y-8">
                {company.roles.map((role) => (
                  <li key={role.title + role.period} className="pl-6">
                    <span className="absolute -left-[6px] mt-2 h-3 w-3 rounded-full bg-primary" />
                    <h4 className="text-lg font-semibold text-foreground">{role.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {role.employmentType} · {role.period} · {getRoleDuration(role.period, role.duration)}
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
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
