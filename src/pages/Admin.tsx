
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/utils/authContext";
import { Audit, AuditTemplate } from "@/types/audit";
import { User, UserRole } from "@/types/user";
import { 
  getAudits, saveAudit, deleteAudit, AUDIT_TYPES, AUDIT_STATUSES,
  getUsers, saveUser, deleteUser, generateUniqueAuditRef,
  isAuditRefUnique, getAuditTemplates, saveAuditTemplate
} from "@/utils/auditStorage";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit, Plus, Trash2, LogOut, Upload, User as UserIcon, FileText, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CSVUploader from "@/components/CSVUploader";

const Admin = () => {
  // State for audits
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [isDeleteAuditDialogOpen, setIsDeleteAuditDialogOpen] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<Partial<Audit> | null>(null);
  
  // State for users
  const [users, setUsers] = useState<any[]>([]);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // State for audit templates
  const [templates, setTemplates] = useState<AuditTemplate[]>([]);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<AuditTemplate | null>(null);
  
  // Auth and navigation
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Load data from storage
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    setAudits(getAudits());
    setUsers(getUsers());
    setTemplates(getAuditTemplates());
  };

  // Dialog handlers for audits
  const handleOpenAuditDialog = (audit?: Audit) => {
    if (audit) {
      setCurrentAudit({...audit});
    } else {
      setCurrentAudit({
        id: crypto.randomUUID(),
        reference: generateUniqueAuditRef(),
        name: "",
        type: AUDIT_TYPES[0],
        description: "",
        startDate: "",
        endDate: "",
        status: "Not Started",
        assignedUsers: [],
        createdAt: "",
        updatedAt: ""
      });
    }
    setIsAuditDialogOpen(true);
  };

  const handleAuditChange = (field: keyof Audit, value: any) => {
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

    // Check if reference is unique for new audits
    if (!currentAudit.createdAt && !isAuditRefUnique(currentAudit.reference)) {
      toast.error("Audit reference must be unique");
      return;
    }
    
    saveAudit(currentAudit as Audit);
    setIsAuditDialogOpen(false);
    
    // Refresh audits list
    setAudits(getAudits());
    toast.success(`Audit ${currentAudit.reference} saved successfully`);
  };

  const handleDeleteAuditClick = (audit: Audit) => {
    setCurrentAudit(audit);
    setIsDeleteAuditDialogOpen(true);
  };

  const handleConfirmDeleteAudit = () => {
    if (currentAudit && currentAudit.reference) {
      deleteAudit(currentAudit.reference);
      setIsDeleteAuditDialogOpen(false);
      setAudits(audits.filter(a => a.reference !== currentAudit.reference));
      toast.success(`Audit ${currentAudit.reference} deleted successfully`);
    }
  };

  // Dialog handlers for users
  const handleOpenUserDialog = (user?: any) => {
    if (user) {
      setCurrentUser({...user});
    } else {
      setCurrentUser({
        id: crypto.randomUUID(),
        username: "",
        password: "",
        role: "General"
      });
    }
    setIsUserDialogOpen(true);
  };

  const handleUserChange = (field: string, value: any) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        [field]: value
      });
    }
  };

  const handleSaveUser = () => {
    if (!currentUser || !currentUser.username || !currentUser.password || !currentUser.role) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    saveUser(currentUser);
    setIsUserDialogOpen(false);
    
    // Refresh users list
    setUsers(getUsers());
    toast.success(`User ${currentUser.username} saved successfully`);
  };

  const handleDeleteUserClick = (user: any) => {
    setCurrentUser(user);
    setIsDeleteUserDialogOpen(true);
  };

  const handleConfirmDeleteUser = () => {
    if (currentUser && currentUser.id) {
      deleteUser(currentUser.id);
      setIsDeleteUserDialogOpen(false);
      setUsers(users.filter(u => u.id !== currentUser.id));
      toast.success(`User ${currentUser.username} deleted successfully`);
    }
  };
  
  // Dialog handlers for audit templates
  const handleOpenTemplateDialog = (template?: AuditTemplate) => {
    if (template) {
      setCurrentTemplate({...template});
    } else {
      setCurrentTemplate({
        type: AUDIT_TYPES[0],
        objective: "",
        scope: "",
        introduction: ""
      });
    }
    setIsTemplateDialogOpen(true);
  };

  const handleTemplateChange = (field: keyof AuditTemplate, value: string) => {
    if (currentTemplate) {
      setCurrentTemplate({
        ...currentTemplate,
        [field]: value
      });
    }
  };

  const handleSaveTemplate = () => {
    if (!currentTemplate || !currentTemplate.type) {
      toast.error("Please select an audit type");
      return;
    }
    
    saveAuditTemplate(currentTemplate);
    setIsTemplateDialogOpen(false);
    
    // Refresh templates list
    setTemplates(getAuditTemplates());
    toast.success(`Template for ${currentTemplate.type} saved successfully`);
  };
  
  // Helper function to add/remove user assignments
  const handleAssignUser = (userId: string) => {
    if (!currentAudit) return;
    
    const selectedUser = users.find(u => u.id === userId);
    if (!selectedUser) return;
    
    const newAssignedUsers = [
      ...((currentAudit.assignedUsers as any[]) || []),
      {
        id: selectedUser.id,
        username: selectedUser.username,
        role: selectedUser.role
      }
    ];
    
    setCurrentAudit({
      ...currentAudit,
      assignedUsers: newAssignedUsers
    });
  };
  
  const handleRemoveAssignedUser = (userId: string) => {
    if (!currentAudit || !currentAudit.assignedUsers) return;
    
    setCurrentAudit({
      ...currentAudit,
      assignedUsers: (currentAudit.assignedUsers as any[]).filter(u => u.id !== userId)
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user && (
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-lg text-gray-600">
                Manage audits, users, and system settings
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Logged in as {user.username}</span>
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        )}

        <Tabs defaultValue="audits">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="audits" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Audits
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Data
            </TabsTrigger>
          </TabsList>

          {/* Audits Tab */}
          <TabsContent value="audits">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Audits</CardTitle>
                  <Button onClick={() => handleOpenAuditDialog()}>
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
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                          No audits found. Click "Add Audit" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      audits.map((audit) => (
                        <TableRow key={audit.reference}>
                          <TableCell className="font-medium">{audit.reference}</TableCell>
                          <TableCell>{audit.name}</TableCell>
                          <TableCell>{audit.type}</TableCell>
                          <TableCell>{audit.status || "Not Started"}</TableCell>
                          <TableCell>
                            {audit.startDate ? new Date(audit.startDate).toLocaleDateString() : "Not set"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleOpenAuditDialog(audit)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteAuditClick(audit)}
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
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Users</CardTitle>
                  <Button onClick={() => handleOpenUserDialog()}>
                    <Plus className="h-4 w-4 mr-2" /> Add User
                  </Button>
                </div>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                          No users found. Click "Add User" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleOpenUserDialog(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.username !== "Jwo" && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteUserClick(user)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Audit Templates</CardTitle>
                  <Button onClick={() => handleOpenTemplateDialog()}>
                    <Plus className="h-4 w-4 mr-2" /> Add Template
                  </Button>
                </div>
                <CardDescription>
                  Manage templates for audit objectives, scope, and introduction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Audit Type</TableHead>
                      <TableHead>Objective</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                          No templates found. Click "Add Template" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      templates.map((template) => (
                        <TableRow key={template.type}>
                          <TableCell className="font-medium">{template.type}</TableCell>
                          <TableCell className="truncate max-w-[200px]">{template.objective}</TableCell>
                          <TableCell className="truncate max-w-[200px]">{template.scope}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleOpenTemplateDialog(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Import Tab */}
          <TabsContent value="import">
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Audit Edit Dialog */}
      <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {currentAudit && currentAudit.createdAt 
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
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={currentAudit?.description || ""}
                onChange={(e) => handleAuditChange("description", e.target.value)}
                className="col-span-3"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={currentAudit?.startDate || ""}
                onChange={(e) => handleAuditChange("startDate", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={currentAudit?.endDate || ""}
                onChange={(e) => handleAuditChange("endDate", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={currentAudit?.status || "Not Started"} 
                onValueChange={(value) => handleAuditChange("status", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {AUDIT_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Assigned Users */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right">Assigned Users</Label>
              <div className="col-span-3 space-y-4">
                <div className="flex gap-2">
                  <Select onValueChange={handleAssignUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add User" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.username} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {currentAudit?.assignedUsers && currentAudit.assignedUsers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(currentAudit.assignedUsers as any[]).map(user => (
                        <TableRow key={user.id}>
                          <TableCell className={user.role === "Qualified Auditor" ? "font-bold" : ""}>
                            {user.username}
                          </TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveAssignedUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-gray-500">No users assigned</p>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAuditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAudit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Audit Confirmation Dialog */}
      <Dialog open={isDeleteAuditDialogOpen} onOpenChange={setIsDeleteAuditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete audit {currentAudit?.reference}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAuditDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteAudit}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* User Edit Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentUser && currentUser.id ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              Enter the user details below
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={currentUser?.username || ""}
                onChange={(e) => handleUserChange("username", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={currentUser?.password || ""}
                onChange={(e) => handleUserChange("password", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select 
                value={currentUser?.role} 
                onValueChange={(value) => handleUserChange("role", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="QA">QA</SelectItem>
                  <SelectItem value="Qualified Auditor">Qualified Auditor</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user {currentUser?.username}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Template Edit Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Audit Template</DialogTitle>
            <DialogDescription>
              Customize the default text for audit objectives, scope, and introduction
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-type" className="text-right">
                Audit Type
              </Label>
              <Select 
                value={currentTemplate?.type} 
                onValueChange={(value) => handleTemplateChange("type", value)}
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
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="objective" className="text-right">
                Objective
              </Label>
              <Textarea
                id="objective"
                value={currentTemplate?.objective || ""}
                onChange={(e) => handleTemplateChange("objective", e.target.value)}
                className="col-span-3"
                placeholder="Enter the default objective for this audit type"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="scope" className="text-right">
                Scope
              </Label>
              <Textarea
                id="scope"
                value={currentTemplate?.scope || ""}
                onChange={(e) => handleTemplateChange("scope", e.target.value)}
                className="col-span-3"
                placeholder="Enter the default scope for this audit type"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="introduction" className="text-right">
                Introduction
              </Label>
              <Textarea
                id="introduction"
                value={currentTemplate?.introduction || ""}
                onChange={(e) => handleTemplateChange("introduction", e.target.value)}
                className="col-span-3"
                placeholder="Enter the default introduction for this audit type"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
