
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, FileCheck, FileText, ShieldCheck } from "lucide-react";

interface AuditTypeSelectorProps {
  onSelectAuditType: (auditType: string) => void;
}

const auditTypes = [
  {
    id: "financial",
    title: "Financial Audit",
    description: "Assess financial statements, processes and controls",
    icon: FileText,
  },
  {
    id: "compliance",
    title: "Compliance Audit",
    description: "Verify adherence to regulations, policies and procedures",
    icon: ClipboardList,
  },
  {
    id: "operational",
    title: "Operational Audit",
    description: "Evaluate efficiency and effectiveness of operations",
    icon: FileCheck,
  },
  {
    id: "it",
    title: "IT Audit",
    description: "Examine technology infrastructure, systems and data controls",
    icon: ShieldCheck,
  },
];

const AuditTypeSelector = ({ onSelectAuditType }: AuditTypeSelectorProps) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Select Audit Type</h2>
      <p className="text-gray-600 mb-6">
        Choose the type of audit you want to perform from the options below.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {auditTypes.map((auditType) => (
          <Card 
            key={auditType.id} 
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-500"
            onClick={() => onSelectAuditType(auditType.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{auditType.title}</CardTitle>
                <auditType.icon className="h-5 w-5 text-blue-600" />
              </div>
              <CardDescription>{auditType.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => onSelectAuditType(auditType.id)}
              >
                Select
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AuditTypeSelector;
