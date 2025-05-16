
// This file contains the matrix that maps audit types to their requirements

export type AuditChecklistItem = {
  id: string;
  clause: string;
  objective: string;
  description: string;
  required: boolean;
};

type AuditMatrix = Record<string, AuditChecklistItem[]>;

export const auditMatrix: AuditMatrix = {
  financial: [
    {
      id: "f-1",
      clause: "F.1 Financial Statement Review",
      objective: "Verify accuracy of financial statements",
      description: "Review the financial statements for accuracy, completeness, and compliance with accounting standards.",
      required: true,
    },
    {
      id: "f-2",
      clause: "F.2 Internal Controls Assessment",
      objective: "Evaluate financial internal controls",
      description: "Assess the effectiveness of internal controls over financial reporting.",
      required: true,
    },
    {
      id: "f-3",
      clause: "F.3 Revenue Recognition",
      objective: "Confirm appropriate revenue recognition",
      description: "Verify that revenue is recognized in accordance with applicable accounting standards.",
      required: true,
    },
    {
      id: "f-4",
      clause: "F.4 Expense Validation",
      objective: "Validate expense categorization",
      description: "Confirm expenses are properly categorized and recorded in the appropriate accounting period.",
      required: true,
    },
    {
      id: "f-5",
      clause: "F.5 Asset Verification",
      objective: "Verify existence and valuation of assets",
      description: "Confirm the existence, ownership, and valuation of reported assets.",
      required: true,
    },
  ],
  compliance: [
    {
      id: "c-1",
      clause: "C.1 Regulatory Compliance",
      objective: "Verify compliance with regulatory requirements",
      description: "Assess adherence to applicable laws, regulations, and standards.",
      required: true,
    },
    {
      id: "c-2",
      clause: "C.2 Policy Implementation",
      objective: "Confirm implementation of required policies",
      description: "Verify that organizational policies are properly implemented and followed.",
      required: true,
    },
    {
      id: "c-3",
      clause: "C.3 Documentation Review",
      objective: "Ensure documentation completeness",
      description: "Review required documentation for completeness and accuracy.",
      required: true,
    },
    {
      id: "c-4",
      clause: "C.4 Training Assessment",
      objective: "Verify staff training on compliance matters",
      description: "Confirm staff are properly trained on relevant compliance requirements.",
      required: true,
    },
    {
      id: "c-5",
      clause: "C.5 Incident Reporting",
      objective: "Evaluate incident reporting mechanisms",
      description: "Assess processes for reporting and managing compliance incidents.",
      required: true,
    },
  ],
  operational: [
    {
      id: "o-1",
      clause: "O.1 Process Efficiency",
      objective: "Evaluate operational efficiency",
      description: "Assess the efficiency of operational processes and workflows.",
      required: true,
    },
    {
      id: "o-2",
      clause: "O.2 Resource Utilization",
      objective: "Review resource allocation and utilization",
      description: "Evaluate the allocation and utilization of resources within operations.",
      required: true,
    },
    {
      id: "o-3",
      clause: "O.3 Quality Control",
      objective: "Assess quality control measures",
      description: "Review quality control procedures and their implementation.",
      required: true,
    },
    {
      id: "o-4",
      clause: "O.4 Performance Metrics",
      objective: "Evaluate performance measurement",
      description: "Assess the definition, tracking, and use of operational performance metrics.",
      required: true,
    },
    {
      id: "o-5",
      clause: "O.5 Risk Management",
      objective: "Review operational risk management",
      description: "Evaluate processes for identifying, assessing, and managing operational risks.",
      required: true,
    },
  ],
  it: [
    {
      id: "it-1",
      clause: "IT.1 Access Controls",
      objective: "Verify system access controls",
      description: "Assess controls over user access to systems and data.",
      required: true,
    },
    {
      id: "it-2",
      clause: "IT.2 Data Security",
      objective: "Evaluate data protection measures",
      description: "Review measures in place to protect sensitive data.",
      required: true,
    },
    {
      id: "it-3",
      clause: "IT.3 Change Management",
      objective: "Assess IT change management process",
      description: "Evaluate processes for managing changes to IT systems.",
      required: true,
    },
    {
      id: "it-4",
      clause: "IT.4 Backup and Recovery",
      objective: "Review data backup and recovery procedures",
      description: "Assess procedures for backing up data and recovering systems.",
      required: true,
    },
    {
      id: "it-5",
      clause: "IT.5 Incident Response",
      objective: "Evaluate IT incident response capabilities",
      description: "Review processes for detecting, responding to, and recovering from IT incidents.",
      required: true,
    },
  ],
};

export const getAuditChecklist = (auditType: string): AuditChecklistItem[] => {
  return auditMatrix[auditType] || [];
};
