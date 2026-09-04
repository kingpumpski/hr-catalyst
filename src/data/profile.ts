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
  address: "Accra, Greater Accra Region, Ghana",
  gpsAddress: "Accra, Ghana",
  email: "kingnorku@gmail.com",
  phone: "+233 542 069 136",
  whatsapp: "https://wa.me/233208791163",
  linkedin: "http://www.linkedin.com/in/kingsleynorku",
  availability: "Immediate",
  languages: ["English (Fluent)", "Twi (Conversational)"],
  references: "Available on request",
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
        period: "April 2023 - Present",
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
        title: "Accounts & Claims Officer",
        employmentType: "Full-time",
        location: "Accra, Ghana",
        period: "February 2019 - March 2023",
        duration: "3 yrs 9 mos",
        summary:
          "Supported financial administration and healthcare claims operations by maintaining accurate accounting records, preparing reconciliations, and assisting management with financial reporting while coordinating claims processing, insurer follow-up, and reimbursement activities across a fast-paced hospital environment.",
        contributions: [
          "Processed daily accounting transactions accurately and maintained reliable financial records.",
          "Prepared reconciliations and supported monthly reporting, audit readiness, and internal financial controls.",
          "Managed end-to-end claims processing and reviewed documentation for accuracy, completeness, and compliance.",
          "Coordinated with insurers, healthcare providers, and internal teams to resolve claims issues and support efficient reimbursement workflows.",
          "Supported reporting and operational analysis to strengthen service delivery and administrative efficiency.",
          "Contributed to continuous improvement of accounting and claims workflows in a healthcare setting."
        ],
        skills: [
          "Accounting",
          "Finance",
          "Financial Reporting",
          "Internal Controls",
          "Microsoft 365",
          "Health Insurance",
          "Claims Processing",
          "Medical Billing",
          "Healthcare Administration",
          "Customer Service",
          "Documentation",
          "Reconciliation",
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
        period: "July 2013 - August 2017",
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
        period: "June 2012 - June 2013",
        duration: "1 yr",
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
    company: "National Service Personnel Association (NSPA) - Prampram District",
    title: "Financial Secretary",
    employmentType: "Volunteer",
    location: "Ningo-Prampram, Greater Accra Region, Ghana",
    period: "September 2018 - July 2019",
    duration: "11 mos",
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
    location: "Adjacent SCC traffic light Weija, Greater Accra Region, Ghana",
    period: "October 2017 - July 2018",
    duration: "10 mos",
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
    title: "Malaria Management in Ghana: Clinical and Operational Insights",
    organization: "Ghana Health Service (GHS) & National Malaria Control Programme (NMCP)",
    period: "2020",
    location: "Sealane Hotel, Prampram, Accra, Ghana",
    summary: "Strengthened understanding of malaria management, child-focused clinical care, and operational strategies for improving healthcare delivery in Ghana.",
    highlights: [
      "Gained practical insight into malaria prevention, case management, and public health coordination.",
      "Built awareness of how clinical knowledge and operational planning support better service outcomes in resource-sensitive settings.",
    ],
    skills: ["Public Health", "Clinical Operations", "Healthcare Delivery", "Program Coordination"],
  },
  {
    title: "The Launch of E-Tracker",
    organization: "Ghana AIDS Commission (GAC) & National AIDS Control Programme (NACP)",
    period: "2020",
    location: "Erata Hotel East-Legon, Accra, Ghana",
    summary: "Enhanced knowledge of claims administration, healthcare compliance, and operational best practices relevant to hospital and administrative service delivery.",
    highlights: [
      "Deepened understanding of claims workflows, documentation standards, and service accountability.",
      "Improved appreciation of compliance, process discipline, and operational excellence in healthcare settings.",
    ],
    skills: ["Healthcare Administration", "Claims Operations", "Compliance", "Operational Excellence"],
  },
  // {
  //   title: "Leadership and Team Coordination Workshop",
  //   organization: "Community and Volunteer Development Programme",
  //   period: "2018 - 2019",
  //   location: "Prampram, Greater Accra Region, Ghana",
  //   summary: "Participated in leadership-focused training that strengthened communication, coordination, planning, and team engagement capabilities.",
  //   highlights: [
  //     "Developed practical skills in organizing community activities and managing stakeholder expectations.",
  //     "Strengthened confidence in team coordination, administration, and service delivery.",
  //   ],
  //   skills: ["Leadership", "Stakeholder Engagement", "Event Coordination", "Communication"],
  // },
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