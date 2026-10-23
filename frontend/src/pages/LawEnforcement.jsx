import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

export default function LawEnforcement() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3">
        <div className="mx-auto max-w-3xl flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-full p-1.5 hover:bg-secondary"><ArrowLeft className="h-5 w-5" /></button>
          <Logo size={34} withText variant="dark" />
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 text-sm leading-relaxed text-muted-foreground">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Protocole pour les Forces de l'Ordre</h1>
        <section className="space-y-3 bg-zinc-900/50 p-6 rounded-xl border">
          <p><strong>Éditeur:</strong> Diaspora Love Connect - www.diasporaloveconnect.net</p>
          <p><strong>Contact officiel:</strong> supportdiasporaloveconnect@gmail.com</p>
          <p><strong>Objet à mettre:</strong> "Law Enforcement Request"</p>
          <p>Nous coopérons pleinement avec les autorités judiciaires françaises et européennes sur présentation d'une réquisition judiciaire valide.</p>
          <p><strong>Procédure:</strong> Envoyez votre demande par email. Nous répondons sous 48h ouvrées avec les informations légales autorisées (logs, IP, signalements) dans le respect du RGPD.</p>
          <p><strong>Urgence:</strong> Pour cas impliquant un mineur ou danger imminent, mentionnez URGENT et nous traitons sous 4h.</p>
          <p>Site strictement réservé aux 18+ avec modération 24/7.</p>
        </section>
      </main>
    </div>
  );
}
