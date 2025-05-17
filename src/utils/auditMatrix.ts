
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
  compliance: [
    {
      id: "c-1",
      clause: "145.A.10 Scope",
      objective: "Verify organization's scope of approval",
      description: "Assess if the organization operates within its defined and approved scope.",
      required: true,
    },
    {
      id: "c-2",
      clause: "145.A.15 Application",
      objective: "Verify application compliance",
      description: "Confirm that the organization has submitted the correct application forms and documentation.",
      required: true,
    },
    {
      id: "c-3",
      clause: "145.A.20 Terms of Approval",
      objective: "Verify terms of approval",
      description: "Check that the organization operates within the terms of its approval.",
      required: true,
    },
    {
      id: "c-4",
      clause: "145.A.25 Facility Requirements",
      objective: "Verify facility compliance",
      description: "Assess if facilities meet the requirements for the work performed.",
      required: true,
    },
    {
      id: "c-5",
      clause: "145.A.30 Personnel Requirements",
      objective: "Verify personnel qualifications",
      description: "Review personnel qualifications, experience, and training records.",
      required: true,
    },
    {
      id: "c-6",
      clause: "145.A.35 Certifying Staff",
      objective: "Verify certifying staff compliance",
      description: "Check that certifying staff are properly qualified and authorized.",
      required: true,
    },
    {
      id: "c-7",
      clause: "145.A.40 Equipment and Tools",
      objective: "Verify equipment and tools",
      description: "Validate that equipment and tools are appropriate, calibrated and maintained.",
      required: true,
    },
    {
      id: "c-8",
      clause: "145.A.42 Components",
      objective: "Verify component management",
      description: "Review procedures for accepting and classifying components.",
      required: true,
    },
    {
      id: "c-9",
      clause: "145.A.45 Maintenance Data",
      objective: "Verify maintenance data",
      description: "Check that appropriate and current maintenance data is available and used.",
      required: true,
    },
    {
      id: "c-10",
      clause: "145.A.47 Production Planning",
      objective: "Verify production planning",
      description: "Assess the effectiveness of production planning procedures.",
      required: true,
    },
  ],
  product: [
    {
      id: "p-1",
      clause: "145.A.50 Certification of Maintenance",
      objective: "Verify maintenance certification",
      description: "Check that maintenance is properly certified with appropriate documentation.",
      required: true,
    },
    {
      id: "p-2",
      clause: "145.A.55 Maintenance Records",
      objective: "Verify maintenance records",
      description: "Review maintenance records for completeness and retention.",
      required: true,
    },
    {
      id: "p-3",
      clause: "145.A.60 Occurrence Reporting",
      objective: "Verify occurrence reporting",
      description: "Assess the reporting of occurrences that seriously hazard aircraft.",
      required: true,
    },
    {
      id: "p-4",
      clause: "145.A.65 Safety and Quality Policy",
      objective: "Verify safety and quality policy",
      description: "Review the organization's safety and quality policy and procedures.",
      required: true,
    },
    {
      id: "p-5",
      clause: "145.A.70 Maintenance Organization Exposition",
      objective: "Verify MOE compliance",
      description: "Check that the Maintenance Organization Exposition is current and followed.",
      required: true,
    },
  ],
  process: [
    {
      id: "pr-1",
      clause: "145.A.75 Privileges of the Organization",
      objective: "Verify organizational privileges",
      description: "Assess if the organization operates within its privileges.",
      required: true,
    },
    {
      id: "pr-2",
      clause: "145.A.80 Limitations on the Organization",
      objective: "Verify organizational limitations",
      description: "Check that the organization respects its limitations.",
      required: true,
    },
    {
      id: "pr-3",
      clause: "145.A.85 Changes to the Organization",
      objective: "Verify change management",
      description: "Review procedures for notifying the authority of changes.",
      required: true,
    },
    {
      id: "pr-4",
      clause: "145.A.90 Continued Validity",
      objective: "Verify continued validity",
      description: "Assess continued validity of organization approval.",
      required: true,
    },
    {
      id: "pr-5",
      clause: "145.A.95 Findings",
      objective: "Verify findings management",
      description: "Review how the organization deals with findings.",
      required: true,
    },
  ],
  unannounced: [
    {
      id: "u-1",
      clause: "145.A.100 Revocation, Suspension and Limitation",
      objective: "Verify compliance status",
      description: "Assess risks of approval revocation, suspension or limitation.",
      required: true,
    },
    {
      id: "u-2",
      clause: "145.A.105 Access",
      objective: "Verify authority access",
      description: "Check that the organization provides appropriate authority access.",
      required: true,
    },
    {
      id: "u-3",
      clause: "145.A.110 Exemptions",
      objective: "Verify exemption management",
      description: "Review procedures for obtaining and managing exemptions.",
      required: true,
    },
    {
      id: "u-4",
      clause: "145.A.115 Compliance Monitoring",
      objective: "Verify compliance monitoring",
      description: "Assess effectiveness of compliance monitoring system.",
      required: true,
    },
    {
      id: "u-5",
      clause: "145.A.120 Means of Compliance",
      objective: "Verify means of compliance",
      description: "Check that the organization uses approved means of compliance.",
      required: true,
    },
  ],
  unscheduled: [
    {
      id: "us-1",
      clause: "145.A.140 Immediate Safety Measures",
      objective: "Verify safety response",
      description: "Assess ability to respond to immediate safety threats.",
      required: true,
    },
    {
      id: "us-2",
      clause: "145.A.155 Personnel Behavior",
      objective: "Verify personnel behavior",
      description: "Review policies regarding personnel behavior and discipline.",
      required: true,
    },
    {
      id: "us-3",
      clause: "145.A.165 Facility Security",
      objective: "Verify facility security",
      description: "Check physical and logical security of facilities.",
      required: true,
    },
    {
      id: "us-4",
      clause: "145.A.180 Record Protection",
      objective: "Verify record protection",
      description: "Assess measures to protect records from alteration and damage.",
      required: true,
    },
    {
      id: "us-5",
      clause: "145.A.205 SMS Implementation",
      objective: "Verify SMS implementation",
      description: "Review implementation of Safety Management System requirements.",
      required: true,
    },
  ],
};

export const getAuditChecklist = (auditType: string): AuditChecklistItem[] => {
  return auditMatrix[auditType] || [];
};
