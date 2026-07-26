import { Card } from "@/components/ui/card";
import { BookOpen, Code, Trophy, TrendingUp } from "lucide-react";

const interests = [
  {
    icon: Trophy,
    title: "Sports Enthusiast",
    description: "Passionate about watching and reading sports news, with hands-on experience as a competitive midfielder"
  },
  {
    icon: BookOpen,
    title: "Teaching & Mentoring",
    description: "Enjoy sharing knowledge and developing others through teaching and mentorship"
  },
  {
    icon: Code,
    title: "Computer Programming",
    description: "Active interest in technology and programming, continuously expanding technical capabilities"
  },
  {
    icon: TrendingUp,
    title: "Continuous Learning",
    description: "Committed to acquiring new skill sets and staying current with industry trends"
  }
];

const Interests = () => {
  return (
    <section id="interests" className="py-20 px-6 scroll-mt-20">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-foreground mb-4">Interests & Passions</h2>
          <p className="text-muted-foreground text-lg">
            Personal interests that drive professional growth
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {interests.map((interest, index) => {
            const Icon = interest.icon;
            return (
              <Card 
                key={index}
                className="p-6 text-center shadow-soft hover:shadow-medium transition-smooth animate-fade-in hover:border-primary/50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {interest.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {interest.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Interests;
