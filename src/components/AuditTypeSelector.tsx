
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, FileCheck, FileText, ShieldCheck } from "lucide-react";
import { Audit } from "@/types/audit";
import { getAudits } from "@/utils/auditStorage";

interface AuditTypeSelectorProps {
  onSelectAudit: (auditRef: string) => void;
}

const AuditTypeSelector = ({ onSelectAudit }: AuditTypeSelectorProps) => {
  const [audits, setAudits] = useState<Audit[]>([]);

  useEffect(() => {
    const storedAudits = getAudits();
    setAudits(storedAudits);
  }, []);

  // Map audit types to their respective icons
  const getAuditTypeIcon = (type: string) => {
    switch (type) {
      case "Financial Audit":
        return FileText;
      case "Compliance Audit":
        return ClipboardList;
      case "Operational Audit":
        return FileCheck;
      case "IT Audit":
        return ShieldCheck;
      default:
        return FileText;
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Select Audit</h2>
      <p className="text-gray-600 mb-6">
        Choose the audit you want to work on from the list below.
      </p>
      
      {audits.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No audits found. Please create an audit in the admin panel.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.href = "/admin"}
          >
            Go to Admin Panel
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {audits.map((audit) => {
            const IconComponent = getAuditTypeIcon(audit.type);
            
            return (
              <Card 
                key={audit.reference} 
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-500"
                onClick={() => onSelectAudit(audit.reference)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{audit.name}</CardTitle>
                    <IconComponent className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardDescription>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{audit.reference}</span>
                      <span>{audit.type}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline"
                    className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onSelectAudit(audit.reference)}
                  >
                    Select
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AuditTypeSelector;
