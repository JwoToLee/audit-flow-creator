
// Excel export functionality
import { AuditChecklistItem } from "./auditMatrix";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Export checklist to Excel
export const exportToExcel = (
  auditRef: string,
  auditName: string,
  checklist: AuditChecklistItem[],
  findings: Record<string, { hasFinding: boolean; finding: string; observation: string; staffNumber?: string; staffName?: string; staffScope?: string; }>
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
  findings: Record<string, { hasFinding: boolean; finding: string; observation: string; staffNumber?: string; staffName?: string; staffScope?: string; }>
) => {
  // This is a placeholder for Excel export functionality
  console.log("Exporting report to Excel", { auditRef, auditName, summary, checklist, findings });
  
  // Mock download by creating a text file for now
  const content = generateReportCSV(auditRef, auditName || "Unknown", summary, checklist, findings);
  downloadFile(content, `${auditRef}_report.csv`, "text/csv");
};

// Export report to Word (as docx)
export const exportReportToWord = (
  auditRef: string,
  auditName: string | undefined,
  summary: string,
  checklist: AuditChecklistItem[],
  findings: Record<string, { hasFinding: boolean; finding: string; observation: string; staffNumber?: string; staffName?: string; staffScope?: string; }>
) => {
  // In a real implementation, this would generate a .docx file
  // For now, we'll create a text file with formatting that resembles a Word doc
  const content = generateReportDoc(auditRef, auditName || "Unknown", summary, checklist, findings);
  downloadFile(content, `${auditRef}_report.txt`, "text/plain");
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
  findings: Record<string, { hasFinding: boolean; finding: string; observation: string; }>
) => {
  const header = "Clause,Objective,Description,Compliance Status,Finding,Observation\n";
  const rows = checklist.map(item => {
    const status = findings[item.id]?.hasFinding ? "Non-compliant" : "Compliant";
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
  findings: Record<string, { hasFinding: boolean; finding: string; observation: string; }>
) => {
  const compliantCount = checklist.filter(item => !findings[item.id]?.hasFinding).length;
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
  checklist.filter(item => findings[item.id]?.hasFinding).forEach(item => {
    content += `Clause: ${item.clause}\n`;
    content += `Objective: ${item.objective}\n`;
    content += `Finding: ${findings[item.id]?.finding || "No details provided"}\n\n`;
  });
  
  content += `Compliant Areas:\n\n`;
  checklist.filter(item => !findings[item.id]?.hasFinding).forEach(item => {
    content += `Clause: ${item.clause}\n`;
    content += `Objective: ${item.objective}\n`;
    if (findings[item.id]?.observation) {
      content += `Observation: ${findings[item.id]?.observation}\n`;
    }
    content += `\n`;
  });
  
  return content;
};

// Generate Word document content 
const generateReportDoc = (
  auditRef: string,
  auditName: string,
  summary: string,
  checklist: AuditChecklistItem[],
  findings: Record<string, { hasFinding: boolean; finding: string; observation: string; }>
) => {
  const compliantCount = checklist.filter(item => !findings[item.id]?.hasFinding).length;
  const nonCompliantCount = checklist.filter(item => findings[item.id]?.hasFinding).length;
  const compliancePercentage = Math.round((compliantCount / checklist.length) * 100);
  
  // Build report content with some formatting
  let content = `AUDIT REPORT - ${auditRef}\n`;
  content += `==============================================\n\n`;
  content += `Audit Name: ${auditName}\n`;
  content += `Reference: ${auditRef}\n`;
  content += `Date: ${new Date().toLocaleDateString()}\n\n`;
  
  content += `EXECUTIVE SUMMARY\n`;
  content += `----------------------------------------------\n`;
  content += `${summary}\n\n`;
  
  content += `COMPLIANCE OVERVIEW\n`;
  content += `----------------------------------------------\n`;
  content += `Compliance Rate: ${compliancePercentage}%\n`;
  content += `Compliant Items: ${compliantCount}\n`;
  content += `Non-compliant Items: ${nonCompliantCount}\n\n`;
  
  content += `FINDINGS\n`;
  content += `----------------------------------------------\n\n`;
  
  const findingsWithIssues = checklist.filter(item => findings[item.id]?.hasFinding);
  if (findingsWithIssues.length === 0) {
    content += `No findings identified in this audit.\n\n`;
  } else {
    findingsWithIssues.forEach((item, index) => {
      content += `Finding ${index + 1}: ${item.clause}\n`;
      content += `Objective: ${item.objective}\n`;
      content += `Description: ${item.description}\n`;
      content += `Finding: ${findings[item.id].finding || "No details provided"}\n`;
      
      if (findings[item.id]?.staffName) {
        content += `Staff: ${findings[item.id].staffName}\n`;
        content += `Staff Number: ${findings[item.id].staffNumber}\n`;
        content += `Staff Scope: ${findings[item.id].staffScope}\n`;
      }
      
      content += `\n`;
    });
  }
  
  content += `COMPLIANT AREAS\n`;
  content += `----------------------------------------------\n\n`;
  
  checklist.filter(item => !findings[item.id]?.hasFinding).forEach(item => {
    content += `${item.clause}: ${item.objective}\n`;
    if (findings[item.id]?.observation) {
      content += `Observation: ${findings[item.id].observation}\n`;
    }
    content += `\n`;
  });
  
  content += `==============================================\n`;
  content += `End of Report - Page ${Math.ceil((content.split('\n').length + 5) / 40)}\n`;
  
  return content;
};
