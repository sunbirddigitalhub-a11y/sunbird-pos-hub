import { useState, useEffect } from "react";
import { Search, Loader2, UserCog, Shield, User, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

type AppRole = "master_admin" | "supervisor" | "staff";

interface StaffMember {
  user_id: string;
  full_name: string;
  email: string;
  role: AppRole;
  status: string;
  created_at: string;
}

const roleIcons: Record<AppRole, any> = {
  master_admin: Crown,
  supervisor: Shield,
  staff: User,
};

const roleLabels: Record<AppRole, string> = {
  master_admin: "Admin",
  supervisor: "Supervisor",
  staff: "Staff",
};

const roleColors: Record<AppRole, string> = {
  master_admin: "bg-primary/15 text-primary",
  supervisor: "bg-chart-3/15 text-chart-3",
  staff: "bg-success/15 text-success",
};

export default function StaffManagementPage() {
  const { businessId } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { if (businessId) fetchStaff(); else setLoading(false); }, [businessId]);

  const fetchStaff = async () => {
    if (!businessId) return;
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, status, created_at")
      .eq("business_id", businessId);
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");

    if (!profiles) { setLoading(false); return; }

    const roleMap = new Map<string, AppRole>();
    ((roles as any[]) || []).forEach((r) => roleMap.set(r.user_id, r.role));

    const list: StaffMember[] = (profiles as any[]).map((p) => ({
      user_id: p.user_id,
      full_name: p.full_name,
      email: p.email,
      role: roleMap.get(p.user_id) || "staff",
      status: p.status,
      created_at: p.created_at,
    }));

    setStaff(list);
    setLoading(false);
  };

  const updateRole = async (userId: string, newRole: AppRole) => {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole } as any)
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Role changed to ${roleLabels[newRole]}` });
      fetchStaff();
    }
  };

  const filtered = staff.filter(
    (s) => s.full_name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-[28px] font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground text-[13px] mt-0.5">{staff.length} team members</p>
        </div>
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {(["master_admin", "supervisor", "staff"] as AppRole[]).map((role) => {
          const count = staff.filter((s) => s.role === role).length;
          const Icon = roleIcons[role];
          return (
            <div key={role} className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-[12px] text-muted-foreground">{roleLabels[role]}s</span>
              </div>
              <span className="text-[20px] font-semibold">{count}</span>
            </div>
          );
        })}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 bg-secondary/50 border-border/30 rounded-xl text-[13px]" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Name</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Email</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Role</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Status</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Joined</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => {
                const Icon = roleIcons[member.role];
                return (
                  <tr key={member.user_id} className="border-b border-border/10 last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-primary/20 flex items-center justify-center">
                          <span className="text-[10px] font-semibold text-primary-foreground">
                            {member.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[13px] font-medium">{member.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[13px] text-muted-foreground">{member.email}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1 ${roleColors[member.role]}`}>
                        <Icon className="h-3 w-3" />
                        {roleLabels[member.role]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${member.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[13px] text-muted-foreground">{format(new Date(member.created_at), "MMM dd, yyyy")}</td>
                    <td className="py-3 px-4">
                      <select
                        value={member.role}
                        onChange={(e) => updateRole(member.user_id, e.target.value as AppRole)}
                        className="h-8 rounded-lg border border-border/30 bg-secondary/50 px-2 text-[12px]"
                      >
                        <option value="master_admin">Admin</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="staff">Staff</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
