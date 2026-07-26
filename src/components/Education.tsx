import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Award, MapPin } from "lucide-react";
import { education } from "@/data/profile";

const Education = () => {
  return (
    <section id="education" className="py-20 px-6 scroll-mt-20">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-foreground mb-4">Education</h2>
          <p className="text-muted-foreground text-lg">
            Academic background, activities and relevant coursework
          </p>
        </div>

        <div className="space-y-6">
          {education.map((item) => (
            <Card key={item.school} className="p-6 md:p-8 shadow-soft animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">{item.school}</h3>
                  <p className="text-foreground/90">{item.qualification}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.field} · {item.period}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5 mb-4">
                    <MapPin className="h-3.5 w-3.5" /> {item.location}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>

                  {item.activities && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Activities and societies
                      </p>
                      <ul className="space-y-2">
                        {item.activities.map((a) => (
                          <li key={a} className="flex items-start gap-3 text-muted-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span className="text-sm">{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.coursework && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Relevant coursework
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.coursework.map((c) => (
                          <Badge key={c} variant="secondary" className="text-xs">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}

          <Card className="p-6 md:p-8 shadow-soft animate-fade-in gradient-accent text-white">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4">Honours & Awards</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white flex-shrink-0" />
                    <span className="text-sm">
                      <strong>Most Promising Sports Personality</strong> — 2015 Sports Entertainment
                      Awards Night (SRC)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white flex-shrink-0" />
                    <span className="text-sm">
                      <strong>Best Midfielder</strong> — 2015 Sports Entertainment Awards Night (SRC)
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Education;
