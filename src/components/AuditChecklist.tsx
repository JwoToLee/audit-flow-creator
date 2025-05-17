
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AuditChecklistItem, getAuditChecklist } from "@/utils/auditMatrix";
import { exportToExcel } from "@/utils/excelExport";
import { Check, Download, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getAuditByRef, getFindingsByAuditRef } from "@/utils/auditStorage";

interface AuditChecklistProps {
  auditRef: string;
  auditType: string;
  onComplete: (findings: Record<string, any>) => void;
}

const AuditChecklist = ({ auditRef, auditType, onComplete }: AuditChecklistProps) => {
  const [checklist, setChecklist] = useState<AuditChecklistItem[]>([]);
  const [findings, setFindings] = useState<Record<string, { compliant: boolean; finding: string; observation: string }>>({});
  const { toast } = useToast();
  
  useEffect(() => {
    const items = getAuditChecklist(auditType);
    setChecklist(items);
    
    // Initialize findings
    const initialFindings: Record<string, { compliant: boolean; finding: string; observation: string }> = {};
    items.forEach(item => {
      initialFindings[item.id] = { compliant: false, finding: "", observation: "" };
    });

    // Check for historical findings
    const historicalFindings = getFindingsByAuditRef(auditRef);
    
    if (historicalFindings.length > 0) {
      // Notify user about historical findings
      toast({
        title: "Historical Findings Available",
        description: `${historicalFindings.length} previous findings found for this audit.`,
      });

      // Pre-fill findings based on historical data
      historicalFindings.forEach(hf => {
        if (initialFindings[hf.checklistItemId]) {
          initialFindings[hf.checklistItemId] = {
            ...initialFindings[hf.checklistItemId],
            finding: `[Previous finding from ${hf.year}]: ${hf.finding}`,
            observation: initialFindings[hf.checklistItemId].observation || hf.observation
          };
        }
      });
    }
    
    setFindings(initialFindings);
  }, [auditRef, auditType, toast]);

  const handleComplianceChange = (id: string, checked: boolean) => {
    setFindings(prev => ({
      ...prev,
      [id]: { ...prev[id], compliant: checked }
    }));
  };

  const handleFindingChange = (id: string, value: string) => {
    setFindings(prev => ({
      ...prev,
      [id]: { ...prev[id], finding: value }
    }));
  };

  const handleObservationChange = (id: string, value: string) => {
    setFindings(prev => ({
      ...prev,
      [id]: { ...prev[id], observation: value }
    }));
  };

  const handleSubmit = () => {
    // Validate that all required items have findings if non-compliant
    const incompleteItems = checklist
      .filter(item => item.required && !findings[item.id].compliant && !findings[item.id].finding)
      .map(item => item.clause);
    
    if (incompleteItems.length > 0) {
      toast({
        title: "Incomplete Audit",
        description: `Please add findings for the following non-compliant items: ${incompleteItems.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    
    onComplete(findings);
  };

  const handleExport = () => {
    const audit = getAuditByRef(auditRef);
    if (audit) {
      exportToExcel(auditType, checklist, findings, audit.reference, audit.name);
      toast({
        title: "Export Successful",
        description: "The audit checklist has been exported to Excel.",
      });
    }
  };

  if (checklist.length === 0) {
    return <div className="p-6">Loading checklist...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {auditType.charAt(0).toUpperCase() + auditType.slice(1)} Audit Checklist
          </h2>
          <p className="text-gray-600">
            Complete the checklist by marking compliance status and adding findings where necessary.
          </p>
          {auditRef && (
            <p className="text-sm font-medium text-blue-600 mt-1">
              Audit Reference: {auditRef}
            </p>
          )}
        </div>
        <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      <div className="space-y-6">
        {checklist.map((item) => {
          const hasHistoricalFinding = findings[item.id]?.finding?.startsWith('[Previous finding');
          
          return (
            <Card key={item.id} className={`border-l-4 ${hasHistoricalFinding ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-start">
                  <span className="font-medium">{item.clause}</span>
                  <span className="text-sm text-gray-500 ml-2">({item.required ? "Required" : "Optional"})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-700">Objective:</p>
                    <p className="text-gray-600">{item.objective}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Description:</p>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id={`compliance-${item.id}`}
                      checked={findings[item.id]?.compliant || false}
                      onCheckedChange={(checked) => handleComplianceChange(item.id, checked === true)}
                    />
                    <label
                      htmlFor={`compliance-${item.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Compliant
                    </label>
                  </div>
                  
                  {!findings[item.id]?.compliant && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Finding{item.required ? "*" : ""}:
                      </label>
                      <Textarea
                        value={findings[item.id]?.finding || ""}
                        onChange={(e) => handleFindingChange(item.id, e.target.value)}
                        placeholder="Describe the non-compliance issue"
                        className={`resize-none ${hasHistoricalFinding ? 'bg-amber-50' : ''}`}
                        rows={3}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Observations:
                    </label>
                    <Textarea
                      value={findings[item.id]?.observation || ""}
                      onChange={(e) => handleObservationChange(item.id, e.target.value)}
                      placeholder="Add any additional observations or notes"
                      className="resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-8 flex justify-end">
        <Button onClick={handleSubmit} className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          Complete Audit
        </Button>
      </div>
    </div>
  );
};

export default AuditChecklist;
