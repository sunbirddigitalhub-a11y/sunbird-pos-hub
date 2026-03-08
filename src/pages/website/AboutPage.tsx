import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Eye, Heart } from "lucide-react";

const AboutPage = () => (
  <WebsiteLayout>
    <section className="py-20 bg-gradient-to-b from-[hsl(211,80%,8%)] to-[hsl(220,15%,97%)]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About SunbirdPOSHub</h1>
        <p className="text-lg text-[hsl(211,30%,70%)]">
          Building the future of retail technology for businesses across Africa.
        </p>
      </div>
    </section>

    <section className="py-20 bg-[hsl(220,15%,97%)]">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl p-10 border border-[hsl(220,15%,92%)] mb-12">
          <h2 className="text-2xl font-bold text-[hsl(220,15%,15%)] mb-4">Our Story</h2>
          <p className="text-[hsl(220,10%,40%)] leading-relaxed mb-4">
            SunbirdPOSHub was born from the need for a reliable, affordable, and easy-to-use point of sale system 
            for businesses in Africa. Traditional POS systems were either too expensive, too complex, or not designed 
            for the realities of African retail.
          </p>
          <p className="text-[hsl(220,10%,40%)] leading-relaxed">
            We built SunbirdPOSHub to change that. Our cloud-based system works on any device, supports mobile 
            money payments, and is designed to scale from a single shop to a chain of stores.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Target, title: "Our Mission", desc: "To empower every business with affordable, world-class point of sale technology." },
            { icon: Eye, title: "Our Vision", desc: "A future where every African business has access to the tools they need to thrive." },
            { icon: Heart, title: "Our Values", desc: "Simplicity, reliability, and customer success drive everything we do." },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-8 border border-[hsl(220,15%,92%)] text-center">
              <div className="w-14 h-14 rounded-2xl bg-[hsl(211,80%,55%,0.1)] flex items-center justify-center mx-auto mb-4">
                <item.icon className="h-7 w-7 text-[hsl(211,80%,50%)]" />
              </div>
              <h3 className="font-semibold text-[hsl(220,15%,15%)] mb-2">{item.title}</h3>
              <p className="text-sm text-[hsl(220,10%,45%)]">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link to="/register">
            <Button className="h-12 px-8 font-semibold rounded-xl bg-[hsl(211,80%,55%)] hover:bg-[hsl(211,80%,48%)] text-white">
              Join Us Today <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  </WebsiteLayout>
);

export default AboutPage;
