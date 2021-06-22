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
    "Les observateurs peuvent seulement naviger dans les différents dossiers ou documents, écrire des commentaires ou inviter d'autres observateurs dans l'équipe.",
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

  //forms
  [lngKeys.FormSelectImage]: 'Choisissez une image',
  [lngKeys.FormChangeImage]: 'Changez votre image',
  [lngKeys.SupportGuide]: 'Support',
  [lngKeys.SendUsAMessage]: 'Contacte nous',
  [lngKeys.KeyboardShortcuts]: 'Raccourcis clavier',

  //Language
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
}

export default {
  translation: frTranslation,
}
