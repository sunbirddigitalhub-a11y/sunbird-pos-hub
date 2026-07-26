import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";

// Local typed wrapper for the beta supabase.auth.oauth namespace.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

function isSameOriginPath(next: string | null): next is string {
  return !!next && next.startsWith("/") && !next.startsWith("//");
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Missing authorization_id");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?next=" + encodeURIComponent(next);
        return;
      }
      try {
        const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (error) return setError(error.message ?? "Could not load authorization details.");
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data);
      } catch (e: any) {
        setError(e?.message ?? "Unexpected error loading authorization.");
      }
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    try {
      const { data, error } = approve
        ? await oauth.approveAuthorization(authorizationId)
        : await oauth.denyAuthorization(authorizationId);
      if (error) {
        setBusy(false);
        return setError(error.message ?? "Authorization failed.");
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setBusy(false);
        return setError("No redirect returned by the authorization server.");
      }
      window.location.href = target;
    } catch (e: any) {
      setBusy(false);
      setError(e?.message ?? "Unexpected error.");
    }
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">Authorization error</h1>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  const clientName = details.client?.name ?? details.client?.client_name ?? "an app";
  const redirectUri = details.client?.redirect_uri ?? details.redirect_uri;
  const scopes: string[] = Array.isArray(details.scopes)
    ? details.scopes
    : typeof details.scope === "string"
      ? details.scope.split(/\s+/).filter(Boolean)
      : [];

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-[16px] font-semibold text-foreground">
              Connect {clientName} to SunbirdPOSHub
            </h1>
            <p className="text-[12px] text-muted-foreground">
              This lets {clientName} use this app as you.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-[13px] text-foreground">
          <p>
            {clientName} will be able to call SunbirdPOSHub's enabled tools while you are signed in.
            Your existing role and business permissions still apply.
          </p>
          {redirectUri && (
            <p className="text-muted-foreground text-[12px] break-all">
              Redirects to: <span className="font-mono">{redirectUri}</span>
            </p>
          )}
          {scopes.length > 0 && (
            <ul className="text-[12px] text-muted-foreground list-disc pl-4">
              {scopes.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            disabled={busy}
            onClick={() => decide(false)}
          >
            Cancel connection
          </Button>
          <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
          </Button>
        </div>
      </div>
    </main>
  );
}
