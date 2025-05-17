
export interface Audit {
  id: string;
  reference: string;
  name: string;
  type: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  assignedUsers: AssignedUser[];
  createdAt: string;
  updatedAt: string;
  objective?: string;
  scope?: string;
  introduction?: string;
}

export interface AssignedUser {
  id: string;
  username: string;
  role: string;
}

export interface AuditFinding {
  id: string;
  auditRef: string;
  checklistItemId: string;
  finding: string;
  observation: string;
  year: string;
  isHistorical: boolean;
  staffNumber?: string;
  staffName?: string;
  staffScope?: string;
}

export type AuditWithFindings = Audit & {
  findings: AuditFinding[];
};

export interface AuditTemplate {
  type: string;
  objective: string;
  scope: string;
  introduction: string;
}
