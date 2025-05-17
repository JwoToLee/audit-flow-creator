
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuditFinding, AuditTemplate } from "@/types/audit";
import { Calendar, Download, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getAuditByRef, getFindingsByAuditRef, saveAudit, getAuditTemplates } from "@/utils/auditStorage";

interface AuditPreparationProps {
  auditRef: string;
  onComplete: () => void;
}

const AuditPreparation = ({ auditRef, onComplete }: AuditPreparationProps) => {
  const [audit, setAudit] = useState<any>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [objective, setObjective] = useState<string>("");
  const [scope, setScope] = useState<string>("");
  const [introduction, setIntroduction] = useState<string>("");
  const [historicalFindings, setHistoricalFindings] = useState<AuditFinding[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    const auditData = getAuditByRef(auditRef);
    if (auditData) {
      setAudit(auditData);
      setStartDate(auditData.startDate || "");
      setEndDate(auditData.endDate || "");
      
      // Get template for this audit type
      const templates = getAuditTemplates();
      const template = templates.find((t: AuditTemplate) => t.type === auditData.type);
      
      if (template) {
        setObjective(auditData.objective || template.objective || "");
        setScope(auditData.scope || template.scope || "");
        setIntroduction(auditData.introduction || template.introduction || "");
      }
      
      // Get historical findings
      const findings = getFindingsByAuditRef(auditRef);
      setHistoricalFindings(findings.filter(f => f.isHistorical));
    }
  }, [auditRef]);
  
  const updateAuditStatus = (start: string, end: string): string => {
    const today = new Date();
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    
    if (startDate && endDate) {
      if (today < startDate) {
        return "Preparation";
      } else if (today >= startDate && today <= endDate) {
        return "On-Site";
      } else {
        return "Monitoring";
      }
    }
    
    return "Preparation"; // Default if dates not set
  };
  
  const handleSaveAndContinue = () => {
    if (!audit) return;
    
    // Update audit with new dates, template info, and status
    const status = updateAuditStatus(startDate, endDate);
    
    const updatedAudit = {
      ...audit,
      startDate,
      endDate,
      objective,
      scope,
      introduction,
      status
    };
    
    saveAudit(updatedAudit);
    
    toast({
      title: "Audit preparation saved",
      description: "Your audit preparation data has been saved.",
    });
    
    onComplete();
  };
  
  const handleGeneratePowerPoint = () => {
    toast({
      title: "Generating presentation",
      description: "Opening meeting PowerPoint is being generated.",
    });
    
    // In a real implementation, this would generate and download a PowerPoint
    // For now we'll just show a toast
    setTimeout(() => {
      toast({
        title: "PowerPoint Generated",
        description: "Your opening meeting presentation is ready.",
      });
    }, 1500);
  };
  
  if (!audit) {
    return <div className="p-6">Loading audit data...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Audit Preparation
          </h2>
          <p className="text-gray-600">
            Prepare audit details and review historical findings
          </p>
          {auditRef && (
            <p className="text-sm font-medium text-blue-600 mt-1">
              Audit Reference: {auditRef} - {audit.name}
            </p>
          )}
        </div>
        <Button 
          variant="outline" 
          onClick={handleGeneratePowerPoint}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Generate Opening Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Audit Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Audit Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-2 text-sm text-blue-600">
              <p>Status will be automatically updated based on dates:</p>
              <ul className="list-disc list-inside mt-1 ml-2">
                <li>Before start date: "Preparation"</li>
                <li>Between start and end date: "On-Site"</li>
                <li>After end date: "Monitoring"</li>
                <li>After report generation: "Closed"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        {/* Historical Findings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historical Findings</CardTitle>
          </CardHeader>
          <CardContent>
            {historicalFindings.length > 0 ? (
              <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                {historicalFindings.map((finding, index) => (
                  <div 
                    key={index} 
                    className="border-l-4 border-amber-500 pl-3 py-2"
                  >
                    <p className="text-sm font-medium">Year: {finding.year}</p>
                    <p className="text-sm text-gray-600">{finding.finding}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No historical findings found for this audit.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit Template Fields */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Audit Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="objective">Audit Objective</Label>
            <Textarea
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="scope">Audit Scope</Label>
            <Textarea
              id="scope"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="introduction">Audit Introduction</Label>
            <Textarea
              id="introduction"
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveAndContinue}>
          Save and Continue
        </Button>
      </div>
    </div>
  );
};

export default AuditPreparation;
