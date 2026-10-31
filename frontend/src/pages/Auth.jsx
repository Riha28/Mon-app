import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [busy, setBusy] = useState(false);

  // Vérifier automatiquement le résultat du retour de Google au chargement de la page
  useEffect(() => {
    const auth = getAuth(app);
    getRedirectResult(auth)
      .then((cred) => {
        if (cred?.user) {
          const adminSession = {
            ...cred.user,
            role: "admin",
            access_level: "admin",
            display_name: cred.user.displayName || "Admin"
          };
          setUser(adminSession);
          toast.success("Accès Administrateur validé !");
          navigate("/admin");
        }
      })
      .catch((err) => {
        toast.error("Erreur lors du retour de la connexion");
      });
  }, [navigate, setUser]);

  const googleAdminLogin = async () => {
    setBusy(true);
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      // Utilisation de la redirection au lieu de la pop-up pour éviter les blocages iPad
      await signInWithRedirect(auth, provider);
    } catch (err) {
      toast.error("Erreur lors de la redirection Google");
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background justify-center items-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-lg text-center">
        <div className="mb-6 flex justify-center">
          <Logo size={120} stacked />
        </div>

        <h1 className="font-serif text-2xl font-semibold mb-2">Espace Connexion Privé</h1>
        <p className="text-sm text-muted-foreground mb-6">Cliquez ci-dessous pour vous connecter instantanément à votre Dashboard Administrateur.</p>

        <Button className="w-full rounded-full py-6 flex items-center justify-center gap-3 bg-yellow-500 hover:bg-yellow-600 text-black font-medium" onClick={googleAdminLogin} disabled={busy}>
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#000000" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#000000" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#000000" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#000000" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Connexion Administrateur Unique</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
