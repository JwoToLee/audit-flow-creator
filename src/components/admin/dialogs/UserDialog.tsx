
import React from "react";
import { UserRole } from "@/types/user";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: any;
  onUserChange: (field: string, value: any) => void;
  onSaveUser: () => void;
}

const UserDialog: React.FC<UserDialogProps> = ({
  isOpen,
  onOpenChange,
  currentUser,
  onUserChange,
  onSaveUser,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              onChange={(e) => onUserChange("username", e.target.value)}
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
              onChange={(e) => onUserChange("password", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select 
              value={currentUser?.role} 
              onValueChange={(value) => onUserChange("role", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Auditor">Auditor</SelectItem>
                <SelectItem value="Lead Auditor">Lead Auditor</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSaveUser}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
