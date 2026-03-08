import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

const plans = [
  { name: "Starter", price: "$12", desc: "Perfect for small shops getting started.", features: ["Basic POS", "1 User", "Basic Reports", "Email Support", "Cloud Storage"] },
  { name: "Business", price: "$29", popular: true, desc: "Ideal for growing businesses.", features: ["Inventory Management", "Customer Management", "Up to 3 Users", "Advanced Reports", "Priority Support", "Mobile Money Integration"] },
  { name: "Enterprise", price: "$79", desc: "For large operations.", features: ["Unlimited Users", "Multi-Store Support", "Full Analytics", "Priority Support", "Custom Integrations", "Dedicated Account Manager", "API Access"] },
];

const PricingPage = () => (
  <WebsiteLayout>
    <section className="py-20 bg-gradient-to-b from-[hsl(211,80%,8%)] to-[hsl(220,15%,97%)]">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg text-[hsl(211,30%,70%)] max-w-xl mx-auto">No hidden fees. Cancel anytime.</p>
      </div>
    </section>

    <section className="py-20 bg-[hsl(220,15%,97%)]">
      <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.name} className={`rounded-2xl p-8 ${plan.popular ? "bg-[hsl(211,80%,8%)] text-white border-2 border-[hsl(211,80%,50%)] shadow-xl scale-105" : "bg-white border border-[hsl(220,15%,90%)]"}`}>
            {plan.popular && <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(211,80%,60%)]">Most Popular</span>}
            <h3 className={`text-xl font-bold mt-2 ${plan.popular ? "text-white" : "text-[hsl(220,15%,15%)]"}`}>{plan.name}</h3>
            <p className={`text-sm mt-1 ${plan.popular ? "text-[hsl(211,30%,65%)]" : "text-[hsl(220,10%,45%)]"}`}>{plan.desc}</p>
            <div className="mt-6 mb-6">
              <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-[hsl(220,15%,15%)]"}`}>{plan.price}</span>
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
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  </WebsiteLayout>
);

export default PricingPage;
