
import { Audit, AuditFinding } from "@/types/audit";

// Default audit types
export const AUDIT_TYPES = [
  "Compliance Audit",
  "Financial Audit",
  "Operational Audit", 
  "IT Audit"
];

// Get all audits from localStorage
export const getAudits = (): Audit[] => {
  const audits = localStorage.getItem('audits');
  return audits ? JSON.parse(audits) : [];
};

// Get a single audit by reference
export const getAuditByRef = (reference: string): Audit | undefined => {
  const audits = getAudits();
  return audits.find(audit => audit.reference === reference);
};

// Save an audit to localStorage
export const saveAudit = (audit: Audit): void => {
  const audits = getAudits();
  const existingIndex = audits.findIndex(a => a.reference === audit.reference);
  
  if (existingIndex >= 0) {
    // Update existing audit
    audits[existingIndex] = { 
      ...audit, 
      updatedAt: new Date().toISOString()
    };
  } else {
    // Add new audit
    audits.push({ 
      ...audit, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem('audits', JSON.stringify(audits));
};

// Delete an audit from localStorage
export const deleteAudit = (reference: string): void => {
  const audits = getAudits().filter(audit => audit.reference !== reference);
  localStorage.setItem('audits', JSON.stringify(audits));
  
  // Also remove findings for this audit
  removeFindingsByAuditRef(reference);
};

// Get all findings from localStorage
export const getFindings = (): AuditFinding[] => {
  const findings = localStorage.getItem('auditFindings');
  return findings ? JSON.parse(findings) : [];
};

// Get findings for a specific audit
export const getFindingsByAuditRef = (auditRef: string): AuditFinding[] => {
  const findings = getFindings();
  return findings.filter(finding => finding.auditRef === auditRef);
};

// Save findings to localStorage
export const saveFindings = (findings: AuditFinding[]): void => {
  const existingFindings = getFindings();
  
  // Remove existing findings for the same audit(s)
  const auditRefs = [...new Set(findings.map(f => f.auditRef))];
  const filteredFindings = existingFindings.filter(f => !auditRefs.includes(f.auditRef));
  
  // Add new findings
  const updatedFindings = [...filteredFindings, ...findings];
  localStorage.setItem('auditFindings', JSON.stringify(updatedFindings));
};

// Remove findings for a specific audit
export const removeFindingsByAuditRef = (auditRef: string): void => {
  const findings = getFindings().filter(finding => finding.auditRef !== auditRef);
  localStorage.setItem('auditFindings', JSON.stringify(findings));
};

// Import findings from CSV
export const importFindingsFromCSV = (csvData: AuditFinding[]): void => {
  const existingFindings = getFindings();
  
  // Mark all imported findings as historical
  const historicalFindings = csvData.map(finding => ({
    ...finding,
    isHistorical: true
  }));
  
  // Combine existing with new findings
  const combinedFindings = [...existingFindings, ...historicalFindings];
  localStorage.setItem('auditFindings', JSON.stringify(combinedFindings));
};
