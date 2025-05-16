
import React from "react";
import { ClipboardCheck, FileText, ListChecks } from "lucide-react";

interface AuditNavigationProps {
  currentStep: "select" | "checklist" | "report";
  onStepChange: (step: "select" | "checklist" | "report") => void;
  canNavigate: {
    checklist: boolean;
    report: boolean;
  };
}

const AuditNavigation = ({ currentStep, onStepChange, canNavigate }: AuditNavigationProps) => {
  const steps = [
    { id: "select", name: "Select Audit Type", icon: ListChecks },
    { id: "checklist", name: "Complete Checklist", icon: ClipboardCheck },
    { id: "report", name: "Generate Report", icon: FileText },
  ];

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center space-x-4 md:space-x-8">
        {steps.map((step, stepIdx) => {
          const stepId = step.id as "select" | "checklist" | "report";
          const isActive = currentStep === stepId;
          const isCompleted = 
            (stepId === "select") ||
            (stepId === "checklist" && canNavigate.report) ||
            (stepId === "report" && false);
            
          const canClick = 
            stepId === "select" || 
            (stepId === "checklist" && canNavigate.checklist) ||
            (stepId === "report" && canNavigate.report);

          return (
            <li key={step.name} className="relative">
              <button
                onClick={() => canClick && onStepChange(stepId)}
                disabled={!canClick}
                className={`group flex items-center ${
                  canClick ? "cursor-pointer hover:text-blue-700" : "cursor-not-allowed opacity-50"
                } ${isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"}`}
              >
                <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                  isActive
                    ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                    : isCompleted
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="ml-2 text-sm font-medium md:text-base">{step.name}</span>
              </button>
              
              {stepIdx !== steps.length - 1 && (
                <div className="hidden md:block absolute top-5 left-full h-px w-5 md:w-8 bg-gray-300" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default AuditNavigation;
