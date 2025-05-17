
// Excel export functionality
import { AuditChecklistItem } from "./auditMatrix";

// Export checklist to Excel
export const exportToExcel = (
  auditRef: string,
  auditName: string,
  checklist: AuditChecklistItem[],
  findings: Record<string, { compliant: boolean; finding: string; observation: string }>
) => {
  // This is a placeholder for Excel export functionality
  console.log("Exporting checklist to Excel", { auditRef, auditName, checklist, findings });
  
  // In a real implementation, this would use a library like SheetJS/xlsx
  // to generate an Excel file and trigger a download
  
  // Mock download by creating a text file for now
  const content = generateChecklistCSV(auditRef, auditName, checklist, findings);
  downloadFile(content, `${auditRef}_checklist.csv`, "text/csv");
};

// Export report to Excel
export const exportReportToExcel = (
  auditRef: string,
  auditName: string | undefined,
  summary: string,
  checklist: AuditChecklistItem[],
  findings: Record<string, { compliant: boolean; finding: string; observation: string }>
) => {
  // This is a placeholder for Excel export functionality
  console.log("Exporting report to Excel", { auditRef, auditName, summary, checklist, findings });
  
  // Mock download by creating a text file for now
  const content = generateReportCSV(auditRef, auditName || "Unknown", summary, checklist, findings);
  downloadFile(content, `${auditRef}_report.csv`, "text/csv");
};

// Helper function to download a file
const downloadFile = (content: string, fileName: string, contentType: string) => {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
};

// Generate CSV content for checklist
const generateChecklistCSV = (
  auditRef: string,
  auditName: string,
  checklist: AuditChecklistItem[],
  findings: Record<string, { compliant: boolean; finding: string; observation: string }>
) => {
  const header = "Clause,Objective,Description,Compliance Status,Finding,Observation\n";
  const rows = checklist.map(item => {
    const status = findings[item.id]?.compliant ? "Compliant" : "Non-compliant";
    const finding = findings[item.id]?.finding || "";
    const observation = findings[item.id]?.observation || "";
    
    // Escape fields for CSV format
    const escapeCsv = (text: string) => `"${text.replace(/"/g, '""')}"`;
    
    return [
      escapeCsv(item.clause),
      escapeCsv(item.objective),
      escapeCsv(item.description),
      status,
      escapeCsv(finding),
      escapeCsv(observation)
    ].join(",");
  }).join("\n");
  
  return `Audit Reference: ${auditRef}\nAudit Name: ${auditName}\n\n${header}${rows}`;
};

// Generate CSV content for report
const generateReportCSV = (
  auditRef: string,
  auditName: string,
  summary: string,
  checklist: AuditChecklistItem[],
  findings: Record<string, { compliant: boolean; finding: string; observation: string }>
) => {
  const compliantCount = checklist.filter(item => findings[item.id]?.compliant).length;
  const nonCompliantCount = checklist.length - compliantCount;
  const compliancePercentage = Math.round((compliantCount / checklist.length) * 100);
  
  // Build report content
  let content = `Audit Report\n\n`;
  content += `Reference: ${auditRef}\n`;
  content += `Name: ${auditName}\n\n`;
  content += `Executive Summary:\n${summary}\n\n`;
  content += `Compliance Overview:\n`;
  content += `Compliance Rate: ${compliancePercentage}%\n`;
  content += `Compliant Items: ${compliantCount}\n`;
  content += `Non-compliant Items: ${nonCompliantCount}\n\n`;
  
  content += `Non-compliant Areas:\n\n`;
  checklist.filter(item => !findings[item.id]?.compliant).forEach(item => {
    content += `Clause: ${item.clause}\n`;
    content += `Objective: ${item.objective}\n`;
    content += `Finding: ${findings[item.id]?.finding || "No details provided"}\n\n`;
  });
  
  content += `Compliant Areas:\n\n`;
  checklist.filter(item => findings[item.id]?.compliant).forEach(item => {
    content += `Clause: ${item.clause}\n`;
    content += `Objective: ${item.objective}\n`;
    if (findings[item.id]?.observation) {
      content += `Observation: ${findings[item.id]?.observation}\n`;
    }
    content += `\n`;
  });
  
  return content;
};
