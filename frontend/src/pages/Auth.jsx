import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [busy, setBusy] = useState(false);
  
  // Vos identifiants de connexion pré-remplis automatiquement ici :
  const [form, setForm] = useState({ 
    email: "supportdiasporaloveconnect@gmail.com", 
    password: "Djamilatou.29" 
  });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const auth = getAuth(app);
      const cred = await signInWithEmailAndPassword(auth, form.email, form.password);
      setUser(cred.user);
      navigate("/app");
    } catch (err) {
      toast.error("Identifiants invalides ou erreur de connexion");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          <Logo size={34} withText variant="dark" />
        </button>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-lg">
          <div className="mb-6 flex justify-center">
            <Logo size={150} stacked />
          </div>

          <h1 className="font-serif text-3xl font-semibold text-center mb-6">Connexion Admin</h1>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Adresse E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                required 
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                type="password" 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                required 
              />
            </div>

            <Button type="submit" className="w-full rounded-full mt-4" disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Se connecter au Dashboard
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
