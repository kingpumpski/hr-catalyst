export type CvVersion = {
  slug: string;
  title: string;
  targetRoles: string;
  summary: string;
  coreSkills: string[];
  highlights: string[];
  keywords: string[];
  coverLetter: {
    opening: string;
    body: string[];
    closing: string;
  };
};

export const cvVersions: CvVersion[] = [
  {
    slug: "claims-manager",
    title: "Claims Manager",
    targetRoles: "Claims Manager • Claims Lead • Claims Supervisor",
    summary:
      "Claims Manager with 6+ years in health insurance claims operations across a busy hospital and fertility centre. Leads end-to-end claims processing, insurer coordination, reconciliation and reporting, combining an accounting background with hands-on process improvement to reduce processing delays and protect revenue.",
    coreSkills: [
      "Claims Management",
      "Health Insurance",
      "Claims Reconciliation",
      "Medical Billing",
      "Denial & Rejection Management",
      "Compliance & Documentation",
      "Stakeholder Coordination",
      "Team Leadership",
      "Reporting & Data Analysis",
      "Microsoft Excel",
    ],
    highlights: [
      "Lead end-to-end health insurance claims operations for a multi-service hospital and fertility centre.",
      "Reduced claim processing delays through redesigned submission and follow-up workflows.",
      "Coordinate daily with insurers, providers, clinical and finance teams to resolve queries and rejections.",
      "Produce claims performance and reconciliation reports that guide management decisions.",
      "Strengthened documentation and compliance standards across the claims cycle.",
    ],
    keywords: [
      "claims management",
      "health insurance claims",
      "NHIS",
      "reimbursement",
      "claims reconciliation",
      "revenue cycle",
    ],
    coverLetter: {
      opening:
        "I am writing to express my interest in the Claims Manager role. I currently lead health insurance claims operations at Mount Carmel Hospital & Fertility Centre, where I have progressed from Accounts Officer to Claims Officer and now Claims Manager & IT Support.",
      body: [
        "Over the past six years I have owned the full claims cycle: vetting and submission, insurer coordination, rejection resolution, reconciliation and management reporting. By restructuring submission and follow-up workflows I reduced processing delays and improved the predictability of reimbursements.",
        "My BSc in Accounting underpins how I approach claims: as a revenue and controls function, not simply paperwork. I reconcile claims against ledgers, track exposure by insurer, and present clear reports that management can act on.",
        "I also work closely with clinical and administrative teams, which keeps documentation accurate at source and reduces avoidable rejections. Leading that cross-functional coordination is the part of the work I enjoy most.",
      ],
      closing:
        "I would welcome the opportunity to bring this combination of claims leadership, financial discipline and process improvement to your organisation.",
    },
  },
  {
    slug: "healthcare-operations",
    title: "Healthcare Operations Manager",
    targetRoles: "Healthcare Operations Manager • Hospital Administrator • Service Delivery Lead",
    summary:
      "Healthcare operations professional with 6+ years improving service delivery, claims and administrative workflows in a hospital environment. Bridges clinical, finance and IT teams to remove bottlenecks, standardise processes and deliver measurable operational gains.",
    coreSkills: [
      "Healthcare Operations",
      "Hospital Administration",
      "Business Process Improvement",
      "Cross-functional Leadership",
      "Operational Reporting",
      "Service Delivery",
      "Vendor & Insurer Relations",
      "Healthcare Information Systems",
      "Data Analysis",
      "Change Management",
    ],
    highlights: [
      "Coordinate operations across claims, finance, clinical and IT functions in a hospital and fertility centre.",
      "Led workflow redesigns that cut processing delays and improved turnaround on reimbursements.",
      "Prepare operational dashboards and management insights that support planning decisions.",
      "Support adoption of hospital systems, training users and resolving day-to-day technology issues.",
      "Champion process improvement initiatives that strengthen service delivery and patient experience.",
    ],
    keywords: [
      "healthcare operations",
      "hospital administration",
      "process improvement",
      "service delivery",
      "operational reporting",
    ],
    coverLetter: {
      opening:
        "I am applying for the Healthcare Operations Manager position. My work at Mount Carmel Hospital & Fertility Centre sits at the intersection of claims, finance and hospital technology, giving me an operational view of how the whole facility performs.",
      body: [
        "I have redesigned claims and administrative workflows to remove handoff delays, introduced clearer documentation standards, and built reporting that shows management where throughput is lost.",
        "Because I also provide IT support for hospital systems, I understand how process and technology either reinforce or undermine each other. That perspective helps me implement changes that staff actually adopt.",
        "My accounting background means every operational decision I recommend is tied to cost, revenue and controls.",
      ],
      closing:
        "I would be glad to discuss how I can help streamline operations and strengthen service delivery in your facility.",
    },
  },
  {
    slug: "accounting-finance",
    title: "Accounting & Finance",
    targetRoles: "Accounts Officer • Finance Officer • Assistant Accountant",
    summary:
      "BSc Accounting graduate with hands-on experience in transaction processing, reconciliations, financial reporting and internal controls across healthcare and trading environments. Combines finance discipline with strong systems and reporting skills.",
    coreSkills: [
      "Financial Accounting",
      "Account Reconciliation",
      "Financial Reporting",
      "Internal Controls",
      "Audit Preparation",
      "Budgeting Support",
      "Accounts Receivable",
      "Microsoft Excel",
      "ERP Systems",
      "Inventory & Cost Control",
    ],
    highlights: [
      "Managed daily accounting activities, reconciliations and supporting documentation in a hospital finance team.",
      "Prepared periodic financial reports used by management for decision-making.",
      "Supported internal controls and audit preparation across finance and claims records.",
      "Reconciled insurance receivables against claims submissions to protect revenue.",
      "Earlier experience in transaction processing, budgeting support and stock/cost control.",
    ],
    keywords: [
      "accounting",
      "reconciliation",
      "financial reporting",
      "internal controls",
      "accounts receivable",
      "audit",
    ],
    coverLetter: {
      opening:
        "I am writing to apply for the accounting role advertised. I hold a BSc in Accounting from the University College of Management Studies and have worked in finance roles in both trading and healthcare organisations.",
      body: [
        "As Accounts Officer at Mount Carmel Hospital & Fertility Centre I handled daily accounting activities, reconciliations, reporting and audit preparation. Earlier, at Ninth Judah Ventures, I processed transactions, maintained records and supported budgeting and internal controls.",
        "My current claims management responsibilities have deepened my receivables and revenue assurance experience: I reconcile insurer submissions against ledgers and track outstanding balances to closure.",
        "I am comfortable in Excel and accounting/ERP systems, and I am methodical about documentation and controls.",
      ],
      closing:
        "I would welcome the chance to bring this experience to your finance team.",
    },
  },
  {
    slug: "health-insurance-operations",
    title: "Health Insurance Operations",
    targetRoles: "Insurance Operations Officer • Provider Relations • Claims Vetting Lead",
    summary:
      "Health insurance operations specialist experienced on the provider side of the claims value chain: vetting, submission, adjudication follow-up, rejection management and reconciliation with multiple insurers and scheme administrators.",
    coreSkills: [
      "Health Insurance Operations",
      "Claims Vetting & Adjudication Support",
      "Provider Relations",
      "Policy & Benefit Interpretation",
      "Rejection & Appeal Management",
      "Regulatory Compliance",
      "Medical Billing Codes",
      "Reconciliation",
      "Reporting & Analytics",
      "Customer Service",
    ],
    highlights: [
      "Manage submissions and follow-up with multiple insurers and scheme administrators.",
      "Vet claims documentation for benefit eligibility, coding accuracy and compliance before submission.",
      "Resolve rejections and appeals, tracking root causes to prevent recurrence.",
      "Reconcile paid, part-paid and outstanding claims and report exposure to management.",
      "Act as the primary liaison between the facility, insurers and internal clinical teams.",
    ],
    keywords: [
      "health insurance",
      "claims vetting",
      "provider relations",
      "adjudication",
      "appeals",
      "benefit administration",
    ],
    coverLetter: {
      opening:
        "I am interested in the health insurance operations role at your organisation. I have spent six years on the provider side of health insurance, managing claims from vetting through to settlement.",
      body: [
        "Day to day I interpret benefit packages, vet documentation, submit claims, pursue adjudication outcomes and manage rejections and appeals with insurers and scheme administrators.",
        "I track rejection root causes and feed them back into documentation standards, which steadily reduces avoidable losses.",
        "My accounting training makes reconciliation and exposure reporting a natural part of how I work.",
      ],
      closing:
        "I would be pleased to bring this provider-side insight to your insurance operations team.",
    },
  },
  {
    slug: "digital-health",
    title: "Digital Health / Health Technology",
    targetRoles: "Health IT Support • Digital Health Analyst • Implementation Officer",
    summary:
      "Healthcare professional combining claims and finance operations with hands-on hospital IT support. Supports healthcare information systems, trains users and contributes to digital transformation initiatives that align clinical and administrative processes with technology.",
    coreSkills: [
      "Healthcare Information Systems",
      "IT Support",
      "Digital Transformation",
      "System Implementation & Training",
      "ERPNext",
      "Data Analysis",
      "Process Automation",
      "Requirements Gathering",
      "User Support & Troubleshooting",
      "Microsoft Office Suite",
    ],
    highlights: [
      "Provide IT support for hospital systems, users and operational technologies.",
      "Contribute to digital transformation initiatives aligning healthcare operations with technology solutions.",
      "Translate claims and finance workflows into system requirements and configuration changes.",
      "Train clinical and administrative staff on system usage and data quality.",
      "Use system data to build operational reports and identify automation opportunities.",
    ],
    keywords: [
      "digital health",
      "health IT",
      "HMIS",
      "system implementation",
      "user training",
      "healthcare data",
    ],
    coverLetter: {
      opening:
        "I am applying for the digital health role. I sit between hospital operations and hospital technology: I lead claims operations while also providing IT support for the systems those operations depend on.",
      body: [
        "This dual role means I understand both the clinical-administrative workflow and the system behind it. I gather requirements from users, configure and troubleshoot systems, and train staff so adoption actually sticks.",
        "I have supported digital transformation initiatives that replaced manual claims and reporting steps with system-driven processes, improving both speed and data quality.",
        "I am comfortable analysing operational data and turning it into reports and improvement proposals.",
      ],
      closing:
        "I would welcome the opportunity to help your team deliver technology that works for the people using it.",
    },
  },
  {
    slug: "revenue-cycle",
    title: "Revenue Cycle & Medical Billing",
    targetRoles: "Revenue Cycle Officer • Medical Billing Lead • Receivables Manager",
    summary:
      "Revenue cycle professional pairing accounting qualifications with hospital claims leadership. Owns the path from service documentation and billing through claims submission, collection and reconciliation, with a focus on reducing leakage and days in receivables.",
    coreSkills: [
      "Revenue Cycle Management",
      "Medical Billing",
      "Accounts Receivable",
      "Claims Denial Management",
      "Reconciliation",
      "Financial Reporting",
      "Process Improvement",
      "Controls & Compliance",
      "Excel & Reporting Tools",
      "Stakeholder Management",
    ],
    highlights: [
      "Own the claims-to-cash cycle for a hospital and fertility centre.",
      "Reduced processing delays and improved reimbursement turnaround via workflow redesign.",
      "Reconcile insurer receivables and report ageing and exposure to management.",
      "Reduce revenue leakage by tightening documentation and pre-submission vetting.",
      "Bring an accounting perspective to billing, controls and audit readiness.",
    ],
    keywords: [
      "revenue cycle",
      "medical billing",
      "accounts receivable",
      "denial management",
      "days in AR",
      "collections",
    ],
    coverLetter: {
      opening:
        "I am writing regarding the revenue cycle role. My background combines a BSc in Accounting with six years managing hospital claims and receivables.",
      body: [
        "I manage the full claims-to-cash cycle: documentation quality at the point of service, pre-submission vetting, insurer follow-up, denial management, collection and reconciliation.",
        "Because I have worked as both an Accounts Officer and a Claims Manager in the same facility, I can trace revenue leakage back to its operational cause and fix it at source.",
        "I report ageing, exposure and recovery performance in a form management can act on.",
      ],
      closing:
        "I would be glad to discuss how I can strengthen your revenue cycle performance.",
    },
  },
  {
    slug: "operations-admin",
    title: "Operations & Administrative Management",
    targetRoles: "Operations Officer • Administrative Manager • Executive Assistant",
    summary:
      "Versatile operations and administration professional with experience spanning claims, finance, logistics, inventory and executive support. Known for organising complex processes, maintaining rigorous documentation and coordinating across departments.",
    coreSkills: [
      "Operations Management",
      "Administrative Coordination",
      "Executive Support",
      "Process Documentation",
      "Inventory & Stock Control",
      "Logistics & Supply Chain",
      "Reporting",
      "Team Supervision",
      "Vendor Management",
      "Microsoft Office Suite",
    ],
    highlights: [
      "Coordinate operations across claims, finance and IT functions in a hospital setting.",
      "Earlier experience supervising warehouse operations, inventory accuracy and stock movement.",
      "Supported logistics and container operations, maintaining records and meeting deadlines.",
      "Serve on recruitment interview panels and support staff development activities.",
      "Strong documentation, scheduling and cross-departmental coordination track record.",
    ],
    keywords: [
      "operations",
      "administration",
      "executive assistant",
      "inventory management",
      "logistics",
      "coordination",
    ],
    coverLetter: {
      opening:
        "I am applying for the operations and administration role. My career has covered warehouse and logistics operations, accounting, claims management and executive support.",
      body: [
        "That range means I can step into most administrative or operational functions quickly: I understand stock and supply chains, financial records, insurer processes and the systems that hold them together.",
        "At Mount Carmel Hospital & Fertility Centre I coordinate across clinical, finance and IT teams, prepare management reports and keep documentation audit-ready.",
        "I am organised, deadline-driven and comfortable supervising and supporting teams.",
      ],
      closing:
        "I would welcome the chance to bring this breadth of operational experience to your organisation.",
    },
  },
  {
    slug: "pharmacy-healthcare-support",
    title: "Healthcare Support & Pharmacy Operations",
    targetRoles: "Pharmacy Assistant • Healthcare Support Officer • Patient Services Support",
    summary:
      "Healthcare-focused professional with strong exposure to patient-facing operations, documentation, inventory control, and service support in clinical and administrative settings. Brings reliability, professionalism, and a strong learning mindset to support safe and efficient care delivery.",
    coreSkills: [
      "Healthcare Support",
      "Patient Service",
      "Inventory Control",
      "Documentation",
      "Clinical Support",
      "Compliance Awareness",
      "Team Collaboration",
      "Administrative Support",
      "Problem Solving",
      "Communication",
    ],
    highlights: [
      "Supported healthcare delivery through strong administrative coordination and patient-focused service.",
      "Contributed to orderly documentation, stock awareness, and day-to-day operational support.",
      "Built practical experience in healthcare environments with an emphasis on accuracy, professionalism and teamwork.",
      "Adaptable to fast-paced clinical and non-clinical settings with a strong sense of responsibility.",
    ],
    keywords: [
      "healthcare support",
      "pharmacy support",
      "patient services",
      "clinical operations",
      "inventory control",
      "administrative support",
    ],
    coverLetter: {
      opening:
        "I am applying for the healthcare support or pharmacy operations role. My experience in clinical and administrative environments has strengthened my ability to contribute effectively to safe, organised and patient-focused service delivery.",
      body: [
        "Through my work in healthcare settings I have developed a strong appreciation for accuracy, discipline and teamwork. I understand the importance of clear documentation, dependable support and responsiveness in day-to-day operations.",
        "I bring a calm, professional approach to fast-paced environments and I am comfortable supporting both patients and internal teams with care and efficiency.",
        "I would welcome the chance to contribute my experience, adaptability and commitment to service in your organisation.",
      ],
      closing:
        "I would be pleased to discuss how my healthcare experience and support skills can contribute to your team.",
    },
  },
  {
    slug: "business-operations-client-service",
    title: "Business Operations & Client Service",
    targetRoles: "Operations Assistant • Client Service Officer • Business Support Officer",
    summary:
      "Business-oriented professional with experience in operations, finance support, customer-facing coordination, and organisational administration. Strong track record of keeping processes organised, supporting teams, and delivering reliable service in dynamic environments.",
    coreSkills: [
      "Client Service",
      "Operations Support",
      "Administrative Coordination",
      "Reporting",
      "Customer Relations",
      "Process Documentation",
      "Team Support",
      "Problem Solving",
      "Time Management",
      "Microsoft Office",
    ],
    highlights: [
      "Supported day-to-day business operations through careful documentation, coordination and follow-through.",
      "Built strong customer-facing experience while balancing internal administrative responsibilities.",
      "Adapted quickly to operational and service demands in busy workplace environments.",
      "Known for reliability, professionalism and a commitment to helping teams deliver consistently.",
    ],
    keywords: [
      "business operations",
      "client service",
      "administrative support",
      "operations assistant",
      "customer relations",
      "team support",
    ],
    coverLetter: {
      opening:
        "I am writing to express my interest in the business operations or client service role. My background combines operational support, administration and service delivery in fast-paced environments.",
      body: [
        "I have built experience in supporting day-to-day operations, maintaining clear records, coordinating work effectively and helping teams stay organised. I understand the importance of reliability and responsiveness in customer-facing and internal support work.",
        "My experience has strengthened my ability to communicate professionally, manage priorities and contribute positively to business performance.",
        "I would welcome the opportunity to bring these strengths to your organisation.",
      ],
      closing:
        "I would be pleased to discuss how I can support your team and contribute to strong business operations.",
    },
  },
];

export const getCvVersion = (slug?: string) => cvVersions.find((v) => v.slug === slug);