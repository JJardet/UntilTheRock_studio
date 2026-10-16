// Configuration du site - Personnalisez ici vos informations
const SITE_CONFIG = {
  // Informations du studio
  studio: {
    name: "UntilTheRock",
    tagline: "Votre studio d'enregistrement professionnel",
    description: "Enregistrement et location de matériel - Tout pour votre projet musical",
    email: "contact@untiltherock.com",
    phone: "+33 1 23 45 67 89",
    address: "123 Rue de la Musique, 75000 Paris",
    siret: "123 456 789 00012"
  },

  // Réseaux sociaux
  social: {
    facebook: "https://facebook.com/untiltherock",
    instagram: "https://instagram.com/untiltherock",
    twitter: "https://twitter.com/untiltherock",
    youtube: "https://youtube.com/untiltherock"
  },

  // Horaires d'ouverture
  hours: {
    monday: "9h00 - 22h00",
    tuesday: "9h00 - 22h00",
    wednesday: "9h00 - 22h00",
    thursday: "9h00 - 22h00",
    friday: "9h00 - 22h00",
    saturday: "10h00 - 20h00",
    sunday: "Fermé"
  },

  // Informations légales
  legal: {
    companyName: "UntilTheRock Studio SARL",
    siret: "123 456 789 00012",
    tva: "FR12345678901",
    capital: "10 000€",
    rcs: "RCS Paris B 123 456 789",
    director: "Jean Dupont",
    host: {
      name: "OVH",
      address: "2 rue Kellermann, 59100 Roubaix, France"
    }
  }
};

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SITE_CONFIG;
}
