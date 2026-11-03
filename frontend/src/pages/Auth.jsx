 import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  
  const [form, setForm] = useState({ 
    email: "supportdiasporaloveconnect@gmail.com", 
    password: "" 
  });

  const submit = (e) => {
    e.preventDefault();
    setBusy(true);
    
    if (form.password === "Djamilatou.29") {
      const adminSession = {
        uid: "admin_master_account",
        email: "supportdiasporaloveconnect@gmail.com",
        role: "admin",
        access_level: "admin",
        display_name: "Administrateur"
      };
      
      setUser(adminSession);
      toast.success("Connexion réussie !");
      
      setTimeout(() => {
        navigate("/admin");
      }, 300);
    } else {
      toast.error("Mot de passe administrateur incorrect");
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
