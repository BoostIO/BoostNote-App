export default {
  translation: {
    //General
    'general.error': 'Errore',
    'general.cancel': 'Annulla',
    'general.attachments': 'Allegati',
    'general.archive': 'Archivio',
    'general.allNotess': 'Tutte le note',
    'general.signin': 'Accedi',
    'general.signOut': 'Disconnetti',
    'general.save': 'Salva',
    'general.default': 'Predefinito',
    'general.networkError': 'Errore di connessione',

    // Storage
    'storage.name': 'Nome Archivio',
    'storage.noStorage': 'Nessun archivio',
    'storage.create': 'Crea Archivio',
    'storage.edit': 'Modifica Archivio',
    'storage.rename': 'Rinomina Archivio',
    'storage.renameMessage': "Inserisci il nuovo nome per l'archivio",
    'storage.remove': 'Rimuovi Archivio',
    'storage.removeMessage':
      'Attenzione! Proseguendo verrano eliminate tutte le note contenute.',
    'storage.delete': 'Cancellazione archivio {{storage}}',
    'storage.move': 'Sposta Nota',
    'storage.moveTitle': 'Sposta la nota in un altro archivio',
    'storage.moveMessage':
      'Stai provando a spostare la nota in un altro archivio.',
    'storage.copy': 'Copia Nota',
    'storage.typeLocal': 'Locale',
    'storage.typeCloud': 'Cloud',
    'storage.needSignIn': 'Devi registrarti per creare un archivio nel cloud.',
    'storage.syncDate': 'Ultimo aggiornamento ',

    //Folder
    'folder.create': 'Nuova Cartella',
    'folder.rename': 'Rinomina Cartella',
    'folder.renameMessage':
      'Inserisci il nuovo nome della cartella, verrà aggiornato anche il percorso di ogni nota e sottocartella',
    'folder.renameErrorMessage': 'Non puoi rinominare la cartella',
    'folder.remove': 'Elimina Cartella',
    'folder.removeMessage': 'Tutte le note e sottocartelle sarnno eliminate.',

    //Tag
    'tag.tags': 'Labels',
    'tag.remove': 'Rimuovi Label',
    'tag.removeMessage': 'Il label verrà rimosso da tutte le note',

    //Note
    'note.duplicate': 'Duplica',
    'note.delete': 'Elimina',
    'note.delete2': 'Elimina nota',
    'note.deleteMessage': 'La nota verrà eliminata definitavamente',
    'note.empty': 'Nota vuota',
    'note.unselect': 'Nessuna nota selezionata',
    'note.search': 'Cerca note',
    'note.nothing': 'Nessuna nota',
    'note.nothingMessage': 'Nessuna nota è stata trovata.',
    'note.noTitle': 'Nessun titolo',
    'note.date': 'fa',
    'note.createKeyOr': 'o',
    'note.createKey': 'N',
    'note.createKeyMac': 'su Mac',
    'note.createKeyWinLin': 'su Windows/Linux',
    'note.createkeymessage1': 'per creare una nuova nota, premere',
    'note.createkeymessage2': 'Seleziona un archivio',
    'note.createkeymessage3': 'per creare una nuova nota',
    'note.restore': 'Ripristina',

    //Bookmark
    'bookmark.remove': 'Rimuovi Segnalibro',
    'bookmark.add': 'Segnalibro',

    //About
    'about.about': 'Info',
    'about.boostnoteDescription':
      "Un'app open source per prendere note realizzata per programmatori come te.",
    'about.website': 'Sito ufficiale',
    'about.boostWiki': 'Boost Note per Team',
    'about.platform': 'Multipiattaforma',
    'about.community': 'Comunità',
    'about.github': 'GitHub Repository',
    'about.bounty': 'Ricompense in IssueHunt',
    'about.blog': 'Blog',
    'about.slack': 'Gruppo Slack',
    'about.twitter': 'Twitter Account',
    'about.facebook': 'Gruppo Facebook',
    'about.reddit': 'Reddit',

    //Billing
    'billing.billing': 'Fatturazione',
    'billing.message': "Accedi per eseguire l'upgrade del tuo account.",
    'billing.basic': 'Base',
    'billing.current': 'Attuale',
    'billing.premium': 'Premium',
    'billing.price': '$3/Mese (USD) *',
    'billing.browser': 'Applicazione Web',
    'billing.desktop': 'Applicazione Desktop (Mac/Windows/Linux)',
    'billing.mobile': 'Applicazione per Smartphone (iOS/Android)',
    'billing.sync': 'Sicronizzazione tra più dispositivi',
    'billing.local': 'Archiviazione Locale',
    'billing.cloud': 'Archiviazione in Cloud',
    'billing.storageSize': 'Spazio archiviazione in Cloud',
    'billing.addStorageDescription':
      '* Se hai bisogno di più spazio di memoria in cloud, puoi aggiungerlo in qualsiasi momento pagando $5 (USD) per ogni 5 GB. Clicca il pulsante "Aumenta spazio di archiviazione" situato qui in basso',
    'billing.addStorage': 'Aumenta spazio di archiviazione',

    // Preferences
    'preferences.general': 'Preferenze',

    // Preferences GeneralTab
    'preferences.account': 'Account',
    'preferences.addAccount': 'Accedi',
    'preferences.loginWorking': 'Accesso in corso...',
    'preferences.interfaceLanguage': 'Lingua Interfaccia',
    'preferences.applicationTheme': 'Tema Applicazione',
    'preferences.auto': 'Auto',
    'preferences.light': 'Chiaro',
    'preferences.dark': 'Scuro',
    'preferences.sepia': 'Seppia',
    'preferences.solarizedDark': 'Solarized Scuro',
    'preferences.noteSorting': 'Ordinamento Note',
    'preferences.dateUpdated': 'Data di aggiornamento',
    'preferences.dateCreated': 'Data di creazione',
    'preferences.title': 'Titolo',
    'preferences.analytics': 'Analytics',
    'preferences.analyticsDescription1':
      "Boost Note raccoglie dati anonimi con il solo fine di migliorare l'applciazione, e in alcun caso non raccoglie informazioni personali come ad esempio il contenuto delle tue note. Puoi vedere il suo funzionamento su GitHub.",
    'preferences.analyticsDescription2':
      'Puoi decidere di abilitare e disabilitare questa opzione.',
    'preferences.analyticsLabel':
      'Abilita analytics per aiutare a migliorare Boost Note',
    'preferences.displayTutorialsLabel': 'Tutorial e FAQ',

    // Preferences EditorTab
    'preferences.editorTheme': 'Tema Editor',
    'preferences.editorFontSize': 'Dimensione Font Editor',
    'preferences.editorFontFamily': 'Font-Family Editor',
    'preferences.editorIndentType': 'Tipo di indentazione Editor',
    'preferences.tab': 'Tab',
    'preferences.spaces': 'Spazi',
    'preferences.editorIndentSize': 'Dimensione indentazione',
    'preferences.editorKeymap': 'Keymap Editor',
    'preferences.editorPreview': 'Anteprima Editor',

    // Preferences MarkdownTab
    'preferences.previewStyle': 'Stile Anteprima',
    'preferences.markdownCodeBlockTheme': 'Tema blocco codice',
    'preferences.defaultTheme': 'Usa lo stile predefinito',
    'preferences.markdownPreview': 'Anteprima Markdown',
  },
}
