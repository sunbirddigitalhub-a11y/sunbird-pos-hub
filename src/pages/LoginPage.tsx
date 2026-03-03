import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-sm p-8 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <img src="/images/sunbird-logo.png" alt="Sunbird" className="w-14 h-14 rounded-2xl apple-shadow object-cover" />
          <div className="text-center">
            <h1 className="text-xl font-bold gold-gradient-text">Sunbird POS</h1>
            <p className="text-[12px] text-muted-foreground mt-1">Sign in to your account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring"
              placeholder="you@sunbird.ug"
            />
          </div>
          <div>
            <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring"
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11 rounded-xl text-[13px] font-semibold active:scale-[0.97] transition-all"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-[11px] text-muted-foreground text-center">
          Sunbird Online Stores &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
