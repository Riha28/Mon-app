import React from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowLeft } from "lucide-react";
import { useT8n } from "@/lib/i18n";

export default function Legal() {
  const navigate = useNavigate();
  const { lang } = useT8n();
  const fr = lang === "fr";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3">
        <div className="mx-auto max-w-3xl flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-full p-1.5 hover:bg-secondary"><ArrowLeft className="h-5 w-5" /></button>
          <Logo size={34} withText variant="dark" />
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 text-sm leading-relaxed text-muted-foreground">
        <h1 className="font-serif text-3xl font-semibold text-foreground">Mentions légales & Politiques</h1>

        <section id="terms" className="space-y-3 bg-zinc-900/50 p-6 rounded-xl border">
          <h2 className="font-serif text-xl font-semibold text-foreground">1. CGU & Abonnements</h2>
          <p><strong>Éditeur:</strong> Diaspora Love Connect - contact@diasporaloveconnect.net</p>
          <p>Abonnement Premium mensuel récurrent sans engagement via Stripe. Annulation à tout moment dans Profil {'>'} Gérer abonnement. Accès maintenu jusqu'à fin de période. Interdit: harcèlement, escroquerie, faux profils. Bannissement immédiat.</p>
        </section>

        <section id="privacy" className="space-y-3 bg-zinc-900/50 p-6 rounded-xl border">
          <h2 className="font-serif text-xl font-semibold text-foreground">2. Confidentialité RGPD</h2>
          <p>Collecte: email, photos, préférences. Hébergement UE, jamais revendues. Paiements: aucune carte stockée chez nous, tout géré par Stripe PCI-DSS. Droits: accès, suppression via privacy@diasporaloveconnect.net</p>
          <p>Vérification identité via Stripe Identity. Nous ne stockons que statut + ID Stripe + date. Documents bruts supprimés sous 30 jours.</p>
        </section>

        <section id="refund" className="space-y-3 bg-zinc-900/50 p-6 rounded-xl border">
          <h2 className="font-serif text-xl font-semibold text-foreground">3. Remboursement & Résiliation</h2>
          <p><strong>Résiliation:</strong> 1 clic dans Profil {'>'} Gérer abonnement {'>'} Annuler.</p>
          <p><strong>Remboursement:</strong> 14 jours UE après premier paiement si fonctionnalités premium non utilisées. Pas de remboursement partiel au-delà. Litige: support@diasporaloveconnect.net (48h).</p>
        </section>

        <section id="contact" className="space-y-3 bg-zinc-900/50 p-6 rounded-xl border">
          <h2 className="font-serif text-xl font-semibold text-foreground">4. Support & Contact</h2>
          <p>support@diasporaloveconnect.net - contact@diasporaloveconnect.net - Réponse 24-48h ouvrées</p>
          <p>Site: https://diasporaloveconnect.net/legal</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-foreground">Conservation & Sécurité</h2>
          <p>Statut vérification conservé tant que compte actif, suppression à la suppression du compte ou 24 mois d'inactivité. Filtre anti-doxxing actif, signalement et blocage disponibles. Localisation précise GPS jamais collectée.</p>
        </section>
      </main>
    </div>
  );
}