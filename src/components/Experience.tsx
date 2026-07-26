import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

const experiences = [
  {
    company: "Mount Carmel Hospital and Fertility Center",
    role: "Claims Manager / Assistant IT Manager / Executive Assistant",
    period: "February 2019 - Present",
    duration: "5+ years",
    description: "Multi-faceted role managing insurance claims, IT infrastructure, and executive operations.",
    achievements: [
      "Streamlined claims processing systems reducing turnaround time",
      "Managed IT systems and infrastructure for hospital operations",
      "Provided high-level executive assistance to senior management",
      "Coordinated cross-departmental projects and initiatives"
    ]
  },
  {
    company: "BOYE'S Corner",
    role: "Recruitment Panel Member",
    period: "Ongoing",
    duration: "Multiple cycles",
    description: "Served on recruitment interview panel during staff hiring processes.",
    achievements: [
      "Evaluated candidates for various organizational positions",
      "Contributed to talent acquisition strategy",
      "Conducted competency-based interviews"
    ]
  },
  {
    company: "Ninth Judah Ventures",
    role: "Account Officer",
    period: "November 2014 - August 2017",
    duration: "3 years",
    description: "Managed financial operations and accounting responsibilities.",
    achievements: [
      "Maintained accurate financial records and reports",
      "Processed transactions and reconciliations",
      "Supported budget planning and financial analysis"
    ]
  },
  {
    company: "Ninth Judah Ventures",
    role: "Warehouse Supervisor",
    period: "June 2012 - September 2014",
    duration: "2 years",
    description: "Supervised warehouse operations, staff management, and inventory control.",
    achievements: [
      "Led team of warehouse staff in daily operations",
      "Optimized inventory management systems",
      "Ensured safety compliance and operational efficiency"
    ]
  },
  {
    company: "Superior Logistics and Container Management",
    role: "Contract Worker",
    period: "January 2013 - December 2013",
    duration: "1 year",
    description: "Provided logistics support and container management services.",
    achievements: [
      "Supported logistics coordination and planning",
      "Managed container tracking and documentation",
      "Maintained client relationships"
    ]
  }
];

const Experience = () => {
  return (
    <section id="experience" className="py-20 px-6 bg-muted/30 scroll-mt-20">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-foreground mb-4">Professional Experience</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Over 5 years of diverse experience across multiple industries and functions
          </p>
        </div>

        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <Card 
              key={index} 
              className="p-6 md:p-8 shadow-soft hover:shadow-medium transition-smooth animate-slide-in border-l-4 border-l-primary"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl text-foreground mb-2">{exp.role}</h3>
                  <p className="text-lg font-medium text-primary mb-2">{exp.company}</p>
                  <p className="text-muted-foreground">{exp.description}</p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <Badge variant="secondary" className="whitespace-nowrap">
                    <Calendar className="mr-1 h-3 w-3" />
                    {exp.period}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{exp.duration}</span>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-foreground mb-3">Key Achievements:</p>
                <ul className="space-y-2">
                  {exp.achievements.map((achievement, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></span>
                      <span className="text-sm">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
