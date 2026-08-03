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
  // whatsapp: "https://wa.me/233542069136",
  linkedin: "http://www.linkedin.com/in/kingsleynorku",
  whatsapp: "https://wa.me/233208791163",
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
          // "Lead health insurance claims operations while supporting healthcare technology systems and collaborating across clinical, administrative, and finance teams to improve operational performance.",
          "Lead operational coordination across claims administration, finance, clinical teams, and technology support while helping management improve efficiency, reporting, and service delivery.",
        contributions: [
          // "Lead end-to-end health insurance claims operations.",
          // "Coordinate with insurers, providers, and internal stakeholders to facilitate efficient claims management.",
          // "Improve claims workflows to enhance operational efficiency and reduce processing delays.",
          // "Prepare operational reports and management insights to support decision-making.",
          // "Provide IT support for hospital systems, users, and operational technologies.",
          // "Support process improvement initiatives that strengthen service delivery and operational effectiveness.",
          // "Contribute to digital transformation initiatives by aligning healthcare operations with technology solutions."
          
          "Coordinate daily operational activities involving multiple departments to ensure timely execution of business priorities.",
          "Support leadership by preparing operational reports and monitoring departmental performance.",
          "Improve internal workflows that strengthen claims processing and organizational efficiency.",
          "Collaborate with insurers, healthcare providers, finance teams, and administrative staff to resolve operational issues.",
          "Provide IT support that enables uninterrupted business operations and improves staff productivity.",
          "Maintain confidential operational and financial information with professionalism and discretion.",
          "Support implementation of technology solutions that improve organizational effectiveness.",
          "Take ownership of operational challenges and drive practical solutions from identification through resolution."
        ],
        skills: [
          "Claims Management",
          "Claims Adjudication",
          "Healthcare Operations",
          "Health Insurance",
          "Leadership",
          "Healthcare Administration",
          "IT Support",
          "Problem Solving",
          "Business Process Improvement",
          "Data Analysis",
          "Microsoft 365",
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
          // "Supported the finance department by maintaining accounting records and contributing to accurate financial reporting within a healthcare environment.",
          "Supported financial operations by maintaining accurate accounting records, preparing reconciliations, and assisting management with financial reporting.",
        contributions: [
          // "Managed daily accounting activities.",
          // "Performed reconciliations.",
          // "Assisted with financial reporting.",
          // "Supported internal controls and audit preparation.",
          // "Worked closely with management to improve financial processes.",
          
          "Processed daily accounting transactions accurately.",
          "Assisted with monthly financial reporting.",
          "Supported reconciliation of financial records.",
          "Improved accuracy of financial documentation.",
          "Assisted audit preparation and compliance activities."
        ],
        skills: ["Accounting", "Finance", "Financial Reporting", "Internal Controls", "Microsoft 365"],
      },
      {
        title: "Claims Officer",
        employmentType: "Full-time",
        location: "Accra, Ghana",
        period: "February 2020 - October 2022",
        duration: "2 yrs 9 mos",
        summary:
          // "Managed health insurance claims while coordinating with insurers, healthcare providers, and internal clinical teams to ensure accurate claims processing and timely reimbursements.",
          "Managed health insurance claims administration while coordinating with insurers, healthcare providers, and internal teams to support efficient reimbursement processes.",
        contributions: [
          // "Processed and reviewed health insurance claims.",
          // "Verified claims documentation and compliance.",
          // "Coordinated with insurance companies regarding claims submissions.",
          // "Reduced claim processing delays through improved workflow coordination.",
          // "Assisted with claims reconciliation and reporting.",

          "Managed end-to-end claims processing.",
          "Reviewed documentation for accuracy and compliance.",
          "Coordinated with insurance companies regarding claims submissions.",
          "Supported reporting and operational analysis.",
          "Assisted with continuous improvement of claims workflows."
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
          // "Supported financial operations through accurate accounting processes and financial reporting.",
          "Supported financial administration through accurate bookkeeping, reconciliations, reporting, and financial record management.",
        contributions: [
          // "Processed financial transactions accurately and on time.",
          // "Assisted with account reconciliations.",
          // "Maintained accounting records and supporting documentation.",
          // "Prepared financial reports for management.",
          // "Supported budgeting and internal control processes.",

          "Maintained financial records.",
          "Processed accounting transactions.",
          "Assisted preparation of management reports.",
          "Supported internal financial controls."
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
          // "Managed warehouse operations and inventory while ensuring efficient stock control and supporting business operations.",
          "Managed inventory operations while supporting procurement and warehouse efficiency.",
        contributions: [
          // "Managed inventory accuracy and stock control activities.",
          // "Improved inventory organization and warehouse efficiency.",
          // "Coordinated stock movement and documentation.",
          // "Assisted procurement and distribution activities.",

          "Coordinated inventory movement.",
          "Improved stock organization.",
          "Supported operational efficiency through accurate record keeping.",
          "Maintained inventory records and stock movement documentation.",
          "Supported procurement activities."
        ],
        skills: ["Inventory Management", "Warehouse Operations", "Stock Control", "Safety"],
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
          // "Supported logistics and warehouse operations by ensuring efficient movement and handling of goods while maintaining operational standards.",
          "Supported warehouse and logistics operations while ensuring accurate inventory handling and operational efficiency.",
        contributions: [
          "Assisted with warehouse and logistics operations.",
          // "Maintained inventory records and stock movement documentation.",,
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

export type LeadershipEntry = {
  company: string;
  title: string;
  location: string;
  totalPeriod: string;
  roles: Role[];
  employmentType: string;
  period: string;
  duration: string;
  summary: string;
  contributions: string[];
  skills: string[];
};

export const leadership: LeadershipEntry[] = [
  {
    // company: "Volunteer Leadership Role",
    company: "National Service Personel Association (NSPA) - Prampram District",
    title: "Financial Secretary",
    employmentType: "Volunteer",
    location: "Ningo-Prampram, Greater Accra Region, Ghana",
    period: "September 2018 - July 2019",
    duration: "8 mos",
    totalPeriod: "November 2018 - July 2019",
    summary: "Managed financial records and supported transparent financial administration for district activities while assisting in budget preparation and expenditure tracking.",
    contributions: [
      "Managed financial records and supported transparent financial administration for district activities.",
      "Assisted in budget preparation and expenditure tracking for programmes and events.",
      "Maintained accurate financial documentation and accountability records.",
      "Collaborated with district executives to support operational planning and successful programme execution.",
      "Strengthened governance through effective record management and financial reporting.",
    ],
    skills: [
      "Financial Administration",
      "Budget Management",
      "Record Keeping",
      "Reporting",
      "Team Collaboration",
      "Planning",
    ],
    roles: [],
  },
  {
    // company: "Student and Community Leadership",
    company: "Student Representative Council (SRC) - University College of Management Studies (UCOMS)",
    title: "Sports Committee Chairperson | Minister",
    employmentType: "Volunteer",
    location: "Adjecent SCC traffic light Weija, Greater Accra Region, Ghana",
    period: "August 2017 - July 2018",
    duration: "8 mos",
    totalPeriod: "August 2017 - July 2018",
    summary: "Led the Sports Committee in planning and coordinating sporting activities and student engagement initiatives while collaborating with student leaders and institutional stakeholders to promote participation and enhance the student experience.",
    contributions: [
      "Led the Sports Committee in planning and coordinating sporting activities and student engagement initiatives.",
      "Worked with student leaders and institutional stakeholders to organise events and promote student participation.",
      "Coordinated committee meetings, delegated responsibilities, and monitored execution of planned activities.",
      "Supported budgeting and logistical planning for sports programmes.",
      "Developed leadership, communication, conflict resolution, and organisational skills while representing student interests.",
    ],
    skills: [
      "Leadership",
      "Event Management",
      "Stakeholder Engagement",
      "Team Leadership",
      "Project Coordination",
      "Communication",
    ],
    roles: [],
  },
];

export type WorkshopEntry = {
  title: string;
  organization: string;
  period: string;
  location: string;
  summary: string;
  highlights: string[];
  skills: string[];
};

export const workshopsAndSeminars: WorkshopEntry[] = [
  {
    title: "Professional Development in AI and Digital Productivity",
    organization: "Self-directed learning and professional growth",
    period: "2024 - Present",
    location: "Accra, Ghana",
    summary: "Continued professional development in AI-enabled productivity, workflow automation, and digital tools relevant to administrative and operations leadership.",
    highlights: [
      "Explored practical applications of AI tools for reporting, document review, and workflow automation.",
      "Strengthened digital literacy and process improvement capability for modern office environments.",
    ],
    skills: ["AI Productivity Tools", "Workflow Automation", "Process Improvement", "Digital Literacy"],
  },
  {
    title: "Healthcare Operations and Claims Administration Seminars",
    organization: "Industry learning and professional development",
    period: "2023",
    location: "Accra, Ghana",
    summary: "Engaged in seminars focused on claims administration, healthcare compliance, and operational best practices.",
    highlights: [
      "Built deeper knowledge of healthcare administration workflows and service delivery standards.",
      "Improved understanding of claims-related coordination, documentation, and operational accountability.",
    ],
    skills: ["Healthcare Administration", "Claims Operations", "Compliance", "Operational Excellence"],
  },
  {
    title: "Leadership and Team Coordination Workshops",
    organization: "Community and volunteer development",
    period: "2018 - 2019",
    location: "Prampram, Greater Accra Region, Ghana",
    summary: "Participated in leadership-focused workshops and informal training that strengthened coordination, communication, and event planning capabilities.",
    highlights: [
      "Developed practical skills in planning community programmes and managing stakeholder expectations.",
      "Strengthened confidence in team coordination, administration, and service delivery.",
    ],
    skills: ["Leadership", "Stakeholder Engagement", "Event Coordination", "Communication"],
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
      "Strategic Management"
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
