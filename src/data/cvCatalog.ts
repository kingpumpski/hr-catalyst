import { cvVersions, type CvVersion } from "@/data/cvVersions";

const vehicleAccountingSpecialist: CvVersion = {
  slug: "vehicle-accounting-specialist",
  title: "Vehicle Accounting Specialist",
  targetRoles: "Vehicle Accounting Specialist • Transport Accounts Officer • Finance & Reconciliation Officer",
  summary:
    "BSc Accounting professional with experience in financial reconciliation, records management, reporting, claims finance, operational coordination and logistics-related documentation. Brings strong attention to detail, Microsoft Excel capability, integrity and cross-functional experience suited to transport and vehicle accounting environments.",
  coreSkills: [
    "Financial Reconciliation",
    "Payment & Records Administration",
    "Financial Reporting",
    "Microsoft Excel",
    "Accounting & Finance",
    "Operational Coordination",
    "Transport & Logistics Documentation",
    "Waybill & Delivery Records",
    "Data Accuracy & Validation",
    "Internal Controls",
  ],
  highlights: [
    "Prepare reconciliation reports and operational performance summaries while maintaining accurate and confidential financial and claims records.",
    "Coordinate with external insurers and internal finance, administrative and operational teams to resolve discrepancies and support timely settlements.",
    "Bring earlier warehouse and logistics experience involving consignment breakdowns, waybills, delivery releases, delivery itineraries and operational reporting.",
    "Applied financial accountability experience through budgeting, financial reporting and account reconciliation responsibilities in a leadership role.",
    "Reduced claim rejection rates by 30% through stronger documentation and pre-submission validation, demonstrating accuracy and control discipline.",
  ],
  keywords: [
    "vehicle accounting",
    "driver payments",
    "payment processing",
    "financial records",
    "reconciliation",
    "trip logs",
    "transport records",
    "financial reporting",
    "Microsoft Excel",
    "data accuracy",
    "integrity",
    "logistics",
  ],
  coverLetter: {
    opening:
      "I am writing to apply for the Vehicle Accounting Specialist position at Keda Ghana Ceramics Company Limited. I hold a Bachelor of Science in Accounting and bring practical experience in reconciliation, financial and operational records, reporting, claims finance, and cross-functional coordination, supported by earlier warehouse and logistics exposure.",
    body: [
      "In my current healthcare claims work, I manage reconciliation activities, maintain accurate financial and claims documentation, prepare periodic reports, investigate discrepancies and coordinate with internal teams and external insurance providers to support timely settlements. These responsibilities have strengthened the accuracy, control and follow-through required for payment and records administration.",
      "My earlier warehouse experience also exposed me to consignment breakdowns, waybills, delivery releases, delivery itineraries and operational reporting. This gives me a practical understanding of the importance of complete transport records and the connection between operational documentation and financial accountability.",
      "I am proficient with Microsoft Office, including Excel, and I bring a strong sense of integrity, confidentiality and attention to detail. I would apply these strengths to maintaining driver records, validating trip information, supporting payment calculations, completing reconciliations and preparing dependable reports for management.",
    ],
    closing:
      "I would welcome the opportunity to contribute my accounting background, reconciliation discipline and operational experience to Keda Ghana Ceramics Company Limited as a Vehicle Accounting Specialist.",
  },
};

export const cvCatalog: CvVersion[] = [...cvVersions, vehicleAccountingSpecialist];

export const getCvVersionFromCatalog = (slug?: string) => cvCatalog.find((version) => version.slug === slug);
