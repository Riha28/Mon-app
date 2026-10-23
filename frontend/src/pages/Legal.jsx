import React from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowLeft } from "lucide-react";


export default function Legal() {
  const navigate = useNavigate();
  
  const fr = true;

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
          <h2 className="font-serif text-xl font-semibold text-foreground">1. CGU, Éditeur & Tarifs TTC</h2>
          <p><strong>Éditeur:</strong> Diaspora Love Connect - www.diasporaloveconnect.net</p>
          <p><strong>Contact unique:</strong> supportdiasporaloveconnect@gmail.com - Réponse sous 48h ouvrées</p>
          <p><strong>Nos 5 formules d'abonnement Premium mensuel récurrent sans engagement, paiement 100% sécurisé via Stripe:</strong></p>
          <ul className="list-disc ml-5 space-y-1">
            <li><strong>Découverte:</strong> 15€ / mois</li>
            <li><strong>Populaire (le plus choisi):</strong> 29,99€ / mois</li>
            <li><strong>VIP:</strong> 49,99€ / mois</li>
            <li><strong>Gold:</strong> 79,99€ / mois</li>
            <li><strong>Platinum:</strong> 129,99€ / mois</li>
          </ul>
          <p>Le prix exact est affiché clairement avant paiement dans le checkout Stripe. Renouvellement automatique mensuel. Aucun frais caché. Prix TTC.</p>
          <p>Annulation à tout moment dans Profil &gt; Gérer abonnement. Accès maintenu jusqu'à fin de période. Interdit: harcèlement, escroquerie, faux profils. Bannissement immédiat.</p>
        </section>

        <section id="privacy" className="space-y-3 bg-zinc-900/50 p-6 rounded-xl border">
          <h2 className="font-serif text-xl font-semibold text-foreground">2. Confidentialité RGPD</h2>
          <p>Collecte: email, photos, préférences. Hébergement UE, jamais revendues. Paiements: aucune carte stockée chez nous, tout géré par Stripe PCI-DSS. Droits: accès, suppression via supportdiasporaloveconnect@gmail.com</p>
          <p>Vérification identité via Stripe Identity. Nous ne stockons que statut + ID Stripe + date. Documents bruts supprimés sous 30 jours.</p>
        </section>

        <section id="refund" className="space-y-3 bg-zinc-900/50 p-6 rounded-xl border">
          <h2 className="font-serif text-xl font-semibold text-foreground">3. Remboursement & Résiliation</h2>
          <p><strong>Résiliation:</strong> 1 clic dans Profil &gt; Gérer abonnement &gt; Annuler. Prend effet à la fin de la période payée.</p>
          <p><strong>Remboursement:</strong> Contenu numérique à accès immédiat (L221-28). 14 jours UE après premier paiement si fonctionnalités premium non utilisées de manière significative. Demande à supportdiasporaloveconnect@gmail.com (48h). Pas de remboursement partiel au-delà.</p>
        </section>

        <section id="contact" className="space-y-3 bg-zinc-900/50 p-6 rounded-xl border">
          <h2 className="font-serif text-xl font-semibold text-foreground">4. Support & Contact</h2>
          <p>Email unique: supportdiasporaloveconnect@gmail.com - Réponse 24-48h ouvrées</p>
          <p>Site officiel: https://www.diasporaloveconnect.net - Page légale: https://www.diasporaloveconnect.net/legal</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-foreground">Conservation & Sécurité</h2>
          <p>Statut vérification conservé tant que compte actif, suppression à la suppression du compte ou 24 mois d'inactivité. Filtre anti-doxxing actif, signalement et blocage disponibles. Localisation précise GPS jamais collectée.</p>
        </section>
      </main>
    </div>
  );
}
