import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Presentation, MapPin } from "lucide-react";
import { workshopsAndSeminars } from "@/data/profile";

const WorkshopsAndSeminars = () => {
  return (
    <section id="workshops" className="py-20 px-6 bg-muted/30 scroll-mt-20">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-foreground mb-4">Workshops & Seminars</h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Continued professional development in healthcare operations, claims administration, AI-enabled productivity, and leadership. These experiences reflect a commitment to growth, structured learning, and practical application of modern business tools.
          </p>
        </div>

        <div className="space-y-6">
          {workshopsAndSeminars.map((item) => (
            <Card key={item.title} className="p-6 md:p-8 shadow-soft animate-fade-in">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                  <Presentation className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.organization}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.period}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5" /> {item.location}
                  </p>
                </div>
              </div>

              <p className="text-sm text-foreground/90 mb-4">{item.summary}</p>

              {item.highlights && item.highlights.length > 0 ? (
                <ul className="space-y-2 mb-4">
                  {item.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3 text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-sm">{highlight}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {item.skills && item.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {item.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkshopsAndSeminars;
