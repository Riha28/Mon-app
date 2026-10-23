import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const processed = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) { navigate("/auth"); return; }
    const sessionId = decodeURIComponent(match[1]);
    (async () => {
      try {
        const { data } = await api.post("/auth/session", { session_id: sessionId });
        window.history.replaceState(null, "", "/app");
        setUser(data);
        navigate("/app");
      } catch (e) {
        setError(apiError(e));
        setTimeout(() => navigate("/auth"), 2500);
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#121417] text-[#F5F3EF]">
      <Logo size={56} variant="dark" />
      {error ? <p className="text-sm text-red-400">{error}</p> : <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--gold))]" />}
    </div>
  );
}
