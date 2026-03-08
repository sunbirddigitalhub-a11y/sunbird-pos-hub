import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
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
                <Mail className="h-7 w-7 text-[hsl(211,80%,50%)]" />
              </div>
              <h1 className="text-2xl font-bold text-[hsl(220,15%,15%)]">
                {sent ? "Check Your Email" : "Forgot Password?"}
              </h1>
              <p className="text-sm text-[hsl(220,10%,45%)] mt-1">
                {sent
                  ? "We've sent a password reset link to your email."
                  : "Enter your email and we'll send you a reset link."}
              </p>
            </div>

            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">Email Address</label>
                  <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="rounded-lg h-11" />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-[hsl(211,80%,55%)] hover:bg-[hsl(211,80%,48%)] text-white font-semibold">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-sm text-[hsl(220,10%,45%)] mb-4">Didn't receive it? Check your spam folder or try again.</p>
                <Button variant="outline" onClick={() => setSent(false)} className="rounded-lg">
                  Try Again
                </Button>
              </div>
            )}

            <div className="text-center mt-6">
              <Link to="/login" className="text-sm text-[hsl(211,80%,50%)] hover:underline font-medium inline-flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
};

export default ForgotPasswordPage;
