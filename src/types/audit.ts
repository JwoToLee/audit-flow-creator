
export interface Audit {
  id: string;
  reference: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditFinding {
  id: string;
  auditRef: string;
  checklistItemId: string;
  finding: string;
  observation: string;
  year: string;
  isHistorical: boolean;
}

export type AuditWithFindings = Audit & {
  findings: AuditFinding[];
};
