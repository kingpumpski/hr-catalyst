export type Role = {
  title: string;
  employmentType: string;
  location: string;
  period: string;
  duration: string;
  summary: string;
  contributions: string[];
  skills: string[];
};

export type Company = {
  company: string;
  location: string;
  totalPeriod: string;
  roles: Role[];
};

export const profile = {
  name: "Kingsley Junior Norku",
  headline: "Claims Manager & IT Support | Healthcare Operations | BSc. Accounting",
  location: "Accra, Ghana",
  email: "kingnorku@gmail.com",
  phone: "+233 542 069 136",
  whatsapp: "https://wa.me/233542069136",
};

export const companies: Company[] = [
  {
    company: "Mount Carmel Hospital & Fertility Centre",
    location: "Accra, Ghana",
    totalPeriod: "February 2019 - Present",
    roles: [
      {
        title: "Claims Manager & IT Support",
        employmentType: "Full-time",
        location: "Accra, Ghana",
        period: "November 2022 - Present",
        duration: "3 yrs 8 mos",
        summary:
          "Lead health insurance claims operations while supporting healthcare technology systems and collaborating across clinical, administrative, and finance teams to improve operational performance.",
        contributions: [
          "Lead end-to-end health insurance claims operations.",
          "Coordinate with insurers, providers, and internal stakeholders to facilitate efficient claims management.",
          "Improve claims workflows to enhance operational efficiency and reduce processing delays.",
          "Prepare operational reports and management insights to support decision-making.",
          "Provide IT support for hospital systems, users, and operational technologies.",
          "Support process improvement initiatives that strengthen service delivery and operational effectiveness.",
          "Contribute to digital transformation initiatives by aligning healthcare operations with technology solutions.",
        ],
        skills: [
          "Claims Management",
          "Healthcare Operations",
          "Health Insurance",
          "Leadership",
          "Healthcare Administration",
          "IT Support",
          "Problem Solving",
          "Business Process Improvement",
          "Data Analysis",
          "Microsoft Excel",
          "Healthcare Information Systems",
          "Digital Transformation",
        ],
      },
      {
        title: "Accounts Officer",
        employmentType: "Full-time",
        location: "Accra, Ghana",
        period: "February 2019 - January 2020",
        duration: "1 yr",
        summary:
          "Supported the finance department by maintaining accounting records and contributing to accurate financial reporting within a healthcare environment.",
        contributions: [
          "Managed daily accounting activities.",
          "Performed reconciliations.",
          "Assisted with financial reporting.",
          "Supported internal controls and audit preparation.",
          "Worked closely with management to improve financial processes.",
        ],
        skills: ["Accounting", "Finance", "Financial Reporting", "Internal Controls", "Excel"],
      },
      {
        title: "Claims Officer",
        employmentType: "Full-time",
        location: "Accra, Ghana",
        period: "February 2020 - October 2022",
        duration: "2 yrs 9 mos",
        summary:
          "Managed health insurance claims while coordinating with insurers, healthcare providers, and internal clinical teams to ensure accurate claims processing and timely reimbursements.",
        contributions: [
          "Processed and reviewed health insurance claims.",
          "Verified claims documentation and compliance.",
          "Coordinated with insurance companies regarding claims submissions.",
          "Reduced claim processing delays through improved workflow coordination.",
          "Assisted with claims reconciliation and reporting.",
        ],
        skills: [
          "Health Insurance",
          "Claims Processing",
          "Medical Billing",
          "Healthcare Administration",
          "Customer Service",
          "Documentation",
        ],
      },
    ],
  },
  {
    company: "Ninth Judah Ventures",
    location: "Accra, Ghana",
    totalPeriod: "June 2012 - August 2017",
    roles: [
      {
        title: "Accounts Officer",
        employmentType: "Full-time",
        location: "Accra, Ghana",
        period: "November 2014 - August 2017",
        duration: "2 yrs 10 mos",
        summary:
          "Supported financial operations through accurate accounting processes and financial reporting.",
        contributions: [
          "Processed financial transactions accurately and on time.",
          "Assisted with account reconciliations.",
          "Maintained accounting records and supporting documentation.",
          "Prepared financial reports for management.",
          "Supported budgeting and internal control processes.",
        ],
        skills: [
          "Accounting",
          "Financial Reporting",
          "Reconciliation",
          "Microsoft Excel",
          "Internal Controls",
        ],
      },
      {
        title: "Warehouse Officer",
        employmentType: "Full-time",
        location: "Accra, Ghana",
        period: "June 2012 - September 2014",
        duration: "2 yrs 4 mos",
        summary:
          "Managed warehouse operations and inventory while ensuring efficient stock control and supporting business operations.",
        contributions: [
          "Managed inventory accuracy and stock control activities.",
          "Improved inventory organization and warehouse efficiency.",
          "Coordinated stock movement and documentation.",
          "Assisted procurement and distribution activities.",
        ],
        skills: ["Inventory Management", "Warehouse Operations", "Procurement", "Stock Control"],
      },
    ],
  },
  {
    company: "Superior Logistics and Container Limited",
    location: "Tema, Greater Accra Region, Ghana",
    totalPeriod: "January 2013 - December 2013",
    roles: [
      {
        title: "Contract Staff",
        employmentType: "Contract",
        location: "Tema, Greater Accra Region, Ghana",
        period: "January 2013 - December 2013",
        duration: "1 yr",
        summary:
          "Supported logistics and warehouse operations by ensuring efficient movement and handling of goods while maintaining operational standards.",
        contributions: [
          "Assisted with warehouse and logistics operations.",
          "Maintained inventory records and stock movement documentation.",
          "Supported operational efficiency through accurate record keeping.",
          "Worked collaboratively to meet operational deadlines.",
          "Developed strong understanding of supply chain and warehouse processes.",
        ],
        skills: ["Logistics", "Inventory Management", "Operations", "Documentation", "Teamwork"],
      },
    ],
  },
  {
    company: "Assemblies of God Proprietary School",
    location: "Mankessim, Central Region, Ghana",
    totalPeriod: "January 2012 - August 2012",
    roles: [
      {
        title: "Teacher",
        employmentType: "Full-time",
        location: "Mankessim, Central Region, Ghana",
        period: "January 2012 - August 2012",
        duration: "8 mos",
        summary:
          "Provided classroom instruction while supporting students' academic development and helping maintain a positive learning environment.",
        contributions: [
          "Planned and delivered engaging lessons in accordance with the school's curriculum.",
          "Assessed student performance and maintained accurate academic records.",
          "Created a supportive learning environment that encouraged student participation.",
          "Collaborated with colleagues and parents to improve learning outcomes.",
          "Strengthened communication, organization, and classroom management skills.",
        ],
        skills: [
          "Classroom Management",
          "Communication",
          "Teamwork",
          "Problem Solving",
          "Time Management",
        ],
      },
    ],
  },
];

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
      "Sports Committee Chairman / Minister (2017 - 2018)",
      "Finance Secretary, National Service Year (2018 - 2019)",
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
    ],
  },
  {
    school: "Bisease Senior High School",
    qualification: "West African Senior School Certificate Examination (WASSCE)",
    field: "Business (Commercial)",
    period: "2008 - 2011",
    location: "Central Region, Ghana",
    description:
      "Completed secondary education with a concentration in Business, building foundational knowledge in Accounting, Economics, Commerce, and Business Management.",
  },
];