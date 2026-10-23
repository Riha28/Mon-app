// Liste mondiale des pays (français), groupée par région pour l'affichage.
// FCFA_COUNTRIES = zone UEMOA (franc CFA / mobile money) -> paiement Kkiapay.
// Tous les autres pays -> paiement Stripe (EUR).

export const COUNTRY_GROUPS = [
  {
    label: "Afrique de l'Ouest",
    countries: [
      "Bénin", "Burkina Faso", "Cap-Vert", "Côte d'Ivoire", "Gambie", "Ghana",
      "Guinée", "Guinée-Bissau", "Liberia", "Mali", "Mauritanie", "Niger",
      "Nigéria", "Sénégal", "Sierra Leone", "Togo",
    ],
  },
  {
    label: "Afrique centrale, de l'Est, australe & du Nord",
    countries: [
      "Afrique du Sud", "Algérie", "Angola", "Botswana", "Burundi", "Cameroun",
      "Comores", "Congo (Brazzaville)", "Congo (RDC)", "Djibouti", "Égypte",
      "Érythrée", "Eswatini", "Éthiopie", "Gabon", "Guinée équatoriale", "Kenya",
      "Lesotho", "Libye", "Madagascar", "Malawi", "Maroc", "Maurice", "Mozambique",
      "Namibie", "Ouganda", "République centrafricaine", "Rwanda",
      "São Tomé-et-Príncipe", "Seychelles", "Somalie", "Soudan", "Soudan du Sud",
      "Tanzanie", "Tchad", "Tunisie", "Zambie", "Zimbabwe",
    ],
  },
  {
    label: "Europe",
    countries: [
      "Albanie", "Allemagne", "Andorre", "Autriche", "Belgique", "Biélorussie",
      "Bosnie-Herzégovine", "Bulgarie", "Chypre", "Croatie", "Danemark", "Espagne",
      "Estonie", "Finlande", "France", "Grèce", "Hongrie", "Irlande", "Islande",
      "Italie", "Kosovo", "Lettonie", "Liechtenstein", "Lituanie", "Luxembourg",
      "Macédoine du Nord", "Malte", "Moldavie", "Monaco", "Monténégro", "Norvège",
      "Pays-Bas", "Pologne", "Portugal", "République tchèque", "Roumanie",
      "Royaume-Uni", "Russie", "Saint-Marin", "Serbie", "Slovaquie", "Slovénie",
      "Suède", "Suisse", "Ukraine",
    ],
  },
  {
    label: "Amérique du Nord",
    countries: ["Canada", "États-Unis", "Mexique"],
  },
  {
    label: "Amérique latine & Caraïbes",
    countries: [
      "Argentine", "Bahamas", "Barbade", "Belize", "Bolivie", "Brésil", "Chili",
      "Colombie", "Costa Rica", "Cuba", "Équateur", "Guatemala", "Guyana", "Haïti",
      "Honduras", "Jamaïque", "Nicaragua", "Panama", "Paraguay", "Pérou",
      "République dominicaine", "Salvador", "Trinité-et-Tobago", "Uruguay",
      "Venezuela",
    ],
  },
  {
    label: "Moyen-Orient",
    countries: [
      "Arabie saoudite", "Bahreïn", "Émirats arabes unis", "Irak", "Iran",
      "Israël", "Jordanie", "Koweït", "Liban", "Oman", "Palestine", "Qatar",
      "Syrie", "Turquie", "Yémen",
    ],
  },
  {
    label: "Asie",
    countries: [
      "Afghanistan", "Arménie", "Azerbaïdjan", "Bangladesh", "Bhoutan",
      "Birmanie (Myanmar)", "Brunei", "Cambodge", "Chine", "Corée du Nord",
      "Corée du Sud", "Géorgie", "Inde", "Indonésie", "Japon", "Kazakhstan",
      "Kirghizistan", "Laos", "Malaisie", "Maldives", "Mongolie", "Népal",
      "Ouzbékistan", "Pakistan", "Philippines", "Singapour", "Sri Lanka",
      "Tadjikistan", "Taïwan", "Thaïlande", "Timor oriental", "Turkménistan",
      "Vietnam",
    ],
  },
  {
    label: "Océanie",
    countries: [
      "Australie", "Fidji", "Kiribati", "Îles Marshall", "Micronésie", "Nauru",
      "Nouvelle-Zélande", "Palaos", "Papouasie-Nouvelle-Guinée", "Samoa",
      "Îles Salomon", "Tonga", "Tuvalu", "Vanuatu",
    ],
  },
];

export const COUNTRIES = COUNTRY_GROUPS.flatMap((g) => g.countries);

// Zone UEMOA (franc CFA XOF) — paiement via Kkiapay (Mobile Money).
export const FCFA_COUNTRIES = new Set([
  "Bénin", "Burkina Faso", "Côte d'Ivoire", "Guinée-Bissau",
  "Mali", "Niger", "Sénégal", "Togo",
]);

export function isFcfaCountry(country) {
  return FCFA_COUNTRIES.has(country);
}
