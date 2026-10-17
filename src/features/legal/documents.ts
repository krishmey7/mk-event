/**
 * Documents légaux MK Events — version publiée (affichage app / web).
 * À faire valider par un conseil juridique avant une ouverture commerciale large.
 */

export const LEGAL_CONTACT_EMAIL = 'mkeventscopyright@gmail.com';
export const LEGAL_SITE_URL = 'https://mk-event-five.vercel.app';
export const LEGAL_UPDATED_AT = '5 octobre 2026';
export const LEGAL_VERSION = '1.0';

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalDocument {
  slug: 'cgu' | 'confidentialite';
  title: string;
  shortTitle: string;
  updatedAt: string;
  version: string;
  intro: string;
  sections: LegalSection[];
}

export const TERMS_OF_USE: LegalDocument = {
  slug: 'cgu',
  title: 'Conditions d’utilisation',
  shortTitle: 'CGU',
  updatedAt: LEGAL_UPDATED_AT,
  version: LEGAL_VERSION,
  intro:
    'Les présentes Conditions d’utilisation (« CGU ») régissent l’accès et l’usage de la plateforme MK Events, accessible notamment via '
    + `${LEGAL_SITE_URL}. En créant un compte ou en utilisant le service, vous acceptez ces CGU.`,
  sections: [
    {
      title: '1. Éditeur et objet du service',
      paragraphs: [
        'MK Events est un service numérique permettant aux organisateurs de créer des invitations numériques, de gérer leurs invités (RSVP, tables, check-in), et de partager une page d’invitation personnalisée.',
        `Pour toute question relative au service : ${LEGAL_CONTACT_EMAIL}.`,
      ],
    },
    {
      title: '2. Accès au service',
      paragraphs: [
        'L’inscription est réservée aux personnes majeures ou aux mineurs disposant de l’autorisation de leur représentant légal.',
        'Vous vous engagez à fournir des informations exactes lors de la création du compte et à conserver la confidentialité de vos identifiants.',
        'MK Events peut faire évoluer, suspendre ou limiter certaines fonctionnalités pour maintenance, sécurité ou amélioration du produit.',
      ],
    },
    {
      title: '3. Compte organisateur',
      paragraphs: [
        'Le compte permet de créer et publier des événements, d’importer ou saisir des listes d’invités, de collecter des réponses, et d’utiliser les outils de jour J (pass, check-in).',
        'Vous êtes responsable de l’usage de votre compte et des contenus que vous publiez (textes, photos, musique, messages).',
      ],
    },
    {
      title: '4. Données des invités et responsabilités',
      paragraphs: [
        'Lorsque vous saisissez des coordonnées d’invités (nom, e-mail, téléphone, etc.), vous agissez en tant que responsable du traitement de ces données pour votre événement.',
        'Vous vous engagez à ne collecter que les données nécessaires, à disposer d’une base légale adaptée (souvent l’intérêt légitime ou le consentement dans le cadre privé de l’événement), et à informer vos invités de l’usage qui en est fait.',
        'MK Events traite ces données pour votre compte afin d’exécuter le service (affichage de l’invitation, RSVP, livre d’or, check-in).',
      ],
    },
    {
      title: '5. Usages interdits',
      paragraphs: [
        'Il est interdit d’utiliser MK Events pour diffuser des contenus illicites, diffamatoires, haineux, contrefaisants, ou portant atteinte à la vie privée de tiers.',
        'Il est interdit de tenter d’accéder sans autorisation aux comptes, invitations ou données d’autres utilisateurs, de perturber le service, ou d’en automatiser l’usage de façon abusive (spam, scraping massif, surcharge).',
      ],
    },
    {
      title: '6. Propriété intellectuelle',
      paragraphs: [
        'La marque MK Events, l’interface, les modèles graphiques et le code du service restent la propriété de leurs titulaires.',
        'Les contenus que vous importez (photos, textes, fichiers audio) restent votre propriété. Vous concédez à MK Events une licence limitée, non exclusive, pour les héberger et les afficher aux destinataires de votre invitation.',
      ],
    },
    {
      title: '7. Disponibilité et limitation de responsabilité',
      paragraphs: [
        'Le service est fourni « en l’état ». MK Events s’efforce d’assurer une disponibilité raisonnable, sans garantie d’absence d’interruption ou d’erreur.',
        'Dans les limites autorisées par la loi, MK Events ne saurait être responsable des dommages indirects, pertes de données liées à un usage non conforme, ou contenus publiés par les organisateurs ou les invités.',
        'Vous restez seul responsable de la sauvegarde de vos informations importantes et de la conformité de votre événement à la réglementation applicable.',
      ],
    },
    {
      title: '8. Résiliation',
      paragraphs: [
        'Vous pouvez cesser d’utiliser le service à tout moment. Sur demande à '
        + `${LEGAL_CONTACT_EMAIL}, la suppression de votre compte pourra être traitée sous réserve des obligations légales de conservation.`,
        'MK Events peut suspendre ou résilier un compte en cas de violation des présentes CGU, de risque de sécurité, ou d’usage frauduleux.',
      ],
    },
    {
      title: '9. Droit applicable',
      paragraphs: [
        'Les présentes CGU sont régies par le droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français compétents seront saisis.',
      ],
    },
    {
      title: '10. Évolution des CGU',
      paragraphs: [
        `La version en vigueur est la version ${LEGAL_VERSION}, mise à jour le ${LEGAL_UPDATED_AT}.`,
        'En cas de modification substantielle, une information pourra être affichée dans l’application. La poursuite d’utilisation après mise à jour vaut acceptation des nouvelles conditions, sous réserve des droits qui vous sont reconnus par la loi.',
      ],
    },
  ],
};

export const PRIVACY_POLICY: LegalDocument = {
  slug: 'confidentialite',
  title: 'Politique de confidentialité',
  shortTitle: 'Confidentialité',
  updatedAt: LEGAL_UPDATED_AT,
  version: LEGAL_VERSION,
  intro:
    'La présente Politique décrit comment MK Events collecte, utilise et protège les données personnelles dans le cadre du service d’invitations numériques, conformément au RGPD et à la loi française « Informatique et Libertés ».',
  sections: [
    {
      title: '1. Responsable de traitement',
      paragraphs: [
        'Pour les données du compte organisateur (identité, e-mail, préférences, journaux techniques liés au compte), le responsable de traitement est l’éditeur du service MK Events.',
        `Contact : ${LEGAL_CONTACT_EMAIL}.`,
        'Pour les données relatives aux invités d’un événement (liste d’invités, RSVP, messages du livre d’or), l’organisateur est en principe responsable de traitement ; MK Events agit comme sous-traitant pour fournir le service.',
      ],
    },
    {
      title: '2. Données collectées',
      paragraphs: [
        'Compte organisateur : nom, adresse e-mail, mot de passe (stocké de façon sécurisée / hashée), préférences d’apparence et d’événement.',
        'Contenu d’invitation : textes, photos, configuration studio, éventuellement fichier audio d’ambiance.',
        'Invités : prénom/nom, coordonnées fournies par l’organisateur, statut RSVP, choix (ex. boissons), informations de table / check-in, messages du livre d’or.',
        'Données techniques : journaux serveur nécessaires au fonctionnement et à la sécurité (adresses IP, horodatages, erreurs), jetons de session.',
      ],
    },
    {
      title: '3. Finalités et bases légales',
      paragraphs: [
        'Exécution du contrat / du service : création de compte, publication d’invitation, RSVP, partage de liens, check-in.',
        'Intérêt légitime : sécurisation du service, prévention des abus, amélioration de la fiabilité.',
        'Obligations légales : conservation limitée de certaines traces en cas de nécessité (sécurité, litiges).',
        'Consentement : lorsque requis (par exemple acceptation des CGU à l’inscription, ou fonctionnalités optionnelles).',
      ],
    },
    {
      title: '4. Destinataires',
      paragraphs: [
        'Les données sont accessibles aux équipes techniques de MK Events dans la limite du besoin.',
        'Des prestataires d’hébergement et d’infrastructure (par ex. plateforme cloud pour le front et l’API) peuvent traiter des données pour notre compte, selon des instructions et des mesures de sécurité adaptées.',
        'Les invités voient uniquement les informations publiées sur leur page d’invitation et les éléments nécessaires à leur participation.',
        'Aucune vente de données personnelles à des tiers à des fins publicitaires n’est réalisée.',
      ],
    },
    {
      title: '5. Durées de conservation',
      paragraphs: [
        'Compte organisateur : pendant la durée d’utilisation du service, puis suppression ou anonymisation après demande ou inactivité prolongée, sous réserve d’obligations légales.',
        'Événements et invités : conservés tant que l’organisateur maintient l’événement / le compte, ou jusqu’à suppression demandée.',
        'Journaux techniques : durée limitée, proportionnée aux besoins de sécurité et de diagnostic.',
      ],
    },
    {
      title: '6. Transferts hors UE',
      paragraphs: [
        'Selon la configuration d’hébergement, des traitements peuvent impliquer des infrastructures situées hors de l’Espace économique européen. Dans ce cas, MK Events s’appuie sur des garanties appropriées (clauses contractuelles types ou mécanismes équivalents) lorsque cela est requis.',
      ],
    },
    {
      title: '7. Sécurité',
      paragraphs: [
        'Mesures mises en œuvre notamment : authentification par jetons, isolation des données par organisateur côté API, accès public aux invitations limité aux informations nécessaires, absence de cache PWA sur les routes API authentifiées.',
        'Aucun système n’étant infaillible, nous vous invitons à utiliser un mot de passe robuste et à nous signaler tout incident suspect à '
        + `${LEGAL_CONTACT_EMAIL}.`,
      ],
    },
    {
      title: '8. Vos droits',
      paragraphs: [
        'Conformément au RGPD, vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition, et de portabilité lorsque applicable.',
        `Pour exercer vos droits : ${LEGAL_CONTACT_EMAIL}. Nous répondrons dans les délais légaux.`,
        'Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).',
        'Si vous êtes invité et souhaitez faire modifier vos données liées à un événement, contactez d’abord l’organisateur ; MK Events pourra vous orienter si nécessaire.',
      ],
    },
    {
      title: '9. Cookies et application web (PWA)',
      paragraphs: [
        'Le service web peut utiliser le stockage local du navigateur pour la session, les préférences d’apparence et le fonctionnement hors-ligne partiel (PWA).',
        'Ces mécanismes sont utilisés pour le fonctionnement du service, non pour de la publicité comportementale tierce.',
      ],
    },
    {
      title: '10. Évolution de la politique',
      paragraphs: [
        `Version ${LEGAL_VERSION} — mise à jour le ${LEGAL_UPDATED_AT}.`,
        'Toute mise à jour importante sera publiée sur cette page. Nous vous invitons à la consulter régulièrement.',
      ],
    },
  ],
};

export function getLegalDocument(slug: LegalDocument['slug']): LegalDocument {
  return slug === 'cgu' ? TERMS_OF_USE : PRIVACY_POLICY;
}
