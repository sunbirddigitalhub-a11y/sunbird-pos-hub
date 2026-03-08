import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const RegisterPage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.fullName, form.phone || undefined);
    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account created!", description: "You can now sign in with your credentials." });
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <WebsiteLayout>
      <section className="py-20 bg-[hsl(220,15%,97%)] min-h-[80vh] flex items-center">
        <div className="max-w-md mx-auto px-4 w-full">
          <div className="bg-white rounded-2xl p-8 border border-[hsl(220,15%,92%)] shadow-sm">
            <div className="text-center mb-8">
              <img src="/images/sunbird-logo.png" alt="SunbirdPOSHub" className="w-12 h-12 rounded-xl mx-auto mb-3 object-cover" />
              <h1 className="text-2xl font-bold text-[hsl(220,15%,15%)]">Create Your Account</h1>
              <p className="text-sm text-[hsl(220,10%,45%)] mt-1">Start your free trial today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">Full Name</label>
                <Input required value={form.fullName} onChange={update("fullName")} placeholder="John Doe" className="rounded-lg h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">Email</label>
                <Input required type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" className="rounded-lg h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">Phone (optional)</label>
                <Input value={form.phone} onChange={update("phone")} placeholder="+256 700 000 000" className="rounded-lg h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">Password</label>
                <Input required type="password" value={form.password} onChange={update("password")} placeholder="••••••••" className="rounded-lg h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">Confirm Password</label>
                <Input required type="password" value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="••••••••" className="rounded-lg h-11" />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-[hsl(211,80%,55%)] hover:bg-[hsl(211,80%,48%)] text-white font-semibold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <p className="text-sm text-[hsl(220,10%,45%)] text-center mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-[hsl(211,80%,50%)] hover:underline font-medium">Sign In</Link>
            </p>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
};

export default RegisterPage;
