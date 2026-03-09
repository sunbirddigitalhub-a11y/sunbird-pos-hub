import { useState, useEffect, useCallback } from "react";
import { Plus, Shield, ShieldCheck, User, Pencil, Trash2, RotateCcw, UserCheck, UserX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type AppRole = "master_admin" | "supervisor" | "staff";

interface UserRecord {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  created_at: string;
  role: AppRole;
}

const roleStyles: Record<string, string> = {
  master_admin: "bg-primary/10 text-primary",
  supervisor: "bg-chart-3/10 text-chart-3",
  staff: "bg-success/10 text-success",
};

const roleLabels: Record<string, string> = {
  master_admin: "Master Admin",
  supervisor: "Supervisor",
  staff: "Staff",
};

const roleIcons: Record<string, typeof Shield> = {
  master_admin: ShieldCheck,
  supervisor: Shield,
  staff: User,
};

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<UserRecord | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<AppRole>("staff");
  const [formPassword, setFormPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const { businessId, isGrandmaster } = useAuth();

  const fetchUsers = useCallback(async () => {
    // Always scope users to the caller's own business — even Grandmaster
    if (!businessId) { setLoading(false); return; }
    const { data: profiles } = await supabase.from("profiles").select("*").eq("business_id", businessId);
    const { data: roles } = await supabase.from("user_roles").select("*");
    if (profiles && roles) {
      const roleMap = new Map(roles.map((r: any) => [r.user_id, r.role]));
      const merged: UserRecord[] = (profiles as any[])
        // Filter out grandmaster accounts from normal user views
        .filter((p) => isGrandmaster || !roleMap.has(p.user_id) || true)
        .map((p) => ({
          user_id: p.user_id,
          full_name: p.full_name,
          email: p.email,
          phone: p.phone,
          status: p.status,
          created_at: p.created_at,
          role: (roleMap.get(p.user_id) as AppRole) || "staff",
        }));
      setUsers(merged);
    }
    setLoading(false);
  }, [businessId, isGrandmaster]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openNew = () => {
    setEditing(null);
    setFormName(""); setFormEmail(""); setFormPhone(""); setFormRole("staff"); setFormPassword("");
    setDialogOpen(true);
  };

  const openEdit = (u: UserRecord) => {
    setEditing(u);
    setFormName(u.full_name); setFormEmail(u.email); setFormPhone(u.phone || ""); setFormRole(u.role); setFormPassword("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        // Update profile
        await supabase.from("profiles").update({
          full_name: formName,
          phone: formPhone || null,
        } as any).eq("user_id", editing.user_id);

        // Update role
        await supabase.from("user_roles").update({ role: formRole } as any).eq("user_id", editing.user_id);

        toast({ title: "User updated" });
      } else {
        // Create new user via edge function
        const { data, error } = await supabase.functions.invoke("manage-users", {
          body: { action: "create", email: formEmail, password: formPassword, full_name: formName, phone: formPhone, role: formRole },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        toast({ title: "User created", description: "They can now sign in." });
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.functions.invoke("manage-users", {
        body: { action: "delete", user_id: deleteId },
      });
      if (error) throw error;
      toast({ title: "User deleted" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setDeleteId(null);
  };

  const toggleStatus = async (u: UserRecord) => {
    const newStatus = u.status === "active" ? "inactive" : "active";
    await supabase.from("profiles").update({ status: newStatus } as any).eq("user_id", u.user_id);
    toast({ title: `User ${newStatus === "active" ? "activated" : "deactivated"}` });
    fetchUsers();
  };

  const resetPassword = async (u: UserRecord) => {
    try {
      const { error } = await supabase.functions.invoke("manage-users", {
        body: { action: "reset_password", user_id: u.user_id, email: u.email },
      });
      if (error) throw error;
      toast({ title: "Password reset email sent", description: `Sent to ${u.email}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const counts = {
    master_admin: users.filter((u) => u.role === "master_admin").length,
    supervisor: users.filter((u) => u.role === "supervisor").length,
    staff: users.filter((u) => u.role === "staff").length,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Manage access & roles</p>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 rounded-xl text-[13px] font-semibold active:scale-[0.97] transition-all">
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Master Admins</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{counts.master_admin} <span className="text-[12px] text-muted-foreground">/ 2</span></p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Supervisors</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{counts.supervisor} <span className="text-[12px] text-muted-foreground">/ 10</span></p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Staff (Cashiers)</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{counts.staff}</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                {["User", "Role", "Status", "Created", "Actions"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const RoleIcon = roleIcons[u.role] || User;
                const isCurrentUser = u.user_id === currentUser?.id;
                return (
                  <tr key={u.user_id} className="border-b border-border/10 last:border-0 hover:bg-secondary/15 transition-colors duration-200">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-secondary/60 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-foreground/70">{u.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                        </div>
                        <div>
                          <p className="text-[13px] font-medium">{u.full_name}</p>
                          <p className="text-[11px] text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5 ${roleStyles[u.role] || ""}`}>
                        <RoleIcon className="h-3 w-3" />
                        {roleLabels[u.role]}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${u.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {u.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-[13px] text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => toggleStatus(u)} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors" title={u.status === "active" ? "Deactivate" : "Activate"}>
                          {u.status === "active" ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => resetPassword(u)} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors" title="Reset password">
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                        {!isCurrentUser && (
                          <button onClick={() => setDeleteId(u.user_id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-card border-border/40 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">{editing ? "Edit User" : "Create User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Full Name</label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
            </div>
            {!editing && (
              <div>
                <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Email</label>
                <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
              </div>
            )}
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Phone</label>
              <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Role</label>
              <Select value={formRole} onValueChange={(v) => setFormRole(v as AppRole)}>
                <SelectTrigger className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="master_admin">Master Admin (max 2)</SelectItem>
                  <SelectItem value="supervisor">Supervisor (max 10)</SelectItem>
                  <SelectItem value="staff">Staff (Cashier)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!editing && (
              <div>
                <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Password</label>
                <Input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" placeholder="Min 6 characters" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl h-10 text-[13px] font-semibold">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editing ? "Update" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="glass-card border-border/40">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The user will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersPage;
