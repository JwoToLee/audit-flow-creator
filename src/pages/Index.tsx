
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuditTypeSelector from "@/components/AuditTypeSelector";
import AuditChecklist from "@/components/AuditChecklist";
import AuditReport from "@/components/AuditReport";
import AuditNavigation from "@/components/AuditNavigation";
import { Button } from "@/components/ui/button";
import { Audit } from "@/types/audit";
import { getAuditByRef } from "@/utils/auditStorage";
import { useAuth } from "@/utils/authContext";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<"select" | "checklist" | "report">("select");
  const [selectedAuditRef, setSelectedAuditRef] = useState<string | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [auditFindings, setAuditFindings] = useState<Record<string, any>>({});
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedAuditRef) {
      const audit = getAuditByRef(selectedAuditRef);
      setSelectedAudit(audit || null);
    }
  }, [selectedAuditRef]);

  const handleAuditSelect = (auditRef: string) => {
    setSelectedAuditRef(auditRef);
    setCurrentStep("checklist");
  };

  const handleChecklistComplete = (findings: Record<string, any>) => {
    setAuditFindings(findings);
    setCurrentStep("report");
  };

  const handleNewAudit = () => {
    setSelectedAuditRef(null);
    setSelectedAudit(null);
    setAuditFindings({});
    setCurrentStep("select");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Flow Creator</h1>
            <p className="mt-2 text-lg text-gray-600">Generate professional audit checklists and reports</p>
          </div>
          <div>
            {isAuthenticated ? (
              <Button onClick={() => navigate("/admin")}>Admin Panel</Button>
            ) : (
              <Button onClick={() => navigate("/login")}>Login</Button>
            )}
          </div>
        </header>

        <AuditNavigation 
          currentStep={currentStep} 
          onStepChange={setCurrentStep}
          canNavigate={{
            checklist: !!selectedAuditRef,
            report: Object.keys(auditFindings).length > 0
          }}
        />

        <div className="mt-8 bg-white shadow rounded-lg">
          {currentStep === "select" && (
            <AuditTypeSelector onSelectAudit={handleAuditSelect} />
          )}
          
          {currentStep === "checklist" && selectedAudit && (
            <AuditChecklist 
              auditRef={selectedAuditRef!}
              auditType={selectedAudit.type.split(' ')[0].toLowerCase()} 
              onComplete={handleChecklistComplete} 
            />
          )}
          
          {currentStep === "report" && selectedAudit && (
            <AuditReport 
              auditRef={selectedAuditRef!}
              auditType={selectedAudit.type.split(' ')[0].toLowerCase()} 
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
