
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/utils/authContext";
import { Audit, AuditTemplate } from "@/types/audit";
import { User } from "@/types/user";
import { 
  getAudits, saveAudit, deleteAudit, AUDIT_TYPES, AUDIT_STATUSES,
  getUsers, saveUser, deleteUser, generateUniqueAuditRef,
  isAuditRefUnique, getAuditTemplates, saveAuditTemplate
} from "@/utils/auditStorage";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LogOut, FileText, Upload, UserIcon, Calendar } from "lucide-react";

// Import admin components
import AuditsList from "@/components/admin/AuditsList";
import UsersList from "@/components/admin/UsersList";
import TemplatesList from "@/components/admin/TemplatesList";
import ImportPanel from "@/components/admin/ImportPanel";

// Import dialog components
import AuditDialog from "@/components/admin/dialogs/AuditDialog";
import UserDialog from "@/components/admin/dialogs/UserDialog";
import TemplateDialog from "@/components/admin/dialogs/TemplateDialog";
import ConfirmDeleteDialog from "@/components/admin/dialogs/ConfirmDeleteDialog";

const Admin = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<AuditTemplate[]>([]);
  const [currentAudit, setCurrentAudit] = useState<Partial<Audit> | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentTemplate, setCurrentTemplate] = useState<AuditTemplate | null>(null);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<"audit" | "user">("audit");
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user && !user.isAdmin) {
      navigate("/");
    } else {
      loadData();
      initializePresetData();
    }
  }, [isAuthenticated, user, navigate]);

  const loadData = () => {
    setAudits(getAudits());
    setUsers(getUsers());
    setTemplates(getAuditTemplates());
  };
  
  const initializePresetData = () => {
    // Initialize preset users if they don't exist
    const existingUsers = getUsers();
    
    const presetUsers = [
      { username: "Bryce", password: "admin123", role: "Admin", isAdmin: true },
      { username: "Eric", password: "user123", role: "Auditor", isAdmin: false },
      { username: "Sandra", password: "user123", role: "Auditor", isAdmin: false },
      { username: "Anthony", password: "auditor123", role: "Lead Auditor", isAdmin: false },
      { username: "Vicky", password: "auditor123", role: "Lead Auditor", isAdmin: false },
    ];
    
    let usersAdded = false;
    presetUsers.forEach(presetUser => {
      if (!existingUsers.find((u: User) => u.username === presetUser.username)) {
        saveUser({
          id: crypto.randomUUID(),
          ...presetUser
        });
        usersAdded = true;
      }
    });
    
    // Initialize preset audits if they don't exist
    const existingAudits = getAudits();
    
    const presetAudits = [
      { 
        reference: "2025AUD001", 
        name: "Component Repair", 
        type: "Compliance Audit",
        description: "Audit of component repair processes",
        status: "Not Started" 
      },
      { 
        reference: "2025PD001", 
        name: "B1 Turbine 524", 
        type: "Product Audit",
        description: "Product quality assurance audit",
        status: "Not Started" 
      }
    ];
    
    let auditsAdded = false;
    presetAudits.forEach(presetAudit => {
      if (!existingAudits.find((a: Audit) => a.reference === presetAudit.reference)) {
        saveAudit({
          ...presetAudit,
          assignedUsers: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        auditsAdded = true;
      }
    });
    
    if (usersAdded || auditsAdded) {
      loadData(); // Reload data if new items were added
    }
  };

  // Audit handlers
  const handleAddAudit = () => {
    setCurrentAudit({
      reference: generateUniqueAuditRef(),
      name: "",
      type: AUDIT_TYPES[0],
      description: "",
      startDate: "",
      endDate: "",
      status: AUDIT_STATUSES[0],
      assignedUsers: [],
    });
    setIsAuditDialogOpen(true);
  };

  const handleEditAudit = (audit: Audit) => {
    setCurrentAudit({ ...audit });
    setIsAuditDialogOpen(true);
  };

  const handleDeleteAudit = (audit: Audit) => {
    setDeleteItem(audit);
    setDeleteType("audit");
    setIsConfirmDeleteOpen(true);
  };

  const handleAuditChange = (field: keyof Audit, value: any) => {
    setCurrentAudit((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleAssignUser = (userId: string) => {
    const userToAssign = users.find((user) => user.id === userId);
    if (userToAssign && currentAudit) {
      const assignedUsers = [
        ...(currentAudit.assignedUsers || []),
      ];
      
      // Check if user is already assigned
      if (!assignedUsers.some((u) => u.id === userId)) {
        assignedUsers.push({
          id: userId,
          username: userToAssign.username,
          role: userToAssign.role,
        });
        
        setCurrentAudit({
          ...currentAudit,
          assignedUsers,
        });
      }
    }
  };

  const handleRemoveAssignedUser = (userId: string) => {
    if (currentAudit) {
      const assignedUsers = (currentAudit.assignedUsers || [])
        .filter((u) => u.id !== userId);
      
      setCurrentAudit({
        ...currentAudit,
        assignedUsers,
      });
    }
  };

  const handleSaveAudit = () => {
    if (currentAudit) {
      if (!currentAudit.reference) {
        toast.error("Audit reference is required");
        return;
      }
      
      if (!currentAudit.createdAt && !isAuditRefUnique(currentAudit.reference)) {
        toast.error("Audit reference must be unique");
        return;
      }
      
      saveAudit(currentAudit as Audit);
      setIsAuditDialogOpen(false);
      setCurrentAudit(null);
      loadData();
      toast.success("Audit saved successfully");
    }
  };

  // User handlers
  const handleAddUser = () => {
    setCurrentUser({
      username: "",
      password: "",
      role: "General",
      isAdmin: false,
    });
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setCurrentUser({ ...user, password: "" });
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    if (user.username === "Bryce") {
      toast.error("Cannot delete the main admin user");
      return;
    }
    
    setDeleteItem(user);
    setDeleteType("user");
    setIsConfirmDeleteOpen(true);
  };

  const handleUserChange = (field: string, value: any) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      
      if (field === "role") {
        return { 
          ...prev, 
          [field]: value, 
          isAdmin: value === "Admin" 
        };
      }
      
      return { ...prev, [field]: value };
    });
  };

  const handleSaveUser = () => {
    if (currentUser) {
      if (!currentUser.username) {
        toast.error("Username is required");
        return;
      }
      
      if (!currentUser.id && !currentUser.password) {
        toast.error("Password is required for new users");
        return;
      }
      
      saveUser(currentUser);
      setIsUserDialogOpen(false);
      setCurrentUser(null);
      loadData();
      toast.success("User saved successfully");
    }
  };

  // Template handlers
  const handleAddTemplate = () => {
    setCurrentTemplate({
      type: AUDIT_TYPES[0],
      objective: "",
      scope: "",
      introduction: "",
    });
    setIsTemplateDialogOpen(true);
  };

  const handleEditTemplate = (template: AuditTemplate) => {
    setCurrentTemplate({ ...template });
    setIsTemplateDialogOpen(true);
  };

  const handleTemplateChange = (field: keyof AuditTemplate, value: string) => {
    setCurrentTemplate((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSaveTemplate = () => {
    if (currentTemplate) {
      saveAuditTemplate(currentTemplate);
      setIsTemplateDialogOpen(false);
      setCurrentTemplate(null);
      loadData();
      toast.success("Template saved successfully");
    }
  };

  // Confirm delete handler
  const handleConfirmDelete = () => {
    if (deleteItem) {
      if (deleteType === "audit") {
        deleteAudit(deleteItem.reference);
        toast.success("Audit deleted successfully");
      } else if (deleteType === "user") {
        deleteUser(deleteItem.id);
        toast.success("User deleted successfully");
      }
      
      setIsConfirmDeleteOpen(false);
      setDeleteItem(null);
      loadData();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-lg text-gray-600">
              Manage audits, users and templates
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Logged in as: <span className="font-medium">{user?.username}</span>
            </span>
            <Button variant="outline" onClick={() => navigate("/")} size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Go to Audit Portal
            </Button>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="audits">
          <TabsList>
            <TabsTrigger value="audits" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Audits
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <UserIcon className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Templates & Imports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audits" className="py-4">
            <AuditsList 
              audits={audits}
              onAddAudit={handleAddAudit}
              onEditAudit={handleEditAudit}
              onDeleteAudit={handleDeleteAudit}
            />
          </TabsContent>

          <TabsContent value="users" className="py-4">
            <UsersList 
              users={users}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          </TabsContent>

          <TabsContent value="templates" className="py-4 space-y-6">
            <TemplatesList 
              templates={templates}
              onAddTemplate={handleAddTemplate}
              onEditTemplate={handleEditTemplate}
            />
            <ImportPanel />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <AuditDialog 
          isOpen={isAuditDialogOpen}
          onOpenChange={setIsAuditDialogOpen}
          currentAudit={currentAudit}
          onAuditChange={handleAuditChange}
          onSaveAudit={handleSaveAudit}
          users={users}
          onAssignUser={handleAssignUser}
          onRemoveAssignedUser={handleRemoveAssignedUser}
        />

        <UserDialog 
          isOpen={isUserDialogOpen}
          onOpenChange={setIsUserDialogOpen}
          currentUser={currentUser}
          onUserChange={handleUserChange}
          onSaveUser={handleSaveUser}
        />

        <TemplateDialog 
          isOpen={isTemplateDialogOpen}
          onOpenChange={setIsTemplateDialogOpen}
          currentTemplate={currentTemplate}
          onTemplateChange={handleTemplateChange}
          onSaveTemplate={handleSaveTemplate}
        />

        <ConfirmDeleteDialog 
          isOpen={isConfirmDeleteOpen}
          onOpenChange={setIsConfirmDeleteOpen}
          title={`Delete ${deleteType === "audit" ? "Audit" : "User"}`}
          description={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
          onConfirmDelete={handleConfirmDelete}
        />
      </div>
    </div>
  );
};

export default Admin;
