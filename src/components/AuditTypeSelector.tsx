
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ClipboardList, FileCheck, FileText, ShieldCheck, Users } from "lucide-react";
import { Audit } from "@/types/audit";
import { getAudits } from "@/utils/auditStorage";

interface AuditTypeSelectorProps {
  onSelectAudit: (auditRef: string) => void;
}

const AuditTypeSelector = ({ onSelectAudit }: AuditTypeSelectorProps) => {
  const [audits, setAudits] = useState<Audit[]>([]);

  useEffect(() => {
    const storedAudits = getAudits();
    // Sort by start date, most recent first
    const sortedAudits = [...storedAudits].sort((a, b) => 
      new Date(b.startDate || b.createdAt).getTime() - 
      new Date(a.startDate || a.createdAt).getTime()
    );
    setAudits(sortedAudits);
  }, []);

  // Map audit types to their respective icons
  const getAuditTypeIcon = (type: string) => {
    switch (type) {
      case "Compliance Audit":
        return ClipboardList;
      case "Product Audit":
        return FileCheck;
      case "Process Audit":
        return FileText;
      case "Unannounced Audit":
      case "Unscheduled Audit":
        return ShieldCheck;
      default:
        return FileText;
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Not Started":
        return "bg-gray-100 text-gray-800";
      case "Preparation":
        return "bg-blue-100 text-blue-800";
      case "On-Site":
        return "bg-yellow-100 text-yellow-800";
      case "Monitoring":
        return "bg-purple-100 text-purple-800";
      case "Closed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Audit Summary</h2>
      <p className="text-gray-600 mb-6">
        Select an audit from the list below to view details or continue your work.
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
            const statusClass = getStatusColor(audit.status || "Not Started");
            
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
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{audit.reference}</span>
                        <Badge className={statusClass}>
                          {audit.status || "Not Started"}
                        </Badge>
                      </div>
                      <span>{audit.type}</span>
                      <span className="text-sm text-gray-600">{audit.description}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium mr-2">Start:</span> 
                      {formatDate(audit.startDate)}
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium mr-2">End:</span> 
                      {formatDate(audit.endDate)}
                    </div>
                    
                    {audit.assignedUsers && audit.assignedUsers.length > 0 && (
                      <div className="flex items-start text-sm">
                        <Users className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                        <div>
                          <span className="font-medium block mb-1">Assigned:</span>
                          <div className="space-y-1">
                            {audit.assignedUsers.map(user => (
                              <div key={user.id} className={user.role === "Qualified Auditor" ? "font-bold" : ""}>
                                {user.username} ({user.role})
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      variant="outline"
                      className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAudit(audit.reference);
                      }}
                    >
                      Select Audit
                    </Button>
                  </div>
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
