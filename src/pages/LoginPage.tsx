import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const { signIn } = useAuth();
  const [params] = useSearchParams();
  const nextParam = params.get("next");
  const safeNext = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    if (safeNext) {
      window.location.href = safeNext;
      return;
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
              <h1 className="text-2xl font-bold text-[hsl(220,15%,15%)]">Welcome Back</h1>
              <p className="text-sm text-[hsl(220,10%,45%)] mt-1">Sign in to your POS dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@sunbird.ug" className="rounded-lg h-11" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-[hsl(220,15%,15%)]">Password</label>
                  <Link to="/forgot-password" className="text-xs text-[hsl(211,80%,50%)] hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="rounded-lg h-11" />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-[hsl(211,80%,55%)] hover:bg-[hsl(211,80%,48%)] text-white font-semibold gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="text-sm text-[hsl(220,10%,45%)] text-center mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-[hsl(211,80%,50%)] hover:underline font-medium">Start Free Trial</Link>
            </p>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
};

export default LoginPage;
