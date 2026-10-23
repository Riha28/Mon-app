import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Loader2, MailCheck, MailX } from "lucide-react";
import { api, apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function VerifyEmail() {
  const { t } = useI18n();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [errMsg, setErrMsg] = useState("");
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!token) {
      setStatus("error");
      setErrMsg(t("verify.missing"));
      return;
    }
    api.post("/auth/verify-email", { token })
      .then(({ data }) => {
        setUser(data);
        setStatus("success");
        setTimeout(() => navigate("/app"), 1500);
      })
      .catch((err) => {
        setStatus("error");
        setErrMsg(apiError(err));
      });
  }, [token, navigate, setUser, t]);

  const resend = async () => {
    if (!email) { toast.error(t("verify.enterEmail")); return; }
    setResending(true);
    try {
      await api.post("/auth/resend-verification", { email });
      toast.success(t("auth.verifyResent"));
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8"><Logo size={40} withText variant="dark" /></div>
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
        {status === "verifying" && (
          <div data-testid="verify-loading">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">{t("verify.checking")}</p>
          </div>
        )}
        {status === "success" && (
          <div data-testid="verify-success">
            <MailCheck className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 font-serif text-2xl font-semibold">{t("verify.successTitle")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("verify.successBody")}</p>
          </div>
        )}
        {status === "error" && (
          <div data-testid="verify-error">
            <MailX className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="mt-4 font-serif text-2xl font-semibold">{t("verify.errorTitle")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{errMsg}</p>
            <div className="mt-6 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.email")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                data-testid="verify-email-input"
              />
              <Button className="w-full rounded-full" onClick={resend} disabled={resending} data-testid="verify-resend-btn">
                {resending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t("auth.verifyResend")}
              </Button>
              <button className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/auth")} data-testid="verify-to-login-btn">
                {t("auth.toLogin")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
