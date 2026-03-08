import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart, BarChart3, Cloud, Users, Store, Shield,
  Smartphone, Receipt, Bell, ArrowRight, CreditCard, FileText
} from "lucide-react";

const features = [
  { icon: ShoppingCart, title: "Smart Sales System", desc: "Process sales in seconds with barcode scanning, product search, and smart cart management. Handle cash, mobile money, and card payments seamlessly." },
  { icon: BarChart3, title: "Inventory Tracking", desc: "Track every item with IMEI/serial number support. Get automatic low-stock alerts and detailed movement history." },
  { icon: Cloud, title: "Cloud Sync", desc: "All data syncs in real-time. Access your business from any device — phone, tablet, or desktop." },
  { icon: FileText, title: "Reports & Analytics", desc: "Daily Z-Reports, sales trends, profit margins, and staff performance — all in beautiful dashboards." },
  { icon: Users, title: "Staff Management", desc: "Master Admin, Supervisor, and Staff roles with complete audit trails for every action." },
  { icon: Store, title: "Multi-Store Support", desc: "Manage multiple branches from a single account with consolidated reporting." },
  { icon: CreditCard, title: "Multiple Payment Methods", desc: "Accept Cash, MTN MoMo, Airtel Pay, bank transfers, and split payments effortlessly." },
  { icon: Receipt, title: "Digital Receipts", desc: "Generate and share receipts instantly. All receipts stored securely in the cloud." },
  { icon: Shield, title: "Enterprise Security", desc: "Role-based access, session timeouts, and comprehensive audit logging protect your business." },
  { icon: Smartphone, title: "Mobile Responsive", desc: "Full POS functionality on any device — desktop, tablet, or smartphone." },
  { icon: Bell, title: "Smart Notifications", desc: "Get notified about low stock, large transactions, and daily summary reports." },
  { icon: BarChart3, title: "Customer Management", desc: "Track customer purchases, outstanding balances, and payment history in one place." },
];

const FeaturesPage = () => (
  <WebsiteLayout>
    <section className="py-20 bg-gradient-to-b from-[hsl(211,80%,8%)] to-[hsl(220,15%,97%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Powerful Features</h1>
        <p className="text-lg text-[hsl(211,30%,70%)] max-w-2xl mx-auto">
          Everything you need to run a successful retail business, all in one platform.
        </p>
      </div>
    </section>

    <section className="py-20 bg-[hsl(220,15%,97%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-8 shadow-sm border border-[hsl(220,15%,92%)] hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-[hsl(211,80%,55%,0.1)] flex items-center justify-center mb-5">
                <f.icon className="h-6 w-6 text-[hsl(211,80%,50%)]" />
              </div>
              <h3 className="text-lg font-semibold text-[hsl(220,15%,15%)] mb-2">{f.title}</h3>
              <p className="text-sm text-[hsl(220,10%,45%)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-16 bg-gradient-to-r from-[hsl(211,80%,45%)] to-[hsl(211,80%,55%)]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Ready to streamline your business?</h2>
        <Link to="/register">
          <Button className="h-12 px-8 text-base font-semibold rounded-xl bg-white text-[hsl(211,80%,40%)] hover:bg-[hsl(211,10%,95%)]">
            Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  </WebsiteLayout>
);

export default FeaturesPage;
