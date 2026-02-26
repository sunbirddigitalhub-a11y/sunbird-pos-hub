import { Plus, Shield, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const users = [
  { id: 1, name: "Admin 1", email: "admin@sunbird.ug", role: "Admin", status: "Active", lastLogin: "2024-12-15 09:30" },
  { id: 2, name: "Admin 2", email: "admin2@sunbird.ug", role: "Admin", status: "Active", lastLogin: "2024-12-15 08:15" },
  { id: 3, name: "Admin 3", email: "admin3@sunbird.ug", role: "Admin", status: "Active", lastLogin: "2024-12-14 17:45" },
  { id: 4, name: "Sales Agent 1", email: "agent1@sunbird.ug", role: "Sales Agent", status: "Active", lastLogin: "2024-12-15 10:00" },
  { id: 5, name: "Sales Agent 2", email: "agent2@sunbird.ug", role: "Sales Agent", status: "Active", lastLogin: "2024-12-14 16:20" },
  { id: 6, name: "Inventory Mgr", email: "inventory@sunbird.ug", role: "Inventory Manager", status: "Active", lastLogin: "2024-12-15 07:45" },
];

const roleStyles: Record<string, string> = {
  Admin: "bg-primary/10 text-primary",
  "Sales Agent": "bg-chart-3/10 text-chart-3",
  "Inventory Manager": "bg-success/10 text-success",
};

const roleIcons: Record<string, typeof Shield> = {
  Admin: ShieldCheck,
  "Sales Agent": User,
  "Inventory Manager": Shield,
};

const UsersPage = () => {
  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Manage access & roles</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 rounded-xl text-[13px] font-semibold active:scale-[0.97] transition-all">
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Admins</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{users.filter(u => u.role === "Admin").length}</p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Sales Agents</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{users.filter(u => u.role === "Sales Agent").length}</p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Inventory Managers</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{users.filter(u => u.role === "Inventory Manager").length}</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                {["User", "Role", "Status", "Last Login"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const RoleIcon = roleIcons[u.role] || User;
                return (
                  <tr key={u.id} className="border-b border-border/10 last:border-0 hover:bg-secondary/15 transition-colors duration-200">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-secondary/60 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-foreground/70">{u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                        </div>
                        <div>
                          <p className="text-[13px] font-medium">{u.name}</p>
                          <p className="text-[11px] text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5 ${roleStyles[u.role] || ""}`}>
                        <RoleIcon className="h-3 w-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-success/10 text-success">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-[13px] text-muted-foreground">{u.lastLogin}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
