
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuditChecklistItem, getAuditChecklist } from "@/utils/auditMatrix";
import { exportReportToExcel } from "@/utils/excelExport";
import { Download, FileText, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getAuditByRef } from "@/utils/auditStorage";

interface AuditReportProps {
  auditRef: string;
  auditType: string;
  findings: Record<string, { compliant: boolean; finding: string; observation: string }>;
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
    const compliantCount = items.filter(item => findings[item.id]?.compliant).length;
    const nonCompliantCount = items.length - compliantCount;
    
    setSummary(`Audit ${auditRef} (${auditData?.name || "Unknown"}) identified ${compliantCount} compliant and ${nonCompliantCount} non-compliant areas. Key findings include issues related to ${nonCompliantCount > 0 ? 'the identified non-compliant areas' : 'no significant areas'}.`);
  }, [auditRef, auditType, findings]);

  const handleExport = () => {
    exportReportToExcel(auditType, summary, checklist, findings, auditRef, audit?.name);
    toast({
      title: "Export Successful",
      description: "The audit report has been exported to Excel.",
    });
  };

  const calculateCompliancePercentage = () => {
    const compliantCount = checklist.filter(item => findings[item.id]?.compliant).length;
    return Math.round((compliantCount / checklist.length) * 100);
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
            Export Report
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
          <CardTitle>Compliance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-3xl font-bold">{calculateCompliancePercentage()}%</div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                {checklist.filter(item => findings[item.id]?.compliant).length} Compliant
              </Badge>
              <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                {checklist.filter(item => !findings[item.id]?.compliant).length} Non-compliant
              </Badge>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${calculateCompliancePercentage()}%` }}
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
              <h3 className="font-medium text-lg mb-3">Non-compliant Areas</h3>
              {checklist.filter(item => !findings[item.id]?.compliant).length === 0 ? (
                <p className="text-gray-500 italic">No non-compliant areas found.</p>
              ) : (
                <div className="space-y-4">
                  {checklist
                    .filter(item => !findings[item.id]?.compliant)
                    .map((item) => (
                      <div key={item.id} className="border-l-4 border-red-500 pl-4 py-2">
                        <h4 className="font-medium">{item.clause}</h4>
                        <p className="text-gray-700">{item.objective}</p>
                        <p className="text-gray-600 mt-1">
                          <span className="font-medium">Finding: </span>
                          {findings[item.id]?.finding || "No details provided"}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium text-lg mb-3">Compliant Areas</h3>
              {checklist.filter(item => findings[item.id]?.compliant).length === 0 ? (
                <p className="text-gray-500 italic">No compliant areas found.</p>
              ) : (
                <div className="space-y-2">
                  {checklist
                    .filter(item => findings[item.id]?.compliant)
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
