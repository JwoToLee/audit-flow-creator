
import { Audit, AuditFinding } from "@/types/audit";
import { User } from "@/types/user";

// Default audit types
export const AUDIT_TYPES = [
  "Compliance Audit",
  "Product Audit",
  "Process Audit",
  "Unannounced Audit",
  "Unscheduled Audit"
];

// Audit status options
export const AUDIT_STATUSES = [
  "Not Started",
  "Preparation",
  "On-Site",
  "Monitoring",
  "Closed"
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

// Generate a unique audit reference
export const generateUniqueAuditRef = (): string => {
  const year = new Date().getFullYear();
  const existingAudits = getAudits();
  
  // Extract numbers from existing audit references for this year
  const existingRefs = existingAudits
    .map(a => a.reference)
    .filter(ref => ref.startsWith(`${year}AUD`))
    .map(ref => parseInt(ref.substring(7), 10));
  
  // Find the maximum number and increment by 1
  const maxNumber = existingRefs.length > 0 ? Math.max(...existingRefs) : 0;
  const nextNumber = maxNumber + 1;
  
  // Format the reference with padded zeros
  return `${year}AUD${nextNumber.toString().padStart(3, '0')}`;
};

// Check if audit reference already exists
export const isAuditRefUnique = (reference: string): boolean => {
  const audits = getAudits();
  return !audits.some(audit => audit.reference === reference);
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

// User management functions
export const getUsers = () => {
  const users = localStorage.getItem('auditUsers');
  return users ? JSON.parse(users) : [];
};

export const saveUser = (user: any) => {
  const users = getUsers();
  const existingIndex = users.findIndex((u: any) => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push({
      ...user,
      id: user.id || crypto.randomUUID()
    });
  }
  
  localStorage.setItem('auditUsers', JSON.stringify(users));
};

export const deleteUser = (userId: string) => {
  const users = getUsers().filter((user: any) => user.id !== userId);
  localStorage.setItem('auditUsers', JSON.stringify(users));
};

// Get audit templates
export const getAuditTemplates = () => {
  const templates = localStorage.getItem('auditTemplates');
  if (!templates) {
    // Initialize with default templates for each audit type
    const defaultTemplates = AUDIT_TYPES.map(type => ({
      type,
      objective: `Standard objective for ${type}`,
      scope: `Standard scope for ${type}`,
      introduction: `Introduction for ${type}`
    }));
    localStorage.setItem('auditTemplates', JSON.stringify(defaultTemplates));
    return defaultTemplates;
  }
  return JSON.parse(templates);
};

export const saveAuditTemplate = (template: any) => {
  const templates = getAuditTemplates();
  const existingIndex = templates.findIndex((t: any) => t.type === template.type);
  
  if (existingIndex >= 0) {
    templates[existingIndex] = template;
  } else {
    templates.push(template);
  }
  
  localStorage.setItem('auditTemplates', JSON.stringify(templates));
};
