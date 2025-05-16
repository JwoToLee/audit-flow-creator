
import { AuditChecklistItem } from "./auditMatrix";

export const exportToExcel = (
  auditType: string,
  checklist: AuditChecklistItem[],
  findings: Record<string, { compliant: boolean; finding: string; observation: string }>,
) => {
  // Convert data to CSV format
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Clause,Objective,Description,Compliance Status,Finding,Observation\n";

  checklist.forEach((item) => {
    const findingData = findings[item.id] || { compliant: false, finding: "", observation: "" };
    
    // Format values - handle commas and quotes
    const formatValue = (val: string) => `"${val.replace(/"/g, '""')}"`;
    
    // Add row for each checklist item
    csvContent += [
      formatValue(item.clause),
      formatValue(item.objective),
      formatValue(item.description),
      formatValue(findingData.compliant ? "Compliant" : "Non-compliant"),
      formatValue(findingData.finding),
      formatValue(findingData.observation),
    ].join(",") + "\n";
  });

  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${auditType}_audit_checklist_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
};

export const exportReportToExcel = (
  auditType: string,
  summary: string,
  checklist: AuditChecklistItem[],
  findings: Record<string, { compliant: boolean; finding: string; observation: string }>,
) => {
  // Convert data to CSV format
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add report header
  csvContent += `"${auditType.toUpperCase()} AUDIT REPORT"\n\n`;
  csvContent += `"Generated on: ${new Date().toLocaleString()}"\n\n`;
  csvContent += `"EXECUTIVE SUMMARY:"\n"${summary.replace(/"/g, '""')}"\n\n`;
  
  // Add findings overview
  csvContent += "FINDINGS OVERVIEW:\n";
  csvContent += "Clause,Compliance Status,Finding\n";
  
  const nonCompliantItems = checklist.filter(item => !findings[item.id]?.compliant);
  const compliantItems = checklist.filter(item => findings[item.id]?.compliant);
  
  // Add non-compliant items first
  nonCompliantItems.forEach((item) => {
    const findingData = findings[item.id];
    csvContent += `"${item.clause}","Non-compliant","${findingData.finding.replace(/"/g, '""')}"\n`;
  });
  
  // Add compliant items
  compliantItems.forEach((item) => {
    csvContent += `"${item.clause}","Compliant",""\n`;
  });
  
  // Add detailed findings section
  csvContent += "\nDETAILED FINDINGS:\n";
  csvContent += "Clause,Objective,Description,Compliance Status,Finding,Observation\n";
  
  checklist.forEach((item) => {
    const findingData = findings[item.id] || { compliant: false, finding: "", observation: "" };
    
    // Format values - handle commas and quotes
    const formatValue = (val: string) => `"${val.replace(/"/g, '""')}"`;
    
    // Add row for each checklist item
    csvContent += [
      formatValue(item.clause),
      formatValue(item.objective),
      formatValue(item.description),
      formatValue(findingData.compliant ? "Compliant" : "Non-compliant"),
      formatValue(findingData.finding),
      formatValue(findingData.observation),
    ].join(",") + "\n";
  });

  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${auditType}_audit_report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
};
