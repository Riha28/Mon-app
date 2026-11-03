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
import { Loader2 } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [busy, setBusy] = useState(false);
  
  // Vos identifiants de connexion officiels
  const [form, setForm] = useState({ 
    email: "supportdiasporaloveconnect@gmail.com", 
    password: "" 
  });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const auth = getAuth(app);
      const cred = await signInWithEmailAndPassword(auth, form.email, form.password);
      
      // Configuration de la session utilisateur locale en mode administrateur
      const adminSession = {
        ...cred.user,
        role: "admin",
        access_level: "admin",
        display_name: "Administrateur"
      };
      
      setUser(adminSession);
      toast.success("Connexion réussie !");
      
      // Redirection immédiate vers le tableau de bord
      navigate("/admin");
    } catch (err) {
      toast.error("Mot de passe incorrect ou erreur de connexion");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background justify-center items-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-6 flex justify-center">
          <Logo size={120} stacked />
        </div>

        <h1 className="font-serif text-2xl font-semibold text-center mb-6">Connexion Administration</h1>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Adresse E-mail Admin</Label>
            <Input 
              id="email" 
              type="email" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              disabled 
              className="bg-muted text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Votre Mot de passe</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Saisissez votre mot de passe secret"
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              required 
            />
          </div>

          <Button type="submit" className="w-full rounded-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-medium" disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Se connecter au Dashboard
          </Button>
        </form>
      </div>
    </div>
  );
}
