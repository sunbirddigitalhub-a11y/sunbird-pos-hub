import { useState } from "react";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ContactPage = () => {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      setSending(false);
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <WebsiteLayout>
      <section className="py-20 bg-gradient-to-b from-[hsl(211,80%,8%)] to-[hsl(220,15%,97%)]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get In Touch</h1>
          <p className="text-lg text-[hsl(211,30%,70%)]">Have a question? We'd love to hear from you.</p>
        </div>
      </section>

      <section className="py-20 bg-[hsl(220,15%,97%)]">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-5 gap-12">
          <div className="md:col-span-2 space-y-8">
            {[
              { icon: Mail, label: "Email", value: "support@sunbirdgroup.xyz" },
              { icon: Phone, label: "Phone", value: "+256 700 000 000" },
              { icon: MapPin, label: "Address", value: "Kampala, Uganda" },
            ].map((c) => (
              <div key={c.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[hsl(211,80%,55%,0.1)] flex items-center justify-center flex-shrink-0">
                  <c.icon className="h-5 w-5 text-[hsl(211,80%,50%)]" />
                </div>
                <div>
                  <p className="font-medium text-[hsl(220,15%,15%)] text-sm">{c.label}</p>
                  <p className="text-sm text-[hsl(220,10%,45%)]">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="md:col-span-3 bg-white rounded-2xl p-8 border border-[hsl(220,15%,92%)] space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">Name</label>
                <Input required placeholder="Your name" className="rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">Email</label>
                <Input required type="email" placeholder="you@example.com" className="rounded-lg" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">Message</label>
              <Textarea required placeholder="How can we help?" rows={5} className="rounded-lg" />
            </div>
            <Button type="submit" disabled={sending} className="w-full h-11 rounded-xl bg-[hsl(211,80%,55%)] hover:bg-[hsl(211,80%,48%)] text-white font-semibold">
              <Send className="h-4 w-4 mr-2" /> {sending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </section>
    </WebsiteLayout>
  );
};

export default ContactPage;
