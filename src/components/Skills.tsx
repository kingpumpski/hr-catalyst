import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  Laptop, 
  TrendingUp,
  Briefcase,
  Target
} from "lucide-react";

const skillCategories = [
  {
    title: "HR & People Management",
    icon: Users,
    skills: [
      "Recruitment & Selection",
      "Staff Development",
      "Performance Management",
      "Employee Relations",
      "Training Coordination"
    ]
  },
  {
    title: "Operations & Administration",
    icon: Briefcase,
    skills: [
      "Executive Assistance",
      "Claims Management",
      "Process Optimization",
      "Project Coordination",
      "Stakeholder Management"
    ]
  },
  {
    title: "Technical Skills",
    icon: Laptop,
    skills: [
      "Microsoft Office Suite (Expert)",
      "ERPNext Systems",
      "IT Support & Management",
      "Computer Programming",
      "Database Management"
    ]
  },
  {
    title: "Financial & Accounting",
    icon: TrendingUp,
    skills: [
      "Financial Reporting",
      "Account Management",
      "Budget Planning",
      "Financial Analysis",
      "Reconciliation"
    ]
  },
  {
    title: "Leadership & Teamwork",
    icon: Target,
    skills: [
      "Team Leadership",
      "Conflict Resolution",
      "Decision Making",
      "Strategic Planning",
      "Cross-functional Collaboration"
    ]
  },
  {
    title: "Additional Competencies",
    icon: FileText,
    skills: [
      "Report Writing",
      "Documentation",
      "Research & Analysis",
      "Communication",
      "Problem Solving"
    ]
  }
];

const Skills = () => {
  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-foreground mb-4">Core Competencies</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive skill set spanning HR, operations, technology, and leadership
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card 
                key={index}
                className="p-6 shadow-soft hover:shadow-medium transition-smooth animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {category.title}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, idx) => (
                    <Badge 
                      key={idx}
                      variant="secondary"
                      className="text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;
