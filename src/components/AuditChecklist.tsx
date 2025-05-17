
import React, { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AuditChecklistItem, getAuditChecklist } from '@/utils/auditMatrix';
import { exportToExcel } from '@/utils/excelExport';
import { Check, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getAuditByRef, getFindingsByAuditRef, saveFindings } from '@/utils/auditStorage';

interface AuditChecklistProps {
  auditRef: string;
  auditType: string;
  onComplete: (findings: Record<string, any>) => void;
}

const AuditChecklist = ({ auditRef, auditType, onComplete }: AuditChecklistProps) => {
  const [checklist, setChecklist] = useState<AuditChecklistItem[]>([]);
  const [findings, setFindings] = useState<Record<string, { 
    hasFinding: boolean; 
    finding: string; 
    observation: string;
    staffNumber?: string;
    staffName?: string;
    staffScope?: string;
  }>>({});
  const { toast } = useToast();
  
  useEffect(() => {
    const items = getAuditChecklist(auditType);
    setChecklist(items);
    
    // Initialize findings
    const initialFindings: Record<string, any> = {};
    items.forEach(item => {
      initialFindings[item.id] = { 
        hasFinding: false, 
        finding: "", 
        observation: "",
        staffNumber: "",
        staffName: "",
        staffScope: ""
      };
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

  const handleFindingChange = (id: string, checked: boolean) => {
    const updatedFindings = {
      ...findings,
      [id]: { ...findings[id], hasFinding: checked }
    };
    setFindings(updatedFindings);
    autoSaveFindings(updatedFindings);
  };

  const handleFindingTextChange = (id: string, value: string) => {
    const updatedFindings = {
      ...findings,
      [id]: { ...findings[id], finding: value }
    };
    setFindings(updatedFindings);
  };

  const handleObservationChange = (id: string, value: string) => {
    const updatedFindings = {
      ...findings,
      [id]: { ...findings[id], observation: value }
    };
    setFindings(updatedFindings);
  };
  
  const handleStaffInfoChange = (id: string, field: string, value: string) => {
    const updatedFindings = {
      ...findings,
      [id]: { ...findings[id], [field]: value }
    };
    setFindings(updatedFindings);
  };

  // Auto save findings when a field loses focus
  const handleBlur = () => {
    autoSaveFindings(findings);
  };

  const autoSaveFindings = (currentFindings: typeof findings) => {
    // Convert findings to the format expected by saveFindings
    const findingsToSave = Object.entries(currentFindings).map(([checklistItemId, finding]) => ({
      id: crypto.randomUUID(),
      auditRef,
      checklistItemId,
      finding: finding.finding,
      observation: finding.observation,
      year: new Date().getFullYear().toString(),
      isHistorical: false,
      staffNumber: finding.staffNumber,
      staffName: finding.staffName,
      staffScope: finding.staffScope
    }));
    
    saveFindings(findingsToSave);
  };

  const handleSubmit = () => {
    // Validate that all required items have findings details if finding is checked
    const incompleteItems = checklist
      .filter(item => item.required && findings[item.id].hasFinding && !findings[item.id].finding)
      .map(item => item.clause);
    
    if (incompleteItems.length > 0) {
      toast({
        title: "Incomplete Audit",
        description: `Please add finding details for: ${incompleteItems.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    // Auto save final state
    autoSaveFindings(findings);
    
    onComplete(findings);
  };

  const handleExport = () => {
    const audit = getAuditByRef(auditRef);
    if (audit) {
      exportToExcel(auditRef, audit.name, checklist, findings);
      toast({
        title: "Export Successful",
        description: "The audit checklist has been exported to Excel.",
      });
    }
  };
  
  // Helper function to determine if a clause needs staff info
  const needsStaffInfo = (clause: string) => {
    return clause.includes("145.A.35"); // Example - can be expanded with more clause IDs
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
            Complete the checklist by identifying findings and adding observations
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
          const needsStaff = needsStaffInfo(item.clause);
          
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
                  
                  {needsStaff && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 pb-3 border-b border-gray-200">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700">Staff Number</p>
                        <Input 
                          placeholder="Enter staff number"
                          value={findings[item.id]?.staffNumber || ""}
                          onChange={(e) => handleStaffInfoChange(item.id, "staffNumber", e.target.value)}
                          onBlur={handleBlur}
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700">Staff Name</p>
                        <Input 
                          placeholder="Enter staff name"
                          value={findings[item.id]?.staffName || ""}
                          onChange={(e) => handleStaffInfoChange(item.id, "staffName", e.target.value)}
                          onBlur={handleBlur}
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700">Staff Scope</p>
                        <Input 
                          placeholder="Enter scope of work"
                          value={findings[item.id]?.staffScope || ""}
                          onChange={(e) => handleStaffInfoChange(item.id, "staffScope", e.target.value)}
                          onBlur={handleBlur}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id={`finding-${item.id}`}
                      checked={findings[item.id]?.hasFinding || false}
                      onCheckedChange={(checked) => handleFindingChange(item.id, checked === true)}
                    />
                    <label
                      htmlFor={`finding-${item.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Finding Identified
                    </label>
                  </div>
                  
                  {findings[item.id]?.hasFinding && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Finding Details{item.required ? "*" : ""}:
                      </label>
                      <Textarea
                        value={findings[item.id]?.finding || ""}
                        onChange={(e) => handleFindingTextChange(item.id, e.target.value)}
                        onBlur={handleBlur}
                        placeholder="Describe the finding in detail"
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
                      onBlur={handleBlur}
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
