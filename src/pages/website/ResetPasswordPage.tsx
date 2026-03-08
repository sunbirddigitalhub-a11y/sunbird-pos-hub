import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setReady(true);
    } else {
      // Also listen for auth events
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          setReady(true);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated!", description: "You can now log in with your new password." });
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
              <div className="w-14 h-14 rounded-2xl bg-[hsl(211,80%,55%,0.1)] flex items-center justify-center mx-auto mb-4">
                <Lock className="h-7 w-7 text-[hsl(211,80%,50%)]" />
              </div>
              <h1 className="text-2xl font-bold text-[hsl(220,15%,15%)]">Reset Your Password</h1>
              <p className="text-sm text-[hsl(220,10%,45%)] mt-1">Enter your new password below.</p>
            </div>

            {ready ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">New Password</label>
                  <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="rounded-lg h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">Confirm New Password</label>
                  <Input required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className="rounded-lg h-11" />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-[hsl(211,80%,55%)] hover:bg-[hsl(211,80%,48%)] text-white font-semibold">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            ) : (
              <p className="text-center text-sm text-[hsl(220,10%,45%)]">
                Invalid or expired reset link. Please request a new password reset.
              </p>
            )}
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
};

export default ResetPasswordPage;
