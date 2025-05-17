
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/utils/authContext";
import { Audit } from "@/types/audit";
import { getAudits, saveAudit, deleteAudit, AUDIT_TYPES } from "@/utils/auditStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit, Plus, Trash2, LogOut, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CSVUploader from "@/components/CSVUploader";

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<Audit | null>(null);

  // Check authentication
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Load audits from storage
  useEffect(() => {
    const loadedAudits = getAudits();
    setAudits(loadedAudits);
  }, []);

  const handleOpenDialog = (audit?: Audit) => {
    if (audit) {
      setCurrentAudit(audit);
    } else {
      setCurrentAudit({
        id: crypto.randomUUID(),
        reference: generateAuditRef(),
        name: "",
        type: AUDIT_TYPES[0],
        createdAt: "",
        updatedAt: ""
      });
    }
    setIsDialogOpen(true);
  };

  const generateAuditRef = () => {
    const year = new Date().getFullYear();
    const existingRefs = audits
      .map(a => a.reference)
      .filter(ref => ref.startsWith(`${year}AUD`))
      .map(ref => parseInt(ref.substring(7), 10));
    
    const maxNumber = existingRefs.length > 0 ? Math.max(...existingRefs) : 0;
    const nextNumber = maxNumber + 1;
    return `${year}AUD${nextNumber.toString().padStart(3, '0')}`;
  };

  const handleAuditChange = (field: keyof Audit, value: string) => {
    if (currentAudit) {
      setCurrentAudit({
        ...currentAudit,
        [field]: value
      });
    }
  };

  const handleSaveAudit = () => {
    if (!currentAudit || !currentAudit.reference || !currentAudit.name || !currentAudit.type) {
      toast.error("Please fill in all required fields");
      return;
    }

    saveAudit(currentAudit);
    setIsDialogOpen(false);
    
    // Refresh audits list
    setAudits(getAudits());
    toast.success(`Audit ${currentAudit.reference} saved successfully`);
  };

  const handleDeleteClick = (audit: Audit) => {
    setCurrentAudit(audit);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (currentAudit) {
      deleteAudit(currentAudit.reference);
      setIsDeleteDialogOpen(false);
      setAudits(audits.filter(a => a.reference !== currentAudit.reference));
      toast.success(`Audit ${currentAudit.reference} deleted successfully`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user && (
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-lg text-gray-600">
                Manage audits and import historical findings
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Logged in as {user.username}</span>
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </header>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Audits</CardTitle>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" /> Add Audit
                  </Button>
                </div>
                <CardDescription>
                  Manage your audit references and details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          No audits found. Click "Add Audit" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      audits.map((audit) => (
                        <TableRow key={audit.reference}>
                          <TableCell className="font-medium">{audit.reference}</TableCell>
                          <TableCell>{audit.name}</TableCell>
                          <TableCell>{audit.type}</TableCell>
                          <TableCell>
                            {new Date(audit.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleOpenDialog(audit)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteClick(audit)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Import Historical Findings</CardTitle>
                <CardDescription>
                  Upload CSV file with previous audit findings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CSVUploader />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Audit Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentAudit && currentAudit.reference.includes("AUD") 
                ? "Edit Audit" 
                : "Add New Audit"}
            </DialogTitle>
            <DialogDescription>
              Enter the audit details below
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference" className="text-right">
                Reference
              </Label>
              <Input
                id="reference"
                value={currentAudit?.reference || ""}
                onChange={(e) => handleAuditChange("reference", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={currentAudit?.name || ""}
                onChange={(e) => handleAuditChange("name", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select 
                value={currentAudit?.type} 
                onValueChange={(value) => handleAuditChange("type", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select audit type" />
                </SelectTrigger>
                <SelectContent>
                  {AUDIT_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAudit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete audit {currentAudit?.reference}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
