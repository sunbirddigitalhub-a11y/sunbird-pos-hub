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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
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

const plans = [
  { name: "Starter", usd: 12, ugx: 45000, features: ["Basic POS", "1 User", "Basic Reports", "Email Support"] },
  { name: "Business", usd: 29, ugx: 105000, popular: true, features: ["Inventory Management", "Customer Management", "Up to 3 Users", "Advanced Reports", "Priority Support"] },
  { name: "Enterprise", usd: 79, ugx: 290000, features: ["Unlimited Users", "Multi-Store Support", "Full Analytics", "Priority Support", "Custom Integrations"] },
];

const LandingPage = () => {
  const [currency, setCurrency] = useState<"usd" | "ugx">("usd");
  const { canInstall, isInstalled, install, showIOSPrompt } = usePWAInstall();
  const [showIOSDialog, setShowIOSDialog] = useState(false);

  const handleInstallClick = async () => {
    if (canInstall) {
      await install();
    } else if (showIOSPrompt) {
      setShowIOSDialog(true);
    }
  };

  const showInstallButton = (canInstall || showIOSPrompt) && !isInstalled;

  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(186,96%,21%)] via-[hsl(189,60%,18%)] to-[hsl(186,80%,12%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(189,34%,41%,0.2),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/80 mb-6 md:mb-8">
            <Star className="h-3.5 w-3.5" /> Trusted by 500+ businesses across Africa
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
            Smart POS for{" "}
            <span className="bg-gradient-to-r from-[hsl(155,71%,48%)] to-[hsl(155,71%,65%)] bg-clip-text text-transparent">
              Modern Businesses
            </span>
          </h1>
          <p className="mt-5 md:mt-6 text-base md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Run your store, track inventory, and manage sales anywhere with SunbirdPOSHub.
            The all-in-one point of sale system built for growth.
          </p>
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-12 sm:h-13 px-8 text-base font-semibold rounded-xl bg-[hsl(155,71%,48%)] hover:bg-[hsl(155,71%,42%)] text-white shadow-lg shadow-[hsl(155,71%,48%,0.3)] active:scale-[0.98] transition-all">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-12 sm:h-13 px-8 text-base font-semibold rounded-xl border-white/30 text-white hover:bg-white/10 active:scale-[0.98] transition-all">
                Login to POS
              </Button>
            </Link>
          </div>
          {showInstallButton && (
            <div className="mt-5 md:mt-6 flex justify-center">
              <Button
                onClick={handleInstallClick}
                className="h-12 px-6 text-sm font-semibold rounded-xl bg-white text-[hsl(186,96%,21%)] hover:bg-white/90 shadow-lg gap-2 active:scale-[0.98] transition-all"
              >
                <Download className="h-4 w-4" />
                Download App
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-14 md:py-20 bg-[hsl(192,16%,97%)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-[hsl(213,29%,17%)]">
              Everything You Need to Run Your Business
            </h2>
            <p className="mt-3 md:mt-4 text-base md:text-lg text-[hsl(220,9%,46%)] max-w-2xl mx-auto">
              Powerful features designed to simplify operations and boost your bottom line.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 md:p-8 border border-[hsl(210,18%,90%)] hover:shadow-lg hover:border-[hsl(186,96%,21%,0.3)] transition-all duration-300 group active:scale-[0.98]">
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-[hsl(186,96%,21%,0.08)] flex items-center justify-center mb-4 md:mb-5 group-hover:bg-[hsl(186,96%,21%,0.12)] transition-colors">
                  <f.icon className="h-5 w-5 md:h-6 md:w-6 text-[hsl(186,96%,21%)]" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-[hsl(213,29%,17%)] mb-1.5 md:mb-2">{f.title}</h3>
                <p className="text-[hsl(220,9%,46%)] leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POS Preview */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-[hsl(186,96%,21%)] to-[hsl(186,80%,14%)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-white">
              A Dashboard That Works For You
            </h2>
            <p className="mt-3 md:mt-4 text-base md:text-lg text-white/60 max-w-xl mx-auto">
              Clean, intuitive interface designed for speed and simplicity.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
            <div className="bg-[hsl(213,29%,12%)] p-3 flex items-center gap-2 border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[hsl(0,70%,55%)]" />
                <div className="w-3 h-3 rounded-full bg-[hsl(45,80%,55%)]" />
                <div className="w-3 h-3 rounded-full bg-[hsl(155,71%,48%)]" />
              </div>
              <div className="flex-1 text-center text-xs text-white/40">SunbirdPOSHub Dashboard</div>
            </div>
            <div className="bg-[hsl(195,11%,99%)] p-5 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5 md:mb-6">
                {["Today's Sales", "Total Orders", "Active Staff", "Inventory"].map((label, i) => (
                  <div key={label} className="rounded-xl bg-white border border-[hsl(210,18%,90%)] p-3 md:p-4 shadow-sm">
                    <p className="text-[10px] md:text-xs text-[hsl(220,9%,46%)]">{label}</p>
                    <p className="text-base md:text-xl font-bold text-[hsl(213,29%,17%)] mt-1">{["UGX 2.4M", "47", "5", "1,240"][i]}</p>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-3 gap-3 md:gap-4">
                <div className="md:col-span-2 rounded-xl bg-white border border-[hsl(210,18%,90%)] p-4 md:p-6 h-36 md:h-48 flex items-end shadow-sm">
                  <div className="flex items-end gap-1.5 md:gap-2 w-full h-full">
                    {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-[hsl(186,96%,21%)] to-[hsl(189,34%,41%)]" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-white border border-[hsl(210,18%,90%)] p-4 md:p-6 shadow-sm">
                  <p className="text-xs text-[hsl(220,9%,46%)] mb-3 md:mb-4">Recent Sales</p>
                  {["Samsung A54", "iPhone 15", "Pixel 8"].map((item) => (
                    <div key={item} className="flex justify-between py-2 border-b border-[hsl(210,18%,93%)] last:border-0">
                      <span className="text-sm text-[hsl(213,29%,17%)]">{item}</span>
                      <span className="text-sm text-[hsl(155,71%,48%)]">Sold</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-[hsl(213,29%,17%)]">
              Why Choose SunbirdPOSHub?
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {advantages.map((a) => (
              <div key={a.title} className="text-center p-4 md:p-6">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[hsl(186,96%,21%,0.08)] flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <a.icon className="h-6 w-6 md:h-7 md:w-7 text-[hsl(186,96%,21%)]" />
                </div>
                <h3 className="font-semibold text-sm md:text-base text-[hsl(213,29%,17%)] mb-1">{a.title}</h3>
                <p className="text-xs md:text-sm text-[hsl(220,9%,46%)]">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-14 md:py-20 bg-[hsl(192,16%,97%)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-[hsl(213,29%,17%)]">Simple, Transparent Pricing</h2>
            <p className="mt-3 md:mt-4 text-base md:text-lg text-[hsl(220,9%,46%)] mb-5 md:mb-6">No hidden fees. Start free, upgrade when ready.</p>
            <div className="inline-flex items-center rounded-full bg-[hsl(210,18%,90%)] p-1">
              <button
                onClick={() => setCurrency("usd")}
                className={`px-4 md:px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  currency === "usd"
                    ? "bg-[hsl(186,96%,21%)] text-white shadow-md"
                    : "text-[hsl(220,9%,46%)] hover:text-[hsl(213,29%,17%)]"
                }`}
              >
                🇺🇸 USD
              </button>
              <button
                onClick={() => setCurrency("ugx")}
                className={`px-4 md:px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  currency === "ugx"
                    ? "bg-[hsl(186,96%,21%)] text-white shadow-md"
                    : "text-[hsl(220,9%,46%)] hover:text-[hsl(213,29%,17%)]"
                }`}
              >
                🇺🇬 UGX
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-6 md:p-8 transition-all duration-300 ${plan.popular ? "bg-[hsl(186,96%,21%)] text-white border-2 border-[hsl(155,71%,48%)] shadow-xl md:scale-105" : "bg-white border border-[hsl(210,18%,90%)]"}`}>
                {plan.popular && <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(155,71%,60%)]">Most Popular</span>}
                <h3 className={`text-lg md:text-xl font-bold mt-2 ${plan.popular ? "text-white" : "text-[hsl(213,29%,17%)]"}`}>{plan.name}</h3>
                <div className="mt-3 md:mt-4 mb-5 md:mb-6">
                  <span className={`text-3xl md:text-4xl font-bold ${plan.popular ? "text-white" : "text-[hsl(213,29%,17%)]"}`}>
                    {formatPrice(currency, plan.usd, plan.ugx)}
                  </span>
                  <span className={`text-sm ${plan.popular ? "text-white/60" : "text-[hsl(220,9%,46%)]"}`}>/month</span>
                </div>
                <ul className="space-y-2.5 md:space-y-3 mb-6 md:mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${plan.popular ? "text-[hsl(155,71%,55%)]" : "text-[hsl(186,96%,21%)]"}`} />
                      <span className={plan.popular ? "text-white/80" : "text-[hsl(220,9%,46%)]"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className={`w-full h-11 rounded-xl font-semibold active:scale-[0.98] transition-all ${plan.popular ? "bg-[hsl(155,71%,48%)] hover:bg-[hsl(155,71%,42%)] text-white" : "bg-[hsl(192,16%,95%)] hover:bg-[hsl(192,16%,90%)] text-[hsl(213,29%,17%)]"}`}>
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-20 bg-gradient-to-r from-[hsl(186,96%,21%)] to-[hsl(189,34%,41%)]">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4">Start Your Free POS Today</h2>
          <p className="text-base md:text-lg text-white/70 mb-6 md:mb-8">Join hundreds of businesses already using SunbirdPOSHub.</p>
          <Link to="/register">
            <Button className="h-12 sm:h-13 px-8 md:px-10 text-base font-semibold rounded-xl bg-white text-[hsl(186,96%,21%)] hover:bg-white/90 shadow-lg active:scale-[0.98] transition-all">
              Sign Up Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* iOS Install Instructions Dialog */}
      <Dialog open={showIOSDialog} onOpenChange={setShowIOSDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install SunbirdPOSHub</DialogTitle>
            <DialogDescription>
              To install the app on your device, follow these steps:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <p className="text-sm">
                Tap the <Share className="inline h-4 w-4 mx-1" /> <strong>Share</strong> button in your browser
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <p className="text-sm">
                Scroll down and tap <strong>"Add to Home Screen"</strong>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <p className="text-sm">
                Tap <strong>"Add"</strong> to install the app
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </WebsiteLayout>
  );
};

export default LandingPage;
