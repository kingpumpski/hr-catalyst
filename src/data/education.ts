export type EducationEntry = {
  school: string;
  qualification: string;
  field: string;
  period: string;
  location: string;
  description: string;
  activities?: string[];
  coursework?: string[];
};

export const education: EducationEntry[] = [
  {
    school: "University College of Management Studies (UCOMS)",
    qualification: "Bachelor of Science (BSc), Accounting",
    field: "Accounting",
    period: "2014 - 2018",
    location: "Weija, Greater Accra Region, Ghana",
    description:
      "Completed undergraduate studies in Accounting with a strong foundation in financial accounting, management accounting, auditing, taxation, business law, economics, and financial management. Developed analytical and problem-solving skills applicable to finance, healthcare administration, and operational management.",
    activities: [
      "Sports Activities (PUFA Association) (2015 - 2015)",
    ],
    coursework: [
      "Financial Accounting",
      "Cost & Management Accounting",
      "Auditing",
      "Taxation",
      "Business Law",
      "Financial Management",
      "Economics",
      "Business Statistics",
      "Management Information Systems",
      "Corporate Finance",
      "Fiduciary Law",
      "Strategic Management",
    ],
  },
  {
    school: "Bisease Senior High School (BISECO)",
    qualification: "West African Senior School Certificate Examination (WASSCE)",
    field: "Business (Accounting)",
    period: "2008 - 2011",
    location: "Ajumako-Bisease Central Region, Ghana",
    description:
      "Completed secondary education with a concentration in Business, building foundational knowledge in Accounting, Economics, Commerce, and Business Management.",
  },
];
