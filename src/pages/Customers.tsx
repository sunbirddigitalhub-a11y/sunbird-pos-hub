import { Phone } from "lucide-react";

const customers = [
  { id: 1, name: "John Mukasa", phone: "0772123456", email: "john@email.com", purchases: 5, balance: 0, totalSpent: 15200000 },
  { id: 2, name: "Sarah Nantongo", phone: "0701234567", email: "sarah@email.com", purchases: 3, balance: 0, totalSpent: 7500000 },
  { id: 3, name: "David Okello", phone: "0782345678", email: "david@email.com", purchases: 2, balance: 2750000, totalSpent: 5500000 },
  { id: 4, name: "Grace Achieng", phone: "0753456789", email: null, purchases: 1, balance: 0, totalSpent: 600000 },
  { id: 5, name: "Peter Waswa", phone: "0774567890", email: "peter@email.com", purchases: 4, balance: 0, totalSpent: 9800000 },
];

const Customers = () => {
  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground text-[14px] mt-1">{customers.length} registered customers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((c) => (
          <div key={c.id} className="glass-card p-5 transition-all duration-300 hover:scale-[1.01] cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="text-[13px] font-bold text-primary">
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
              <div>
                <p className="font-semibold text-[14px]">{c.name}</p>
                <p className="text-[12px] text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {c.phone}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Spent</p>
                <p className="text-[14px] font-semibold text-primary mt-0.5">UGX {(c.totalSpent / 1000000).toFixed(1)}M</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Orders</p>
                <p className="text-[14px] font-semibold mt-0.5">{c.purchases}</p>
              </div>
              {c.balance > 0 && (
                <div className="col-span-2 pt-3 border-t border-border/20">
                  <p className="text-[11px] text-warning uppercase tracking-wider">Balance Due</p>
                  <p className="text-[14px] font-semibold text-warning mt-0.5">UGX {c.balance.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customers;
