
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuditChecklistItem, getAuditChecklist } from "@/utils/auditMatrix";
import { exportReportToExcel, exportReportToWord } from "@/utils/excelExport";
import { Download, FileText, Plus, FileOutput } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getAuditByRef, saveAudit } from "@/utils/auditStorage";

interface AuditReportProps {
  auditRef: string;
  auditType: string;
  findings: Record<string, { 
    hasFinding: boolean; 
    finding: string; 
    observation: string;
    staffNumber?: string;
    staffName?: string;
    staffScope?: string;
  }>;
  onNewAudit: () => void;
}

const AuditReport = ({ auditRef, auditType, findings, onNewAudit }: AuditReportProps) => {
  const [checklist, setChecklist] = useState<AuditChecklistItem[]>([]);
  const [summary, setSummary] = useState("");
  const [audit, setAudit] = useState<any>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const items = getAuditChecklist(auditType);
    setChecklist(items);
    
    const auditData = getAuditByRef(auditRef);
    setAudit(auditData);
    
    // Generate default summary
    const findingCount = items.filter(item => findings[item.id]?.hasFinding).length;
    const compliantCount = items.length - findingCount;
    
    setSummary(`Audit ${auditRef} (${auditData?.name || "Unknown"}) identified ${findingCount} findings and ${compliantCount} compliant areas. Key findings include issues related to ${findingCount > 0 ? 'the identified non-compliant areas' : 'no significant areas'}.`);
    
    // Update audit status to "Closed" when report is generated
    if (auditData) {
      const updatedAudit = {
        ...auditData,
        status: "Closed"
      };
      saveAudit(updatedAudit);
    }
  }, [auditRef, auditType, findings]);

  const handleExport = () => {
    exportReportToExcel(auditRef, audit?.name, summary, checklist, findings);
    toast({
      title: "Export Successful",
      description: "The audit report has been exported to Excel.",
    });
  };
  
  const handleExportWord = () => {
    exportReportToWord(auditRef, audit?.name, summary, checklist, findings);
    toast({
      title: "Report Generated",
      description: "Your audit report has been generated as a Word document.",
    });
  };

  const calculateFindingPercentage = () => {
    const findingCount = checklist.filter(item => findings[item.id]?.hasFinding).length;
    return Math.round((findingCount / checklist.length) * 100);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {auditType.charAt(0).toUpperCase() + auditType.slice(1)} Audit Report
          </h2>
          <p className="text-gray-600">
            Review and export your audit findings and report.
          </p>
          {auditRef && (
            <p className="text-sm font-medium text-blue-600 mt-1">
              Audit Reference: {auditRef} {audit?.name ? `- ${audit.name}` : ""}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
          <Button variant="outline" onClick={handleExportWord} className="flex items-center gap-2">
            <FileOutput className="h-4 w-4" />
            Export to Word
          </Button>
          <Button onClick={onNewAudit} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Audit
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="resize-none"
            rows={4}
          />
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Report Cover Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-lg font-semibold mb-2">Audit Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium">Reference:</p>
                  <p className="text-gray-700">{auditRef}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Name:</p>
                  <p className="text-gray-700">{audit?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Type:</p>
                  <p className="text-gray-700">{audit?.type || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Dates:</p>
                  <p className="text-gray-700">
                    {audit?.startDate ? new Date(audit.startDate).toLocaleDateString() : "N/A"} - 
                    {audit?.endDate ? new Date(audit.endDate).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-b pb-3">
              <h3 className="text-lg font-semibold mb-2">Audit Scope</h3>
              <p className="text-gray-700 whitespace-pre-line">{audit?.scope || "No scope defined"}</p>
            </div>
            
            <div className="border-b pb-3">
              <h3 className="text-lg font-semibold mb-2">Audit Objective</h3>
              <p className="text-gray-700 whitespace-pre-line">{audit?.objective || "No objective defined"}</p>
            </div>
            
            <div className="border-b pb-3">
              <h3 className="text-lg font-semibold mb-2">Introduction</h3>
              <p className="text-gray-700 whitespace-pre-line">{audit?.introduction || "No introduction provided"}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Signatures</h3>
              <div className="space-y-6">
                {audit?.assignedUsers && audit.assignedUsers
                  .filter((user: any) => user.role === "Auditor" || user.role === "Lead Auditor")
                  .map((user: any, index: number) => (
                    <div key={index} className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <p className="font-medium">{user.username} ({user.role})</p>
                      </div>
                      <div className="col-span-1">
                        <p className="text-gray-600">Date: ____________</p>
                      </div>
                      <div className="col-span-1">
                        <p className="text-gray-600">Signature: ____________</p>
                      </div>
                    </div>
                  ))
                }
                
                {/* QA Department Head signature line (always shown) */}
                <div className="grid grid-cols-3 gap-4 border-t pt-3">
                  <div className="col-span-1">
                    <p className="font-medium">QA Department Head</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-gray-600">Date: ____________</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-gray-600">Signature: ____________</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Findings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-3xl font-bold">
              {checklist.filter(item => findings[item.id]?.hasFinding).length} Findings
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                {checklist.filter(item => !findings[item.id]?.hasFinding).length} Compliant
              </Badge>
              <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                {checklist.filter(item => findings[item.id]?.hasFinding).length} Findings
              </Badge>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <div 
              className="bg-red-600 h-2.5 rounded-full" 
              style={{ width: `${calculateFindingPercentage()}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-lg mb-3">Identified Findings</h3>
              {checklist.filter(item => findings[item.id]?.hasFinding).length === 0 ? (
                <p className="text-gray-500 italic">No findings identified in this audit.</p>
              ) : (
                <div className="space-y-4">
                  {checklist
                    .filter(item => findings[item.id]?.hasFinding)
                    .map((item) => (
                      <div key={item.id} className="border-l-4 border-red-500 pl-4 py-2">
                        <h4 className="font-medium">{item.clause}</h4>
                        <p className="text-gray-700">{item.objective}</p>
                        <p className="text-gray-600 mt-1">
                          <span className="font-medium">Finding: </span>
                          {findings[item.id]?.finding || "No details provided"}
                        </p>
                        {findings[item.id]?.staffName && (
                          <div className="mt-1 text-sm">
                            <p><span className="font-medium">Staff: </span>{findings[item.id].staffName}</p>
                            <p><span className="font-medium">Staff #: </span>{findings[item.id].staffNumber}</p>
                            <p><span className="font-medium">Scope: </span>{findings[item.id].staffScope}</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium text-lg mb-3">Compliant Areas</h3>
              {checklist.filter(item => !findings[item.id]?.hasFinding).length === 0 ? (
                <p className="text-gray-500 italic">No compliant areas found.</p>
              ) : (
                <div className="space-y-2">
                  {checklist
                    .filter(item => !findings[item.id]?.hasFinding)
                    .map((item) => (
                      <div key={item.id} className="border-l-4 border-green-500 pl-4 py-2">
                        <h4 className="font-medium">{item.clause}</h4>
                        <p className="text-gray-600">{item.objective}</p>
                        {findings[item.id]?.observation && (
                          <p className="text-gray-600 mt-1">
                            <span className="font-medium">Observation: </span>
                            {findings[item.id]?.observation}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditReport;
