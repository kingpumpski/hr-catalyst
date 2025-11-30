import { Card } from "@/components/ui/card";
import { GraduationCap, Award } from "lucide-react";

const Education = () => {
  return (
    <section className="py-20 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-foreground mb-4">Education & Leadership</h2>
          <p className="text-muted-foreground text-lg">
            Academic background and extracurricular achievements
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 shadow-soft hover:shadow-medium transition-smooth animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Bachelor of Science in Accounting
                </h3>
                <p className="text-muted-foreground mb-4">
                  University Name
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-medium">2017-2018:</span>
                    <span className="text-muted-foreground">Sports Chairman/Minister</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-medium">2018-2019:</span>
                    <span className="text-muted-foreground">Finance Secretary (National Service Year)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-soft hover:shadow-medium transition-smooth animate-fade-in gradient-accent text-white">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4">
                  Awards & Recognition
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white flex-shrink-0"></span>
                    <span className="text-sm">
                      <strong>Most Promising Sports Personality</strong> - 2015 Sports Entertainment Awards Night (SRC)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white flex-shrink-0"></span>
                    <span className="text-sm">
                      <strong>Best Midfielder</strong> - 2015 Sports Entertainment Awards Night (SRC)
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
