import { useState, useEffect, useCallback } from "react";
import { Gift, Copy, Check, Users, Trophy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface ReferralData {
  code: string;
  totalReferred: number;
  successfulReferrals: number;
  pendingReferrals: number;
}

const ReferralPage = () => {
  const { user, profile } = useAuth();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const generateCode = useCallback(() => {
    const name = profile?.full_name?.split(" ")[0]?.toUpperCase() || "USER";
    return `${name}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    fetchReferralData();
  }, [user]);

  const fetchReferralData = async () => {
    if (!user) return;
    try {
      // Get or create referral code on profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("user_id", user.id)
        .single();

      let code = (profileData as any)?.referral_code;
      if (!code) {
        code = generateCode();
        await supabase
          .from("profiles")
          .update({ referral_code: code } as any)
          .eq("user_id", user.id);
      }

      // Get referral stats
      const { data: referrals } = await supabase
        .from("referrals" as any)
        .select("*")
        .eq("referrer_user_id", user.id);

      const refs = (referrals as any[]) || [];

      setData({
        code,
        totalReferred: refs.length,
        successfulReferrals: refs.filter(r => r.status === "completed").length,
        pendingReferrals: refs.filter(r => r.status === "pending").length,
      });
    } catch (err) {
      console.error("Error fetching referral data:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (data?.code) {
      navigator.clipboard.writeText(data.code);
      setCopied(true);
      toast({ title: "Referral code copied!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLink = () => {
    const url = `${window.location.origin}/register?ref=${data?.code}`;
    if (navigator.share) {
      navigator.share({ title: "Join Sunbird POS", text: "Sign up with my referral code and get extra trial days!", url });
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Referral link copied!" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const rewards = [
    { action: "Friend signs up", reward: "+3 trial days" },
    { action: "Friend subscribes", reward: "+7 trial days" },
    { action: "5 referrals", reward: "1 month free Basic" },
    { action: "10 referrals", reward: "1 month free Business" },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
          <Gift className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Invite & Earn</h1>
          <p className="text-muted-foreground text-[14px] mt-0.5">Share your referral code and earn rewards</p>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className="glass-card p-6">
        <p className="text-[13px] text-muted-foreground mb-3">Your Referral Code</p>
        <div className="flex gap-3">
          <Input
            value={data?.code || ""}
            readOnly
            className="font-mono text-[18px] font-bold tracking-widest text-center rounded-xl h-12 bg-secondary/50"
          />
          <Button onClick={copyCode} variant="outline" className="rounded-xl h-12 px-5 shrink-0">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button onClick={shareLink} className="rounded-xl h-12 px-5 shrink-0">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card text-center">
          <Users className="h-5 w-5 text-chart-3 mx-auto mb-2" />
          <p className="text-[24px] font-bold">{data?.totalReferred || 0}</p>
          <p className="text-[11px] text-muted-foreground">Total Referred</p>
        </div>
        <div className="stat-card text-center">
          <Trophy className="h-5 w-5 text-success mx-auto mb-2" />
          <p className="text-[24px] font-bold">{data?.successfulReferrals || 0}</p>
          <p className="text-[11px] text-muted-foreground">Subscribed</p>
        </div>
        <div className="stat-card text-center">
          <Gift className="h-5 w-5 text-warning mx-auto mb-2" />
          <p className="text-[24px] font-bold">{data?.pendingReferrals || 0}</p>
          <p className="text-[11px] text-muted-foreground">Pending</p>
        </div>
      </div>

      {/* Rewards Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/30">
          <h3 className="font-semibold text-[15px] tracking-tight">Reward Tiers</h3>
        </div>
        <div className="divide-y divide-border/10">
          {rewards.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-3.5">
              <span className="text-[13px] text-muted-foreground">{r.action}</span>
              <span className="text-[13px] font-semibold text-primary">{r.reward}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;
