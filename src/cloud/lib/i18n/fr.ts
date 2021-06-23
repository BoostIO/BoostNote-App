import { TranslationSource, lngKeys } from './types'

const frTranslation: TranslationSource = {
  //General
  [lngKeys.GeneralError]: 'Erreur',
  [lngKeys.GeneralCreate]: 'Créer',
  [lngKeys.GeneralCancel]: 'Annuler',
  [lngKeys.GeneralUpdate]: 'Mettre à jour',
  [lngKeys.GeneralAttachments]: 'Pièces jointes',
  [lngKeys.GeneralArchive]: 'Archiver',
  [lngKeys.GeneralSignin]: 'Se connecter',
  [lngKeys.GeneralSigningIn]: 'Connection...',
  [lngKeys.GeneralSignout]: 'Déconnecter',
  [lngKeys.GeneralSave]: 'Sauvegarder',
  [lngKeys.GeneralDefault]: 'Défaut',
  [lngKeys.GeneralDelete]: 'Supprimer',
  [lngKeys.GeneralDaily]: 'Chaque jour',
  [lngKeys.GeneralWeekly]: 'Chaque semaine',
  [lngKeys.GeneralNever]: 'Jamais',

  // settings
  [lngKeys.SettingsInfo]: 'Mon Profile',
  [lngKeys.SettingsGeneral]: 'Mes Préférences',
  [lngKeys.SettingsNotifications]: 'Notifications par mail',
  [lngKeys.SettingsTeamInfo]: 'Paramètres',
  [lngKeys.SettingsTitle]: 'Paramètres',
  [lngKeys.SettingsPersonalInfo]: 'Paramètres',
  [lngKeys.SettingsPreferences]: 'Préférences',
  [lngKeys.SettingsTeamMembers]: 'Membres',
  [lngKeys.SettingsTeamUpgrade]: 'Mise à niveau',
  [lngKeys.SettingsTeamSubscription]: 'Facturation',
  [lngKeys.SettingsIntegrations]: 'Intégrations',
  [lngKeys.ManageIntegrations]: 'Connectez du contenu tiers à votre espace.',
  [lngKeys.SettingsAppFeedback]: 'Feedback',
  [lngKeys.SettingsSpace]: 'Espace',
  [lngKeys.SettingsSpaceDelete]: 'Supprimer cet espace',
  [lngKeys.SettingsSpaceDeleteWarning]:
    'Toutes les données associées à cet espace seront supprimées. Cette action est irréversible.',
  [lngKeys.SettingsAccount]: 'Compte',
  [lngKeys.SettingsAccountDelete]: 'Supprimer votre compte',
  [lngKeys.SettingsAccountDeleteWarning]:
    'Vous pouvez supprimer votre compte à tout moment. Veuillez noter cependant que cette action est irréversible',
  [lngKeys.SettingsUILanguage]: "Langue de l'interface",
  [lngKeys.SettingsApplicationTheme]: "Thème de l'appplication",
  [lngKeys.SettingsEditorTheme]: "Thème de l'éditeur",
  [lngKeys.SettingsCodeBlockTheme]: 'Thème des blocs de code',
  [lngKeys.SettingsEditorKeyMap]: "KeyMap pour l'éditeur",
  [lngKeys.SettingsLight]: 'Clair',
  [lngKeys.SettingsDark]: 'Sombre',
  [lngKeys.SettingsNotifFrequencies]: 'Fréquence de mises à jour par mail',
  [lngKeys.SettingsIndentType]: "Type d'indentation pour l'éditeur",
  [lngKeys.SettingsIndentSize]: "Taille de l'indentation pour l'éditeur",
  [lngKeys.SettingsUserForum]: "Forum d'utilisateurs (nouveau!)",
  [lngKeys.ManagePreferences]: 'Gérez vos préférences.',
  [lngKeys.ManageProfile]: 'Gérez votre profil.',
  [lngKeys.ManageSpaceSettings]: 'Gérez les paramètres de votre espace.',
  [lngKeys.ManageTeamMembers]: 'Gérez qui peut accéder à cet espace.',
  [lngKeys.CurrentMembers]: 'Membres courants',
  [lngKeys.AddMembers]: 'Ajouter des membres',
  [lngKeys.MembersAccessLevel]: "Niveau d'accès",
  [lngKeys.TeamCreate]: 'Créer un espace collaboratif',
  [lngKeys.TeamCreateSubtitle]:
    'Convertissez votre espace en un espace collaboratif pour inviter des équipiers.',
  [lngKeys.TeamName]: "Nom de l'équipe",
  [lngKeys.TeamDomain]: "Domaine de l'équipe",
  [lngKeys.SpaceName]: "Nom de l'espace",
  [lngKeys.SpaceDomain]: "Domaine de l'espace",
  [lngKeys.TeamDomainShow]: "L'url sera:",
  [lngKeys.TeamDomainWarning]:
    'Attention: Vous ne pourrez pas changer de domaine après cette étape.',
  [lngKeys.InviteWithOpenLink]: 'Inviter avec un lien ouvert',
  [lngKeys.InviteEmail]: 'Inviter par email',
  [lngKeys.RoleMemberDescription]:
    "Les membres peuvent accéder à toutes les fonctionnalités excepté pour la facturation ainsi que la gestion de l'équipe",
  [lngKeys.RoleAdminDescription]:
    "Les administrateurs peuvent accéder à la facturation, ainsi que promouvoir ou rétrograder les membres de l'équipe.",
  [lngKeys.RoleViewerDescription]:
    "Les observateurs peuvent seulement naviguer dans les différents dossiers ou documents, écrire des commentaires ou inviter d'autres observateurs à joindre l'espace.",
  [lngKeys.CancelInvite]: "Annuler l'invitation?",
  [lngKeys.CancelInviteOpenLinkMessage]:
    'Êtes vous certain de vouloir annuler cette invitation? Les liens actuels vont être désactivés.',
  [lngKeys.CancelInviteEmailMessage]:
    "Êtes vous certain de vouloir annuler cette invitation? L'utilisateur invité ne pourra plus rejoindre l'équipe.",
  [lngKeys.RoleAdminPromote]:
    "Vous allez promouvoir {{user}} au rang d'admin, ils vont pouvoir accéder à la gestion d'équipe ainsi qu'aux informations de facturation. Êtes vous certain?",
  [lngKeys.RoleMemberChange]:
    "Vous allez changer le role de {{user}} en celui d'un membre, ils vont être comptés lors de la facturation et peuvent participer activement dans l'équipe. Ils ne pourront cependant pas accéder aux informations de facturation. Êtes vous certain?",
  [lngKeys.RoleViewerDemote]:
    "Vous allez rétrograder {{user}} au rang d'observateur. Ils vont être sortis du calcul de facturation. Ils vont être incapables d'éditer ou de créer des dossiers ou documents, ils pourront cependant lire ainsi qu'écrire des commentaires. Êtes vous certain?",
  [lngKeys.TeamLeave]: "Quitter l'espace",
  [lngKeys.TeamLeaveWarning]:
    "Êtes vous certain de vouloir quitter cet espace? Vous ne pourrez plus accéder à son contenu. Le dernier membre de l'espace doit le supprimer complèment.",
  [lngKeys.RemovingMember]: 'Supprimer un membre',
  [lngKeys.RemovingMemberWarning]:
    'Vous allez supprimer {{user}} de cet espace. Êtes vous certain? ',
  [lngKeys.ExternalEntity]: 'Entités externes',
  [lngKeys.ExternalEntityOpenInBrowser]:
    'Ouvrir dans un navigateur pour activer',
  [lngKeys.ExternalEntityDescription]:
    'Boost Note va vous montrer du contenu externe tel que des issues Github, Google Docs, cartes Trello et plus encore. Que voudriez vous voir sur Boost Note?',
  [lngKeys.ExternalEntityRequest]: 'Laissez nous savoir vos demandes!',
  [lngKeys.CommunityFeedback]: 'Feedback',
  [lngKeys.CommunityFeatureRequests]: 'Demande de fonctionnalités',
  [lngKeys.CommunityFeedbackSubtitle]:
    'Voulez vous une fonctionnalité spécifique? Avez vous encontré un bug? Contactez nous',
  [lngKeys.CommunityBugReport]: 'Reporter un bug',
  [lngKeys.CommunityFeedbackSendError]:
    "Nous n'avons pas pu envoyer votre feedback",
  [lngKeys.CommunityFeedbackSendSuccess]:
    'Votre feedback est très apprécié. Merci de nous avoir contacté.',
  [lngKeys.CommunityFeedbackType]: 'Type de Feedback',
  [lngKeys.CommunityFeedbackFreeForm]: 'Formulaire libre',
  [lngKeys.ManageApi]: 'Ces jetons sont utilisables seulement pour {{space}}',
  [lngKeys.AccessTokens]: "Jeton d'accès",
  [lngKeys.GenerateToken]: 'Générer un jeton',
  [lngKeys.CreateTokens]: 'Créer un nouveau jeton',
  [lngKeys.TokensName]: 'Nom du jeton...',
  [lngKeys.TokensDocumentation]: "documentation pour l'API de Boost Note",
  [lngKeys.SettingsSubLimitTrialTitle]: 'Upgrade pour accès illimité',
  [lngKeys.SettingsSubLimitTrialDate]:
    "Votre essai gratuit du plan pro est actif jusqu'à: {{date}}",
  [lngKeys.SettingsSubLimitTrialUpgrade]:
    "Vous pouvez mettre à niveau à tout moment durant l'essai gratuit.",
  [lngKeys.SettingsSubLimitUsed]: '{{docsNb}} documents utilisés',
  [lngKeys.SettingsSubLimitTrialEnd]:
    'Votre essai gratuit a expiré. Veuillez mettre à niveau votre espace',
  [lngKeys.SettingsSubLimitUnderFreePlan]:
    "Sans abonnement, vous pouvez créer jusqu'à {{limit}} documents.",

  [lngKeys.PlanChoose]: 'Choisissez votre plan.',
  [lngKeys.PlanDiscountUntil]:
    'Vous allez recevoir une promotion si vous vous abonnez avant le ',
  [lngKeys.PlanDiscountDetail]: '{{off}}% OFF pour {{month}} mois',
  [lngKeys.PlanDiscountLabel]: 'promotion de {{month}} mois',
  [lngKeys.PlanDiscountCouponWarning]:
    "Utiliser un coupon de promotion vous empêchera de recevoir d'autres réductions",
  [lngKeys.PlanBusinessIntro]:
    'Pour les grandes entreprises ou pour ceux qui opèrent dans des industries sévèrement régulées, veuillez',
  [lngKeys.PlanBusinessLink]: 'contacter notre département de ventes',
  [lngKeys.PlanPerMember]: 'par membre',
  [lngKeys.PlanPerMonth]: 'par mois',
  [lngKeys.PlanFreePerk1]: 'Membres illimités',
  [lngKeys.PlanFreePerk2]: '{{docs}} documents par espace',
  [lngKeys.PlanStoragePerk]: '{{storageSize}} par membre',
  [lngKeys.PlanStandardPerk1]: '{{viewersSize}} observateurs sans frais',
  [lngKeys.PlanStandardPerk2]: 'Soutenir le dévelopement',
  [lngKeys.PlanStandardPerk3]: 'Documents illimités',
  [lngKeys.PlanStandardPerk4]:
    "Derniers {{days}} jours d'historique des révisions de vos documents",
  [lngKeys.PlanProPerk1]: 'Observateurs illimités sans frais',
  [lngKeys.PlanProPerk2]: "Mot de passe et date d'expiration lors de partage",
  [lngKeys.PlanProPerk3]:
    "Accès complet à l'historique des revisions de vos documents",
  [lngKeys.PlanTrial]: 'Essai gratuit de {{days}} jours',
  [lngKeys.PlanInTrial]: 'En essai gratuit ({{remaining}} left)',
  [lngKeys.UpgradeSubtitle]: 'Entrez et confirmez vos informations de paiement',
  [lngKeys.Viewers]: 'observateurs',
  [lngKeys.Month]: 'mois',
  [lngKeys.TotalMonthlyPrice]: 'Prix mensuel total',
  [lngKeys.PaymentMethod]: 'Méthode de paiement',
  [lngKeys.TrialWillBeStopped]: 'Votre essai gratuit va être stoppé',
  [lngKeys.ApplyCoupon]: 'Utiliser un coupon',
  [lngKeys.PromoCode]: 'Code promotionnel',
  [lngKeys.Subscribe]: "S'abonner",
  [lngKeys.UnlimitedViewers]: "Nombre illimité d'observateurs",
  [lngKeys.PaymentMethodJpy]:
    'Nous pouvons seulement accepter JPY(Japanese Yen) par les paiments effectués avec les cartes JCB.',

  [lngKeys.BillingActionRequired]:
    'Votre paiment peut demander une action de votre part!',
  [lngKeys.BillingHistory]: 'Historique de paiment',
  [lngKeys.BillingHistoryCheck]:
    'Veuillez vérifier votre historique de paiment pour gérer des charges non payées ou qui ont échouées.',
  [lngKeys.BillingCancelledAt]:
    'Votre abonnement va être annulé le {{date}} lors de la réception de votre dernière facture.',
  [lngKeys.BillingToCard]:
    'La carte se terminant en {{cardEnd}} va être chargée le {{date}}.',
  [lngKeys.BillingEditCard]: 'Changer la Carte',
  [lngKeys.BillingEmail]: "L'email de facturation est {{email}}",
  [lngKeys.BillingEditEmail]: "Changer l'email",
  [lngKeys.BillingCanSeeThe]: "Vous pouvez voir l' ",
  [lngKeys.BillingChangePlan]: 'Changez votre Plan',
  [lngKeys.BillingUpdateCard]: 'Mettre à jour votre carte de crédit',
  [lngKeys.BillingCurrentCard]: 'Carte de crédit courante',
  [lngKeys.BillingUpdateEmail]: 'Mettre à jour votre email de facturation',
  [lngKeys.BillingCurrentEmail]: 'Email courante',
  [lngKeys.BillingChangeJCB]:
    "Changer de carte lorsque l'une de ces cartes est JCB requiert l'annulation manuelle de votre abonnement actuel. Veuillez annuler votre abonnement et vous abonner de nouveau avec votre nouvelle carte.",
  [lngKeys.BillingApplyPromoWarning]:
    'Utiliser un code de promotion va annuler votre promotion actuelle.',
  [lngKeys.BillingApplyPromo]: 'Utiliser un coupon de promotion',

  [lngKeys.BillingChangePlanDiscountStop]:
    'Changer de plan va terminer votre promotion actuelle.',
  [lngKeys.BillingChangePlanStripeProration]:
    'Les changements de frais sont automatiquement gérés par Stripe et leur proration',
  [lngKeys.BillingChangePlanFreeDisclaimer]:
    'Vous allez immédiatement perdre accès à des fonctionnalités avancées tel que documents illimités, historique de révisions pour les documents, espace de stockage etc...',
  [lngKeys.BillingChangePlanProDisclaimer]:
    "Vous allez immédiatement gagner accès à des fonctionnalités avancées tel que l'accès complet à l'historique de révisions pour vos documents, choisir et installer des mots de passe ou des dates d'expiration pour vos documents partagés, nombre illimité d'observateurs etc...",
  [lngKeys.BillingChangePlanStandardDisclaimer]:
    "Vous allez immédiatement perdre accès à des fonctionnalités avancées tel que l'accès complet à l'historique de révisions pour vos documents, choisir et installer des mots de passe ou des dates d'expiration pour vos documents partagés, nombre illimité d'observateurs etc...",
  [lngKeys.DiscountModalTitle]:
    'Abonnez vous dès maintenant pour recevoir une promotion!',
  [lngKeys.DiscountModalAlreadySubscribed]: 'Vous êtes déjà abonné',
  [lngKeys.DiscountModalTimeRemaining]: 'Temps restant',
  [lngKeys.DiscountModalExpired]:
    "Vous n'êtes plus apte à recevoir cette promotion",
  [lngKeys.FreeTrialModalTitle]: 'Pro Plan: Essai gratuit',
  [lngKeys.FreeTrialModalBody]:
    'Vous allez pouvoir accéder à toutes les fonctionnalités du pro plan tel que documents illimités, historique de révisions etc... durant {{days}} jours.',
  [lngKeys.FreeTrialModalDisclaimer]:
    "Aucune information de paiement tel que carte de crédit etc... n'est nécessaire",
  [lngKeys.FreeTrialModalCTA]: "Commencer l'essai gratuit",

  [lngKeys.LogOut]: 'Se déconnecter',
  [lngKeys.CreateNewSpace]: 'Créer un nouvel espace',
  [lngKeys.DownloadDesktopApp]: "Télécharger l'application de bureau",

  [lngKeys.ToolbarTooltipsSpaces]: 'Espaces',
  [lngKeys.ToolbarTooltipsTree]: 'Navigation',
  [lngKeys.ToolbarTooltipsSearch]: 'Rechercher',
  [lngKeys.ToolbarTooltipsTimeline]: 'Chronologie',
  [lngKeys.ToolbarTooltipsDiscount]: 'Promotion pour nouveaux utilisateurs!',
  [lngKeys.ToolbarTooltipsImport]: 'Importer',
  [lngKeys.ToolbarTooltipsMembers]: 'Membres',
  [lngKeys.ToolbarTooltipsSettings]: 'Paramètres',

  //forms
  [lngKeys.FormSelectImage]: 'Choisissez une image',
  [lngKeys.FormChangeImage]: 'Changez votre image',
  [lngKeys.SupportGuide]: 'Support',
  [lngKeys.SendUsAMessage]: 'Contactez nous',
  [lngKeys.KeyboardShortcuts]: 'Raccourcis clavier',

  //Language
  [lngKeys.members]: 'membres',
  [lngKeys.Help]: 'Aide',
  [lngKeys.ProfilePicture]: 'Image de profil',
  [lngKeys.Name]: 'Nom',
  [lngKeys.Spaces]: 'espaces',
  [lngKeys.Tabs]: 'tabulations',
  [lngKeys.Logo]: 'Logo',
  [lngKeys.User]: 'Utilisateur',
  [lngKeys.Back]: 'Revenir',
  [lngKeys.Admin]: 'Admin',
  [lngKeys.Member]: 'Membre',
  [lngKeys.Viewer]: 'Observateur',
  [lngKeys.See]: 'Voir',
  [lngKeys.Copy]: 'Copier',
  [lngKeys.Copied]: 'Copié',
  [lngKeys.Send]: 'Envoyer',
  [lngKeys.SendMore]: 'Envoyer de nouveau',
  [lngKeys.Leave]: 'Quitter',
  [lngKeys.Remove]: 'Enlever',
  [lngKeys.Demote]: 'Rétrograder',
  [lngKeys.Promote]: 'Promouvoir',
  [lngKeys.Enable]: 'Activer',
  [lngKeys.Disable]: 'Désactiver',
  [lngKeys.Show]: 'Montrer',
  [lngKeys.Hide]: 'Cacher',
  [lngKeys.Save]: 'Sauvegarder',
  [lngKeys.Close]: 'Fermer',
  [lngKeys.ThisSpace]: 'cet espace',
  [lngKeys.Token]: 'Jeton',
  [lngKeys.Apply]: 'Appliquer',
  [lngKeys.Update]: 'Mettre à jour',
  [lngKeys.LearnMore]: 'En apprendre plus',
  [lngKeys.DoYouWishToProceed]: 'Désirez vous continuer?',
  [lngKeys.days]: 'jours',
  [lngKeys.hours]: 'heures',
  [lngKeys.minutes]: 'minutes',
  [lngKeys.seconds]: 'secondes',
}

export default {
  translation: frTranslation,
}
