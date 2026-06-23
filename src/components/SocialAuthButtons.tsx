import { useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/store";

export function SocialAuthButtons() {
  const { loginWithGoogle, loginWithApple } = useAuth();
  
  const [pending, setPending] = useState<"google" | "apple" | null>(null);

  const handle = async (provider: "google" | "apple") => {
    setPending(provider);
    const fn = provider === "google" ? loginWithGoogle : loginWithApple;
    const res = await fn();
    if (res.error) {
      toast.error(res.error);
      setPending(null);
      return;
    }
    // If tokens came back inline, the session is set — full nav to the dashboard.
    window.location.assign("/dashboard");
  };

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={pending !== null}
        onClick={() => handle("google")}
        className="gap-2"
      >
        <GoogleIcon /> {pending === "google" ? "…" : "Google"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={pending !== null}
        onClick={() => handle("apple")}
        className="gap-2"
      >
        <AppleIcon /> {pending === "apple" ? "…" : "Apple"}
      </Button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-4 w-4 fill-foreground" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16.36 1.43c.04 1.06-.35 2.08-1.04 2.84-.72.8-1.9 1.42-3.04 1.33-.06-1.04.43-2.1 1.08-2.78.73-.78 1.98-1.36 3-1.39zM20.4 17.2c-.55 1.27-.82 1.84-1.53 2.97-.99 1.57-2.39 3.53-4.12 3.54-1.54.02-1.93-1-4.02-.99-2.08.01-2.51 1.01-4.05.99-1.73-.01-3.06-1.78-4.05-3.35C-.27 16.13-.57 11.1 1.13 8.39c1.04-1.66 2.68-2.62 4.22-2.62 1.57 0 2.56 1.06 3.86 1.06 1.26 0 2.03-1.06 3.85-1.06 1.36 0 2.8.74 3.83 2.02-3.36 1.84-2.82 6.64.51 8.41z" />
    </svg>
  );
}