
import { useState } from "react";
import AuditTypeSelector from "@/components/AuditTypeSelector";
import AuditChecklist from "@/components/AuditChecklist";
import AuditReport from "@/components/AuditReport";
import AuditNavigation from "@/components/AuditNavigation";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<"select" | "checklist" | "report">("select");
  const [selectedAuditType, setSelectedAuditType] = useState<string | null>(null);
  const [auditFindings, setAuditFindings] = useState<Record<string, any>>({});

  const handleAuditTypeSelect = (auditType: string) => {
    setSelectedAuditType(auditType);
    setCurrentStep("checklist");
  };

  const handleChecklistComplete = (findings: Record<string, any>) => {
    setAuditFindings(findings);
    setCurrentStep("report");
  };

  const handleNewAudit = () => {
    setSelectedAuditType(null);
    setAuditFindings({});
    setCurrentStep("select");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Audit Flow Creator</h1>
          <p className="mt-2 text-lg text-gray-600">Generate professional audit checklists and reports</p>
        </header>

        <AuditNavigation 
          currentStep={currentStep} 
          onStepChange={setCurrentStep}
          canNavigate={{
            checklist: !!selectedAuditType,
            report: Object.keys(auditFindings).length > 0
          }}
        />

        <div className="mt-8 bg-white shadow rounded-lg">
          {currentStep === "select" && (
            <AuditTypeSelector onSelectAuditType={handleAuditTypeSelect} />
          )}
          
          {currentStep === "checklist" && selectedAuditType && (
            <AuditChecklist 
              auditType={selectedAuditType} 
              onComplete={handleChecklistComplete} 
            />
          )}
          
          {currentStep === "report" && (
            <AuditReport 
              auditType={selectedAuditType!} 
              findings={auditFindings} 
              onNewAudit={handleNewAudit} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
