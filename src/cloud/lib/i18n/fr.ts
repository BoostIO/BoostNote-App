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
  [lngKeys.GeneralTemplates]: 'Templates',
  [lngKeys.GeneralTitle]: 'Titre',
  [lngKeys.GeneralUse]: 'Utiliser',
  [lngKeys.GeneralChangeIcon]: "Changer l'icône",
  [lngKeys.GeneralFolders]: 'Dossiers',
  [lngKeys.GeneralShowMore]: 'En montrer plus',

  // settings
  [lngKeys.SettingsInfo]: 'Mon Profile',
  [lngKeys.SettingsGeneral]: 'Mes Préférences',
  [lngKeys.SettingsNotifications]: 'Notifications par mail',
  [lngKeys.SettingsTeamInfo]: 'Paramètres',
  [lngKeys.SettingsTitle]: 'Paramètres',
  [lngKeys.SettingsPersonalInfo]: 'Paramètres',
  [lngKeys.SettingsPreferences]: 'Préférences',
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
  [lngKeys.SettingsEditorFontSize]: "Taille de la police de l'éditeur",
  [lngKeys.SettingsEditorFontFamily]: "Famille de polices de l'éditeur",
  [lngKeys.SettingsLight]: 'Clair',
  [lngKeys.SettingsDark]: 'Sombre',
  [lngKeys.SettingsNotifFrequencies]: 'Fréquence de mises à jour par mail',
  [lngKeys.SettingsIndentType]: "Type d'indentation pour l'éditeur",
  [lngKeys.SettingsShowEditorToolbar]: "Barre d'outils de l'éditeur",
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
  [lngKeys.InviteAddWithLink]: 'Inviter avec un lien ouvert',
  [lngKeys.InviteEmail]: 'Inviter par email',
  [lngKeys.InviteByEmailMore]: 'Ajouter un nouveau membre',
  [lngKeys.InviteFailError]:
    "L'invitation a échoué en raison de données incorrectes. Veuillez fournir une adresse e-mail et un rôle valides.",
  [lngKeys.InviteRoleDetails]: 'Cliquez pour voir les détails de rôle.',
  [lngKeys.RoleMemberDescription]:
    "Les membres peuvent accéder à toutes les fonctionnalités excepté pour la facturation ainsi que la gestion de l'équipe.",
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
  [lngKeys.PlanFreePerk1]: 'Observateurs illimités',
  [lngKeys.PlanFreePerk2]: '1 Membre',
  [lngKeys.PlanFreePerk3]: 'Documents illimités',
  [lngKeys.PlanStoragePerk]: '{{storageSize}} par membre',
  [lngKeys.PlanStandardPerk1]: 'Membres illimités',
  [lngKeys.PlanStandardPerk2]: 'Soutenir le dévelopement',
  [lngKeys.PlanStandardPerk3]:
    "Derniers {{days}} jours d'historique des révisions de vos documents",
  [lngKeys.PlanProPerk3]: 'Prioritée lors de demande de support',
  [lngKeys.PlanProPerk1]: "Mot de passe et date d'expiration lors de partage",
  [lngKeys.PlanProPerk2]:
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
  [lngKeys.ToolbarTooltipsDiscount]: 'Promotion pour nouveaux utilisateurs!',

  [lngKeys.RenameFolder]: 'Renommer le dossier',
  [lngKeys.RenameDoc]: 'Renommer le document',
  [lngKeys.ModalsCreateNewFolder]: 'Créer un nouveau dossier',
  [lngKeys.ModalsCreateNewDocument]: 'Créer un nouveau document',

  [lngKeys.ModalsDeleteWorkspaceTitle]: 'Supprimer le dossier',
  [lngKeys.ModalsDeleteWorkspaceDisclaimer]:
    'Êtes vous certain de vouloir supprimer ce dossier? Ses sous-dossiers et documents seront supprimés. Cette action est irréversible.',

  [lngKeys.ModalsDeleteDocFolderTitle]: 'Supprimer {{label}}',
  [lngKeys.ModalsDeleteDocDisclaimer]:
    'Êtes vous certain de vouloir supprimer ce document? Cette action est irréversible.',
  [lngKeys.ModalsDeleteFolderDisclaimer]:
    'Êtes vous certain de vouloir supprimer ce dossier et ses documents? Cette action est irréversible.',

  [lngKeys.ModalsWorkspaceCreateTitle]: 'Créer un dossier',
  [lngKeys.ModalsWorkspaceEditTitle]: 'Editer le dossier',

  [lngKeys.ModalsWorkspaceMakePrivate]: 'Privatiser',
  [lngKeys.ModalsWorkspaceAccess]: 'Accès',
  [lngKeys.ModalsWorkspaceDefaultDisclaimer]:
    'Ce dossier par défaut est publique et ne peut avoir son accès modifié.',
  [lngKeys.ModalsWorkspacePublicDisclaimer]:
    "Cet dossier est publique. Tout membre de l'équipe peut y accéder.",
  [lngKeys.ModalsWorkspacePrivateDisclaimer]: 'Cet dossier est privé.',
  [lngKeys.ModalsWorkspacePrivateOwner]:
    "Vous pouvez gérer l'accès des différents membres ci-dessous.",

  [lngKeys.ModalsWorkspaceSetAccess]: "Modifier l'accès",
  [lngKeys.ModalsWorkspacesSetAccessMembers]: 'Ajouter des membres',
  [lngKeys.GeneralOwner]: 'Propriétaire',
  [lngKeys.GeneralAddVerb]: 'Ajouter',
  [lngKeys.GeneralSelectAll]: 'Tout selectionner',
  [lngKeys.ModalsWorkspacesWhoHasAcess]: 'Qui a accès',
  [lngKeys.ModalsWorkspacesNonOwnerDisclaimer]:
    'Seul le propriétaire du dossier peut modifier son accès.',

  [lngKeys.ModalsImportDestinationTitle]: 'Choisissez un dossier',
  [lngKeys.ModalsImportDestinationDisclaimer]:
    'Choisissez le dossier dans lequel vous voulez importer vos fichiers',
  [lngKeys.ModalsImportDisclaimer]:
    'Choissisez la méthode par laquelle vous souhaitez importer vos documents ( 5Mb max par fichier )',

  [lngKeys.ModalsSmartFolderCreateTitle]: 'Créer un dossier intelligent',
  [lngKeys.ModalsSmartFolderEditTitle]: 'Editer un dossier intelligent',
  [lngKeys.ModalsSmartFolderPrivateDisclaimer]:
    'Ce dossier intelligent va devenir privé. Seulement vous pourrez le voir.',
  [lngKeys.ModalsSmartFolderPublicDisclaimer]:
    'Ce dossier intelligent va devenir publique. Tous les membres pourront le voir.',

  [lngKeys.AttachmentsDeleteDisclaimer]:
    'Êtes vous certain de vouloir supprimer ce fichier? Il ne sera plus visible dans les documents où il a été inclus.',
  [lngKeys.AttachmentsLimitDisclaimer]: '{{current}} sur {{limit}} utilisé.',
  [lngKeys.AttachmentsPlanUpgradeDisclaimer]:
    "Si vous voulez plus d'espace de stockage, veuillez ",
  [lngKeys.AttachmentsUpgradeLink]: 'upgrader votre plan.',

  [lngKeys.EditorToolbarTooltipHeader]: 'Ajouter un entête',
  [lngKeys.EditorToolbarTooltipAdmonition]: 'Ajouter une admonition',
  [lngKeys.EditorToolbarTooltipCodefence]: 'Insérér une codefence',
  [lngKeys.EditorToolbarTooltipQuote]: 'Insérer une citation',
  [lngKeys.EditorToolbarTooltipList]: 'Insérér une liste à puces',
  [lngKeys.EditorToolbarTooltipNumberedList]: 'Insérér une liste numérique',
  [lngKeys.EditorToolbarTooltipTaskList]: 'Insérer une liste de tâches',
  [lngKeys.EditorToolbarTooltipBold]: 'Ajouter un texte en gras',
  [lngKeys.EditorToolbarTooltipItalic]: 'Ajouter un texte en italique',
  [lngKeys.EditorToolbarTooltipCode]: 'Insérer du code',
  [lngKeys.EditorToolbarTooltipLink]: 'Ajouter un lien',
  [lngKeys.EditorToolbarTooltipUpload]: 'Envoyer une image',
  [lngKeys.EditorToolbarTooltipTemplate]: 'Utiliser un template',
  [lngKeys.EditorToolbarTooltipScrollSyncEnable]:
    'Activer le défilement synchronisé',
  [lngKeys.EditorToolbarTooltipScrollSyncDisable]:
    'Désactiver le défilement synchronisé',

  [lngKeys.EditorReconnectAttempt]: 'Connexion...',
  [lngKeys.EditorReconnectAttempt1]: 'Nous essayons de vous reconnecter.',
  [lngKeys.EditorReconnectAttempt2]:
    "Les changements ne seront pas synchronisés avec le serveur jusqu'à la reconnection.",
  [lngKeys.EditorReconnectDisconnected]: 'Se reconnecter',
  [lngKeys.EditorReconnectDisconnected1]: 'Essayez de vous reconnecter.',
  [lngKeys.EditorReconnectDisconnected2]:
    "Les changements ne seront pas synchronisés avec le serveur jusqu'à la reconnection.",
  [lngKeys.EditorReconnectSyncing]: 'Synchronisation...',
  [lngKeys.EditorReconnectSyncing1]: 'Synchronisation avec le cloud.',
  [lngKeys.EditorReconnectSyncing2]:
    'Vérification des changements et mise à jour en temps réel du document.',

  //forms
  [lngKeys.GeneralSource]: 'Origine',
  [lngKeys.GeneralDestination]: 'Destination',
  [lngKeys.GeneralPrevious]: 'Précédent',
  [lngKeys.GeneralNext]: 'Suivant',
  [lngKeys.GeneralContinueVerb]: 'Continuer',
  [lngKeys.GeneralMembers]: 'Membres',
  [lngKeys.FormSelectImage]: 'Choisissez une image',
  [lngKeys.FormChangeImage]: 'Changez votre image',
  [lngKeys.SupportGuide]: 'Support',
  [lngKeys.SendUsAMessage]: 'Contactez nous',
  [lngKeys.KeyboardShortcuts]: 'Raccourcis clavier',

  [lngKeys.FolderNamePlaceholder]: 'Nom du dossier...',
  [lngKeys.DocTitlePlaceholder]: 'Titre du document...',

  [lngKeys.SortLastUpdated]: 'Du plus récent',
  [lngKeys.SortTitleAZ]: 'Titre de A à Z',
  [lngKeys.SortTitleZA]: 'Titre de Z à A',
  [lngKeys.SortDragAndDrop]: 'Glisser/Déposer',
  [lngKeys.CreateNewDoc]: 'Créer un nouveau doc',
  [lngKeys.UseATemplate]: "A partir d'un template",

  [lngKeys.DocSaveAsTemplate]: 'Enregistrer comme template',
  [lngKeys.DocExportPdf]: 'Exporter (PDF)',
  [lngKeys.DocExportMarkdown]: 'Exporter (Markdown)',
  [lngKeys.DocExportHtml]: 'Exporter (HTML)',
  [lngKeys.OpenInBrowser]: 'Ouvrir dans le navigateur',
  [lngKeys.GeneralPickYourDestination]: 'Choisissez la destination',

  [lngKeys.FolderInfo]: 'Info du dossier',
  [lngKeys.DocInfo]: 'Info du document',
  [lngKeys.Assignees]: 'Assigné à',
  [lngKeys.Unassigned]: 'Non assigné',
  [lngKeys.DueDate]: 'Date butoir',
  [lngKeys.AddDueDate]: 'Ajouter une date butoir',
  [lngKeys.AddALabel]: 'Ajouter un label',
  [lngKeys.NoStatus]: 'Pas de status',
  [lngKeys.CreationDate]: 'Création',
  [lngKeys.UpdateDate]: 'Mis à jour',
  [lngKeys.CreatedBy]: 'Créé par',
  [lngKeys.UpdatedBy]: 'Mis à jour par',
  [lngKeys.Contributors]: 'Contributeurs',
  [lngKeys.History]: 'Historique',
  [lngKeys.Share]: 'Partager',
  [lngKeys.PublicSharing]: 'Partage publique',
  [lngKeys.PublicSharingDisclaimer]:
    'Toute personne avec accès à ce lien peut lire',
  [lngKeys.SharingSettings]: 'Paramètres de partage',
  [lngKeys.SharingRegenerateLink]: 'Regénérer le lien',
  [lngKeys.Regenerate]: 'regénérer',
  [lngKeys.PasswordProtect]: 'Protection par mot de passe',
  [lngKeys.ExpirationDate]: "Date d'expiration",
  [lngKeys.SeeFullHistory]: "Voir l'historique complet",
  [lngKeys.SeeLimitedHistory]: 'Voir les {{days}} derniers jours',
  [lngKeys.ThreadsTitle]: 'Fils de discussions',
  [lngKeys.ThreadPost]: 'Envoyer',
  [lngKeys.ThreadFullDocLabel]: 'Entièreté du document',
  [lngKeys.ThreadCreate]: 'Créer un nouveau fil',
  [lngKeys.ThreadOpen]: 'Ouvert',
  [lngKeys.ThreadClosed]: 'Fermé',
  [lngKeys.ThreadOutdated]: 'Obsolète',
  [lngKeys.ThreadReopen]: 'Ré-ouvrir',
  [lngKeys.ThreadReplies]: '{{count}} réponses',
  [lngKeys.ModalsTemplatesDeleteDisclaimer]: `Êtes vous sûr de vouloir supprimer template?`,
  [lngKeys.ModalsTemplatesSearchEmpty]: "Aucun template n'a pu être trouvé",
  [lngKeys.ModalsTemplatesSelectTemplate]: 'Sélectionnez un template',
  [lngKeys.ModalsTemplatesUseInDoc]: 'Utiliser dans le document',

  //Language
  [lngKeys.GeneralAll]: 'Tout',
  [lngKeys.GeneralAny]: "N'importe lequel",
  [lngKeys.GeneralSelectVerb]: 'Sélectionner',
  [lngKeys.GeneralOpenVerb]: 'Ouvrir',
  [lngKeys.GeneralCopyTheLink]: 'Copier le lien',
  [lngKeys.GeneralMoveVerb]: 'Déplacer',
  [lngKeys.GeneralShared]: 'Partagé',
  [lngKeys.GeneralRenameVerb]: 'Renommer',
  [lngKeys.GeneralEditVerb]: 'Editer',
  [lngKeys.GeneralSmartFolders]: 'Dossiers intelligents',
  [lngKeys.GeneralBookmarks]: 'Favoris',
  [lngKeys.GeneralUnbookmarkVerb]: 'Retirer des favoris',
  [lngKeys.GeneralBookmarkVerb]: 'Ajouter aux favoris',
  [lngKeys.GeneralWorkspaces]: 'Espaces de travail',
  [lngKeys.GeneralPrivate]: 'Privé',
  [lngKeys.GeneralLabels]: 'Labels',
  [lngKeys.GeneralMore]: 'Plus',
  [lngKeys.GeneralStatus]: 'Statut',
  [lngKeys.GeneralSettings]: 'Paramètres',
  [lngKeys.GeneralSearchVerb]: 'Rechercher',
  [lngKeys.GeneralTimeline]: 'Chronologie',
  [lngKeys.GeneralImport]: 'Importer',
  [lngKeys.GeneralHelp]: 'Aide',
  [lngKeys.GeneralProfilePicture]: 'Image de profil',
  [lngKeys.GeneralName]: 'Nom',
  [lngKeys.GeneralSpaces]: 'espaces',
  [lngKeys.GeneralTabs]: 'tabulations',
  [lngKeys.GeneralLogo]: 'Logo',
  [lngKeys.GeneralUser]: 'Utilisateur',
  [lngKeys.GeneralBack]: 'Revenir',
  [lngKeys.GeneralAdmin]: 'Admin',
  [lngKeys.GeneralMember]: 'Membre',
  [lngKeys.GeneralViewer]: 'Observateur',
  [lngKeys.GeneralSeeVerb]: 'Voir',
  [lngKeys.GeneralCopyVerb]: 'Copier',
  [lngKeys.GeneralCopied]: 'Copié',
  [lngKeys.GeneralSendVerb]: 'Envoyer',
  [lngKeys.GeneralSendMore]: 'Envoyer de nouveau',
  [lngKeys.GeneralLeaveVerb]: 'Quitter',
  [lngKeys.GeneralRemoveVerb]: 'Enlever',
  [lngKeys.GeneralDemoteVerb]: 'Rétrograder',
  [lngKeys.GeneralPromoteVerb]: 'Promouvoir',
  [lngKeys.GeneralEnableVerb]: 'Activer',
  [lngKeys.GeneralDisableVerb]: 'Désactiver',
  [lngKeys.GeneralShowVerb]: 'Montrer',
  [lngKeys.GeneralHideVerb]: 'Cacher',
  [lngKeys.GeneralSaveVerb]: 'Sauvegarder',
  [lngKeys.GeneralCloseVerb]: 'Fermer',
  [lngKeys.GeneralThisSpace]: 'cet espace',
  [lngKeys.GeneralToken]: 'Jeton',
  [lngKeys.GeneralApplyVerb]: 'Appliquer',
  [lngKeys.GeneralUpdateVerb]: 'Mettre à jour',
  [lngKeys.GeneralLearnMore]: 'En apprendre plus',
  [lngKeys.GeneralDoYouWishToProceed]: 'Désirez vous continuer?',
  [lngKeys.GeneralDays]: 'jours',
  [lngKeys.GeneralHours]: 'heures',
  [lngKeys.GeneralMinutes]: 'minutes',
  [lngKeys.GeneralSeconds]: 'secondes',
  [lngKeys.GeneralOrdering]: 'Ordre',
  [lngKeys.SidebarViewOptions]: "Options d'affichage",
  [lngKeys.SidebarSettingsAndMembers]: 'Paramètres & Membres',
  [lngKeys.GeneralInbox]: 'Boîte de réception',
  [lngKeys.SidebarNewUserDiscount]: 'Promotion pour nouvel utilisateur!',
  [lngKeys.SettingsImportDescription]:
    'Plutôt que démarrer à partir de rien, importez vos fichiers directement dans Boost Note en sélectionnant une des options ci-dessous.',
  [lngKeys.GeneralPassword]: 'Mot de passe',

  [lngKeys.CooperateTitle]: 'Créez un nouvel espace',
  [lngKeys.CooperateSubtitle]: 'Veuillez configurer votre nouvel espace',
  [lngKeys.PictureAdd]: 'Ajouter une image',
  [lngKeys.PictureChange]: "Changer l'image",
  [lngKeys.SpaceIntent]: 'Dans quel but allez vous utiliser cet espace?',
  [lngKeys.SpaceIntentPersonal]: 'Pour mon propre usage',
  [lngKeys.SpaceIntentTeam]: 'Pour collaborer avec mon équipe',
  [lngKeys.PlanViewersMembersIntro]:
    'Quelle est la différence entre un membre et un observateur? Veuillez lire',
  [lngKeys.PlanViewersMembersLink]: 'cet article',
  [lngKeys.SeeRoleDetails]: 'Voir les détails concernant les rôles',
  [lngKeys.ViewerDisclaimerIntro]:
    'Veuillez demander à votre administrateur de vous donner un',
  [lngKeys.ViewerDisclaimerOutro]: 'afin que vous puissiez éditer ce document',
  [lngKeys.MemberRole]: 'Rôle de membre',

  [lngKeys.DiscountModalTitle]:
    'Invitez {{membersNb}} personnes pour recevoir une promotion!',
  [lngKeys.DiscountModalAlreadySubscribed]: 'Vous êtes déjà abonné',
  [lngKeys.DiscountModalTimeRemaining]: 'Temps restant',
  [lngKeys.DiscountModalExpired]:
    "Vous n'êtes plus apte à recevoir cette promotion",
  [lngKeys.GeneralInvite]: 'Inviter',
  [lngKeys.SettingsRolesRestrictedTitle]: 'Ce rôle est restraint',
  [lngKeys.SettingsRolesRestrictedDescription]:
    "Afin de promouvoir l'utilisateur à ce rôle, votre espace doit posséder un abonnement actif. Veuillez considérer upgrader votre plan.",
  [lngKeys.GeneralDocuments]: 'Documents',
  [lngKeys.RequestSent]: 'Demande envoyée',
  [lngKeys.RequestAskMemberRole]: 'Demander le rôle du membre',
  [lngKeys.UploadLimit]: 'La taille limite des fichiers est {{sizeInMb}}Mo',

  [lngKeys.OnboardingFolderSectionTitle]: 'Bienvenue sur Boost Note!',
  [lngKeys.OnboardingFolderSectionDisclaimer]:
    'Invitez vos coéquipiers dans cet espace',
  [lngKeys.GeneralContent]: 'Contenu',
  [lngKeys.CreateNewCanvas]: 'Créer un nouveau Canvas (beta)',
}

export default {
  translation: frTranslation,
}
