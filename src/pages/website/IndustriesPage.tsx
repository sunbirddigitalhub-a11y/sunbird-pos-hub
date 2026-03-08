import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Smartphone, ShoppingBag, Utensils, Pill, Wrench, Shirt, ArrowRight } from "lucide-react";

const industries = [
  { icon: Smartphone, title: "Electronics & Phone Shops", desc: "IMEI tracking, warranty management, and accessory bundling designed for electronics retailers." },
  { icon: ShoppingBag, title: "Retail & Supermarkets", desc: "Fast checkout, barcode scanning, and inventory management for high-volume retail operations." },
  { icon: Utensils, title: "Restaurants & Cafés", desc: "Table management, kitchen orders, and split billing for the food service industry." },
  { icon: Pill, title: "Pharmacies", desc: "Batch tracking, expiry management, and prescription logging for pharmaceutical businesses." },
  { icon: Wrench, title: "Hardware Stores", desc: "Bulk pricing, contractor accounts, and heavy inventory management made simple." },
  { icon: Shirt, title: "Fashion & Boutiques", desc: "Size/color variants, customer wishlists, and seasonal inventory planning tools." },
];

const IndustriesPage = () => (
  <WebsiteLayout>
    <section className="py-20 bg-gradient-to-b from-[hsl(211,80%,8%)] to-[hsl(220,15%,97%)]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Built for Your Industry</h1>
        <p className="text-lg text-[hsl(211,30%,70%)]">SunbirdPOSHub adapts to any retail environment.</p>
      </div>
    </section>

    <section className="py-20 bg-[hsl(220,15%,97%)]">
      <div className="max-w-7xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {industries.map((ind) => (
          <div key={ind.title} className="bg-white rounded-2xl p-8 border border-[hsl(220,15%,92%)] hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-xl bg-[hsl(211,80%,55%,0.1)] flex items-center justify-center mb-5">
              <ind.icon className="h-6 w-6 text-[hsl(211,80%,50%)]" />
            </div>
            <h3 className="text-lg font-semibold text-[hsl(220,15%,15%)] mb-2">{ind.title}</h3>
            <p className="text-sm text-[hsl(220,10%,45%)] leading-relaxed">{ind.desc}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="py-16 bg-gradient-to-r from-[hsl(211,80%,45%)] to-[hsl(211,80%,55%)]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Don't see your industry?</h2>
        <p className="text-[hsl(211,30%,90%)] mb-8">SunbirdPOSHub is flexible enough for any retail business. Contact us to learn more.</p>
        <Link to="/contact">
          <Button className="h-12 px-8 font-semibold rounded-xl bg-white text-[hsl(211,80%,40%)] hover:bg-[hsl(211,10%,95%)]">
            Contact Us <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  </WebsiteLayout>
);

export default IndustriesPage;
