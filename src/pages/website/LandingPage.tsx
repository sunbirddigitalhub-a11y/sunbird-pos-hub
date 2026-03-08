import { useState } from "react";
import { Link } from "react-router-dom";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import {
  ShoppingCart, BarChart3, Cloud, Users, Store, Shield,
  Zap, Lock, Globe, DollarSign, ArrowRight, CheckCircle2, Star, Download, Share
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
const formatPrice = (currency: "usd" | "ugx", usd: number, ugx: number) =>
  currency === "usd" ? `$${usd}` : `UGX ${ugx.toLocaleString()}`;

const features = [
  { icon: ShoppingCart, title: "Smart Sales System", desc: "Process sales quickly with barcode scanning, split payments, and real-time receipts." },
  { icon: BarChart3, title: "Inventory Tracking", desc: "Track stock levels, IMEI numbers, and get low-stock alerts automatically." },
  { icon: Cloud, title: "Cloud Sync", desc: "Access your data anywhere. All transactions sync in real-time across devices." },
  { icon: BarChart3, title: "Reports & Analytics", desc: "Daily Z-Reports, sales analytics, and profit tracking at your fingertips." },
  { icon: Users, title: "Staff Management", desc: "Role-based access control with audit trails for every transaction." },
  { icon: Store, title: "Multi-Store Support", desc: "Manage multiple locations from a single dashboard with unified reporting." },
];

const advantages = [
  { icon: Zap, title: "Fast", desc: "Sub-second transaction processing. No lag, no waiting." },
  { icon: Shield, title: "Secure", desc: "Bank-grade encryption with role-based access control." },
  { icon: Cloud, title: "Cloud Based", desc: "No local servers needed. Access from any device, anywhere." },
  { icon: DollarSign, title: "Affordable", desc: "Start free. Scale as you grow with transparent pricing." },
  { icon: Globe, title: "Scalable", desc: "From one register to hundreds — SunbirdPOSHub grows with you." },
];

const LandingPage = () => {
  const [currency, setCurrency] = useState<"usd" | "ugx">("usd");

  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(211,80%,12%)] via-[hsl(211,70%,8%)] to-[hsl(220,60%,5%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(211,80%,55%,0.15),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(211,80%,55%,0.3)] bg-[hsl(211,80%,55%,0.08)] px-4 py-1.5 text-sm text-[hsl(211,80%,70%)] mb-8">
            <Star className="h-3.5 w-3.5" /> Trusted by 500+ businesses across Africa
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
            Smart POS for{" "}
            <span className="bg-gradient-to-r from-[hsl(211,80%,60%)] to-[hsl(190,80%,55%)] bg-clip-text text-transparent">
              Modern Businesses
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[hsl(211,30%,70%)] max-w-2xl mx-auto leading-relaxed">
            Run your store, track inventory, and manage sales anywhere with SunbirdPOSHub. 
            The all-in-one point of sale system built for growth.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button className="h-13 px-8 text-base font-semibold rounded-xl bg-[hsl(211,80%,55%)] hover:bg-[hsl(211,80%,48%)] text-white shadow-lg shadow-[hsl(211,80%,55%,0.3)]">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="h-13 px-8 text-base font-semibold rounded-xl border-[hsl(211,40%,30%)] text-[hsl(211,30%,80%)] hover:bg-[hsl(211,40%,15%)]">
                Login to POS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-[hsl(220,15%,97%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(220,15%,15%)]">
              Everything You Need to Run Your Business
            </h2>
            <p className="mt-4 text-lg text-[hsl(220,10%,45%)] max-w-2xl mx-auto">
              Powerful features designed to simplify operations and boost your bottom line.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-8 shadow-sm border border-[hsl(220,15%,92%)] hover:shadow-lg hover:border-[hsl(211,80%,55%,0.3)] transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-[hsl(211,80%,55%,0.1)] flex items-center justify-center mb-5 group-hover:bg-[hsl(211,80%,55%,0.15)] transition-colors">
                  <f.icon className="h-6 w-6 text-[hsl(211,80%,50%)]" />
                </div>
                <h3 className="text-lg font-semibold text-[hsl(220,15%,15%)] mb-2">{f.title}</h3>
                <p className="text-[hsl(220,10%,45%)] leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POS Preview */}
      <section className="py-20 bg-gradient-to-b from-[hsl(211,80%,8%)] to-[hsl(220,60%,5%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              A Dashboard That Works For You
            </h2>
            <p className="mt-4 text-lg text-[hsl(211,30%,65%)] max-w-xl mx-auto">
              Clean, intuitive interface designed for speed and simplicity.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-[hsl(211,40%,25%)] shadow-2xl shadow-[hsl(211,80%,30%,0.15)]">
            <div className="bg-[hsl(220,10%,10%)] p-3 flex items-center gap-2 border-b border-[hsl(220,8%,18%)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[hsl(0,70%,55%)]" />
                <div className="w-3 h-3 rounded-full bg-[hsl(45,80%,55%)]" />
                <div className="w-3 h-3 rounded-full bg-[hsl(130,55%,48%)]" />
              </div>
              <div className="flex-1 text-center text-xs text-[hsl(220,10%,45%)]">SunbirdPOSHub Dashboard</div>
            </div>
            <div className="bg-[hsl(220,10%,8%)] p-8 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {["Today's Sales", "Total Orders", "Active Staff", "Inventory"].map((label, i) => (
                  <div key={label} className="rounded-xl bg-[hsl(220,10%,12%)] border border-[hsl(220,8%,18%)] p-4">
                    <p className="text-xs text-[hsl(220,10%,50%)]">{label}</p>
                    <p className="text-xl font-bold text-white mt-1">{["UGX 2.4M", "47", "5", "1,240"][i]}</p>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 rounded-xl bg-[hsl(220,10%,12%)] border border-[hsl(220,8%,18%)] p-6 h-48 flex items-end">
                  <div className="flex items-end gap-2 w-full h-full">
                    {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-[hsl(211,80%,50%)] to-[hsl(211,80%,65%)]" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-[hsl(220,10%,12%)] border border-[hsl(220,8%,18%)] p-6">
                  <p className="text-xs text-[hsl(220,10%,50%)] mb-4">Recent Sales</p>
                  {["Samsung A54", "iPhone 15", "Pixel 8"].map((item) => (
                    <div key={item} className="flex justify-between py-2 border-b border-[hsl(220,8%,18%)] last:border-0">
                      <span className="text-sm text-[hsl(220,10%,70%)]">{item}</span>
                      <span className="text-sm text-[hsl(130,55%,55%)]">Sold</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(220,15%,15%)]">
              Why Choose SunbirdPOSHub?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {advantages.map((a) => (
              <div key={a.title} className="text-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-[hsl(211,80%,55%,0.1)] flex items-center justify-center mx-auto mb-4">
                  <a.icon className="h-7 w-7 text-[hsl(211,80%,50%)]" />
                </div>
                <h3 className="font-semibold text-[hsl(220,15%,15%)] mb-1">{a.title}</h3>
                <p className="text-sm text-[hsl(220,10%,45%)]">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-[hsl(220,15%,97%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(220,15%,15%)]">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-[hsl(220,10%,45%)] mb-6">No hidden fees. Start free, upgrade when ready.</p>
            {/* Currency Toggle */}
            <div className="inline-flex items-center rounded-full bg-[hsl(220,15%,92%)] p-1">
              <button
                onClick={() => setCurrency("usd")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  currency === "usd"
                    ? "bg-[hsl(211,80%,55%)] text-white shadow-md"
                    : "text-[hsl(220,10%,40%)] hover:text-[hsl(220,15%,15%)]"
                }`}
              >
                🇺🇸 USD
              </button>
              <button
                onClick={() => setCurrency("ugx")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  currency === "ugx"
                    ? "bg-[hsl(211,80%,55%)] text-white shadow-md"
                    : "text-[hsl(220,10%,40%)] hover:text-[hsl(220,15%,15%)]"
                }`}
              >
                🇺🇬 UGX
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Starter", usd: 12, ugx: 45000, features: ["Basic POS", "1 User", "Basic Reports", "Email Support"] },
              { name: "Business", usd: 29, ugx: 105000, popular: true, features: ["Inventory Management", "Customer Management", "Up to 3 Users", "Advanced Reports", "Priority Support"] },
              { name: "Enterprise", usd: 79, ugx: 290000, features: ["Unlimited Users", "Multi-Store Support", "Full Analytics", "Priority Support", "Custom Integrations"] },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 ${plan.popular ? "bg-[hsl(211,80%,8%)] text-white border-2 border-[hsl(211,80%,50%)] shadow-xl shadow-[hsl(211,80%,50%,0.15)] scale-105" : "bg-white border border-[hsl(220,15%,90%)]"}`}>
                {plan.popular && <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(211,80%,60%)]">Most Popular</span>}
                <h3 className={`text-xl font-bold mt-2 ${plan.popular ? "text-white" : "text-[hsl(220,15%,15%)]"}`}>{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-[hsl(220,15%,15%)]"}`}>
                    {formatPrice(currency, plan.usd, plan.ugx)}
                  </span>
                  <span className={`text-sm ${plan.popular ? "text-[hsl(211,30%,65%)]" : "text-[hsl(220,10%,45%)]"}`}>/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${plan.popular ? "text-[hsl(211,80%,60%)]" : "text-[hsl(211,80%,50%)]"}`} />
                      <span className={plan.popular ? "text-[hsl(211,20%,80%)]" : "text-[hsl(220,10%,40%)]"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className={`w-full h-11 rounded-xl font-semibold ${plan.popular ? "bg-[hsl(211,80%,55%)] hover:bg-[hsl(211,80%,48%)] text-white" : "bg-[hsl(220,15%,95%)] hover:bg-[hsl(220,15%,90%)] text-[hsl(220,15%,15%)]"}`}>
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[hsl(211,80%,45%)] to-[hsl(211,80%,55%)]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Start Your Free POS Today</h2>
          <p className="text-lg text-[hsl(211,30%,90%)] mb-8">Join hundreds of businesses already using SunbirdPOSHub.</p>
          <Link to="/register">
            <Button className="h-13 px-10 text-base font-semibold rounded-xl bg-white text-[hsl(211,80%,40%)] hover:bg-[hsl(211,10%,95%)] shadow-lg">
              Sign Up Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </WebsiteLayout>
  );
};

export default LandingPage;
