import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

export default function AcceptableUse() {
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
        <h1 className="font-serif text-2xl font-semibold text-foreground">Politique d'Utilisation Acceptable - Diaspora Love Connect</h1>
        <section className="space-y-3 bg-zinc-900/50 p-6 rounded-xl border">
          <p><strong>Éditeur:</strong> Diaspora Love Connect - www.diasporaloveconnect.net</p>
          <p><strong>Contact unique:</strong> supportdiasporaloveconnect@gmail.com - Réponse sous 48h ouvrées</p>
          <p><strong>Âge minimum 18 ans.</strong> Tout compte de mineur est immédiatement supprimé et signalé aux autorités.</p>
          <p><strong>Nos formules d'abonnement Premium mensuel récurrent sans engagement, paiement 100% sécurisé via Stripe:</strong></p>
          <ul className="list-disc ml-5">
            <li>Découverte: 15€ / mois</li>
            <li>Populaire: 29,99€ / mois</li>
            <li>Premium: 49,99€ / mois</li>
          </ul>
          <p><strong>Interdits:</strong> faux profils, arnaque, usurpation d'identité, harcèlement, discours haineux, contenu sexuellement explicite contre rémunération, prostitution, pornographie, drogues, activités illégales.</p>
          <p><strong>Modération:</strong> Surveillance 24/7. Tout signalement traité en 24h. Bannissement définitif en cas de violation.</p>
        </section>
      </main>
    </div>
  );
}
