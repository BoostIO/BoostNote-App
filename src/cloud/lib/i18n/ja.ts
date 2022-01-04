import { lngKeys, TranslationSource } from './types'

const jpTranslation: TranslationSource = {
  //General
  [lngKeys.GeneralError]: 'エラー',
  [lngKeys.GeneralCreate]: '作成',
  [lngKeys.GeneralCancel]: 'キャンセル',
  [lngKeys.GeneralUpdate]: '更新',
  [lngKeys.GeneralAttachments]: '添付ファイル',
  [lngKeys.GeneralArchive]: 'アーカイブ',
  [lngKeys.GeneralSignin]: 'サインイン',
  [lngKeys.GeneralSigningIn]: 'サインインしています',
  [lngKeys.GeneralSignout]: 'ログアウト',
  [lngKeys.GeneralSave]: '保存',
  [lngKeys.GeneralDefault]: 'デフォルト',
  [lngKeys.GeneralDelete]: '削除',
  [lngKeys.GeneralDaily]: '毎日',
  [lngKeys.GeneralWeekly]: '毎週',
  [lngKeys.GeneralNever]: '受け取らない',
  [lngKeys.GeneralTemplates]: 'テンプレート',
  [lngKeys.GeneralTitle]: 'タイトル',
  [lngKeys.GeneralUse]: '利用',
  [lngKeys.GeneralChangeIcon]: 'アイコン変更',
  [lngKeys.GeneralFolders]: 'フォルダー',
  [lngKeys.GeneralShowMore]: 'もっと見る',
  [lngKeys.GeneralDashboard]: 'Dashboard',
  // settings
  [lngKeys.SettingsPreferencesResetTitle]: 'Reset Preferences',
  [lngKeys.SettingsPreferencesResetLabel]: 'Use Default Preferences',
  [lngKeys.SettingsInfo]: 'プロフィール',
  [lngKeys.SettingsGeneral]: '設定',
  [lngKeys.SettingsNotifications]: 'メール通知',
  [lngKeys.SettingsTeamInfo]: '設定',
  [lngKeys.SettingsTitle]: '設定',
  [lngKeys.SettingsPersonalInfo]: '設定',
  [lngKeys.SettingsMarkdownPreview]: 'マークダウン',
  [lngKeys.SettingsMarkdownPreviewShowcase]: 'マークダウンスタイルのプレビュー',
  [lngKeys.SettingsMarkdownPreviewCodeBlockTheme]: 'コードブロックのテーマ',
  [lngKeys.SettingsMarkdownPreviewStyleTitle]: 'Pプレビュースタイル',
  [lngKeys.SettingsMarkdownPreviewStyleResetLabel]:
    'デフォルトのスタイルを使用',
  [lngKeys.SettingsPreferences]: 'カスタマイズ',
  [lngKeys.SettingsTeamUpgrade]: 'アップグレード',
  [lngKeys.SettingsTeamSubscription]: '請求',
  [lngKeys.SettingsIntegrations]: '連携',
  [lngKeys.SettingsAppFeedback]: 'フィードバック',
  [lngKeys.SettingsSpace]: 'スペース',
  [lngKeys.SettingsSpaceDelete]: 'このスペースを削除する',
  [lngKeys.SettingsSpaceDeleteWarning]:
    'スペースを削除するとデータが削除され、復元することができません。',
  [lngKeys.SettingsAccount]: 'アカウント',
  [lngKeys.SettingsAccountDelete]: 'アカウント削除',
  [lngKeys.SettingsAccountDeleteWarning]:
    'スペースを削除するとデータが削除され、復元することができません。',
  [lngKeys.SettingsUILanguage]: 'インターフェースの言語',
  [lngKeys.SettingsApplicationTheme]: 'アプリケーションテーマ',
  [lngKeys.SettingsEditorTheme]: 'エディタテーマ',
  [lngKeys.SettingsCodeBlockTheme]: 'コードブロックテーマ',
  [lngKeys.SettingsEditorKeyMap]: 'エディタのキーマップ',
  [lngKeys.SettingsEditorFontSize]: 'エディタのフォントサイズ',
  [lngKeys.SettingsEditorFontFamily]: 'エディタフォントファミリ',
  [lngKeys.SettingsLight]: 'ライト',
  [lngKeys.SettingsDark]: 'ダーク',
  [lngKeys.SettingsNotifFrequencies]: 'メール設定',
  [lngKeys.SettingsIndentType]: 'エディタインデントの種類',
  [lngKeys.SettingsShowEditorToolbar]: 'エディターツールバー',
  [lngKeys.SettingsShowEditorLineNumbers]: 'エディタの行番号',
  [lngKeys.SettingsEnableEditorSpellcheck]: 'スペルチェックエディタ',
  [lngKeys.SettingsIndentSize]: 'エディタインデントのサイズ',
  [lngKeys.SettingsUserForum]: 'ユーザーフォーラム（New!!）',
  [lngKeys.ManagePreferences]: 'あなた好みにカスタマイズしましょう。',
  [lngKeys.ManagePreferencesMarkdownPreview]:
    'Markdownプレビュー設定を管理します。',
  [lngKeys.ManageProfile]: 'Boost Noteでのプロフィールを編集しましょう。',
  [lngKeys.ManageSpaceSettings]: 'Space情報を編集しましょう。',
  [lngKeys.ManageTeamMembers]: 'このスペースへのアクセス権限を管理しましょう。',
  [lngKeys.ManageIntegrations]:
    '外部ツールの情報とBoost Noteのドキュメントを連携させましょう。',
  [lngKeys.CurrentMembers]: '現在のメンバー',
  [lngKeys.MembersAccessLevel]: 'アクセス権限',
  [lngKeys.AddMembers]: 'メンバー追加',
  [lngKeys.TeamCreate]: 'チームスペース作成',
  [lngKeys.TeamCreateSubtitle]:
    'メンバーを招待するために、チームスペースを作成しましょう。',
  [lngKeys.TeamName]: 'チーム名',
  [lngKeys.TeamDomain]: 'チームドメイン',
  [lngKeys.SpaceName]: 'スペース名',
  [lngKeys.SpaceDomain]: 'スペースドメイン',
  [lngKeys.TeamDomainShow]: 'Urlはこのようになります：',
  [lngKeys.TeamDomainWarning]: '注意：設定後Urlを変更することはできません。',
  [lngKeys.InviteAddWithLink]: 'リンクでメンバー招待',
  [lngKeys.InviteEmail]: 'メールでメンバー招待',
  [lngKeys.InviteByEmailMore]: '別のチームメンバーを追加する',
  [lngKeys.InviteMembersDocAssignButton]: 'メンバーに割り当てを依頼する',
  [lngKeys.InviteFailError]:
    'メールデータが正しくないため、招待に失敗しました。有効なメールアドレスと役割を入力してください。',
  [lngKeys.InviteRoleDetails]: 'クリックして役割の詳細を表示します。',
  [lngKeys.RoleMemberDescription]:
    'Member権限のユーザーは「チーム設定」「請求」以外の全ての機能にアクセスすることが出来ます。',
  [lngKeys.RoleAdminDescription]:
    'Admin権限のユーザーは全ての機能にアクセスすることが出来ます。',
  [lngKeys.RoleViewerDescription]:
    'Viewers権限のユーザーはドキュメントやフォルダーーの作成や編集をすることはできませんが、コメントをすることは可能です。',
  [lngKeys.CancelInvite]: '招待をキャンセルしますか？',
  [lngKeys.CancelInviteOpenLinkMessage]:
    '招待をキャンセルしますか？現在のリンクは廃止されます。',
  [lngKeys.CancelInviteEmailMessage]:
    'この招待をキャンセルしますか？そのユーザーはもうチームに参加することはできません。',
  [lngKeys.RoleAdminPromote]:
    '{{user}}の権限をAdminに変更します。Admin権限は全ての機能にアクセスすることが可能です。',
  [lngKeys.RoleMemberChange]:
    '{{user}}の権限をMemberに変更します。Member権限のユーザーは課金にカウントされるため、サブスクリプションが加算されます。Member権限のユーザーは「チーム設定」「請求」以外の全ての機能にアクセスすることが出来ます。',
  [lngKeys.RoleViewerDemote]:
    '{{user}}の権限をViewerに変更します。Viewer権限のユーザーは課金にカウントされないため、サブスクリプションから引かれます。Viewers権限のユーザーはドキュメントやフォルダーーの作成や編集をすることはできませんが、コメントをすることは可能です。',
  [lngKeys.TeamLeave]: 'チームから離脱する',
  [lngKeys.TeamLeaveWarning]:
    'Boost Note内の情報にアクセスすることが出来なくなりますが、チームから離脱しますか？最後のメンバーはチームを削除する必要があります。',
  [lngKeys.RemovingMember]: 'メンバーを削除する',
  [lngKeys.RemovingMemberWarning]: '{{user}}をチームから削除しますか？',
  [lngKeys.ExternalEntity]: '外部エンティティ',
  [lngKeys.ExternalEntityOpenInBrowser]: 'ブラウザ内で開くのを有効にする',
  [lngKeys.ExternalEntityDescription]:
    'GitHubやTrello、Google Docs等の外部情報をBoost Note内で閲覧可能になります。どのような連携が必要か教えていただけませんか？',
  [lngKeys.ExternalEntityRequest]: 'あなたのリクエストを教えてください！',
  [lngKeys.CommunityFeedback]: 'フィードバック',
  [lngKeys.CommunityFeatureRequests]: '機能リクエスト',
  [lngKeys.CommunityFeedbackSubtitle]:
    '機能リクエストやバグを見つけましたか？是非教えてください！',
  [lngKeys.CommunityBugReport]: 'バグ報告',
  [lngKeys.CommunityFeedbackSendError]:
    'フィードバックを送ることが出来ませんでした。',
  [lngKeys.CommunityFeedbackSendSuccess]:
    'フィードバックをお送りいただきありがとうございます！是非今後も気軽にお送りくださいね。',
  [lngKeys.CommunityFeedbackType]: 'フィードバックの種類',
  [lngKeys.CommunityFeedbackFreeForm]: 'フリーフォーム',
  [lngKeys.ManageApi]: 'これらのトークンは{{space}}でのみ利用可能です。',
  [lngKeys.AccessTokens]: 'アクセストークン',
  [lngKeys.GenerateToken]: 'トークン生成',
  [lngKeys.CreateTokens]: '新しいトークンを作る',
  [lngKeys.TokensName]: 'トークンの名前',
  [lngKeys.TokensDocumentation]: 'Boost Note APIのドキュメント',

  [lngKeys.FormSelectImage]: '画像を選択する',
  [lngKeys.FormChangeImage]: '画像を変更する',
  [lngKeys.SupportGuide]: 'サポートガイド',
  [lngKeys.SendUsAMessage]: 'メッセージを送る',
  [lngKeys.KeyboardShortcuts]: 'キーボードショートカット',

  [lngKeys.SettingsSubLimitTrialTitle]: '無制限にアップグレードする',
  [lngKeys.SettingsSubLimitTrialDate]:
    'あなたのスペースのトライアルは{{date}}で終了します。',
  [lngKeys.SettingsSubLimitTrialUpgrade]:
    'トライアル中、いつでもStandardかProプランにアップグレードすることが可能です。',
  [lngKeys.SettingsSubLimitTrialEnd]:
    '無料のトライアルが終了しました。利用を続ける場合アップグレードをお願いいたします。',
  [lngKeys.SettingsSubLimitUnderFreePlan]:
    'フリープランでは{{limit}}個までのドキュメントを作ることが可能です。',

  [lngKeys.PlanChoose]: 'プランを選択しましょう。',
  [lngKeys.PlanDiscountUntil]: 'ディスカウントを受け取ることができる期限：',
  [lngKeys.PlanDiscountDetail]: '{{month}}ヶ月間{{off}}%オフ',
  [lngKeys.PlanDiscountLabel]: '{{month}}ヶ月間ディスカウント',
  [lngKeys.PlanDiscountCouponWarning]:
    'クーポンコードを利用すると、他のディスカウントが削除されます。',
  [lngKeys.PlanBusinessIntro]:
    '大企業での利用やバルク契約でのディスカウントのご要望は、',
  [lngKeys.PlanBusinessLink]: 'お気軽にこちらよりお問い合わせください。',
  [lngKeys.PlanPerMember]: 'メンバーごと',
  [lngKeys.PlanPerMonth]: '毎月',
  [lngKeys.PlanTrial]: '{{days}}間の無料トライアル',
  [lngKeys.PlanInTrial]: 'トライアルを利用中です（残り{{remaining}}間）',
  [lngKeys.UpgradeSubtitle]: '支払い情報を入力してください。',
  [lngKeys.Viewers]: '人のViewer権限のユーザー',
  [lngKeys.Month]: '月',
  [lngKeys.TotalMonthlyPrice]: '月間の合計請求額',
  [lngKeys.PaymentMethod]: '支払い方法',
  [lngKeys.TrialWillBeStopped]: 'アップグレードと共にトライアルは終了します。',
  [lngKeys.ApplyCoupon]: 'クーポン適用',
  [lngKeys.PromoCode]: 'プロモーションコード',
  [lngKeys.Subscribe]: '支払を行う',
  [lngKeys.PaymentMethodJpy]:
    'JCBカードをご利用の場合は日本円でのお支払いのみ対応しています。',
  [lngKeys.UnlimitedViewers]: '無制限Viewer権限のユーザー',

  [lngKeys.BillingActionRequired]:
    'お支払い情報に関して、アップデートが必要です。',
  [lngKeys.BillingHistory]: '支払い履歴',
  [lngKeys.BillingHistoryCheck]:
    '未払いもしくはお支払いの失敗を確認するために、支払い履歴の確認をお願いいたします。',
  [lngKeys.BillingCancelledAt]:
    '最後の請求書を受領したあと、{{date}}に支払いが解除されます。',
  [lngKeys.BillingToCard]:
    '次回のお支払いは、{{date}}に最後の番号が{{cardEnd}}のクレジットカードに請求されます。',
  [lngKeys.BillingEditCard]: 'カード情報編集',
  [lngKeys.BillingEmail]: '請求用のメールアドレスは{{email}}です。',
  [lngKeys.BillingEditEmail]: 'メールアドレス編集',
  [lngKeys.BillingCanSeeThe]: '確認可能：',
  [lngKeys.BillingChangePlan]: 'プラン変更',
  [lngKeys.BillingUpdateCard]: 'クレジットカードのアップデート',
  [lngKeys.BillingCurrentCard]: '現在のクレジットカード',
  [lngKeys.BillingUpdateEmail]: '請求用のメールアドレスのアップデート',
  [lngKeys.BillingCurrentEmail]: '現在のメールアドレス',
  [lngKeys.BillingChangeJCB]:
    'JCBカードからの、もしくはJCBカードへの変更は、一度プランをキャンセルいただく必要がございます。なお、キャンセルしてもBoost Note内のデータが消えることはございませんのでご安心ください。',
  [lngKeys.BillingApplyPromoWarning]:
    'プロモーションコードを利用すると、現在のディスカウントが削除されます。',
  [lngKeys.BillingApplyPromo]: 'プロモーションコードを適用する',

  [lngKeys.BillingChangePlanDiscountStop]:
    'プランを変更すると現在のディスカウントが削除されます。',
  [lngKeys.BillingChangePlanStripeProration]:
    '請求額は、決済に利用しているStripeにより自動的に調整されます。',
  [lngKeys.BillingChangePlanFreeDisclaimer]:
    '無制限ドキュメントやドキュメント履歴変更、大きな容量サイズ等、特別な機能へのアクセスを失います。',
  [lngKeys.BillingChangePlanProDisclaimer]:
    '無制限ドキュメントやドキュメント履歴変更、大きな容量サイズ等、特別な機能を利用することが出来ます。',
  [lngKeys.BillingChangePlanStandardDisclaimer]:
    '無制限ドキュメントやドキュメント履歴変更、大きな容量サイズ等、特別な機能へのアクセスを失います。',

  [lngKeys.FreeTrialModalTitle]: 'プロプランを無料で試してみましょう',
  [lngKeys.FreeTrialModalBody]:
    '無制限ドキュメントやドキュメント履歴変更、大きな容量サイズ等、特別な機能を、{{days}}日間無料で利用することが出来ます。',
  [lngKeys.FreeTrialModalDisclaimer]: 'クレジットカード情報は必要ありません。',
  [lngKeys.FreeTrialModalCTA]: '無料トライアルを開始する',

  [lngKeys.LogOut]: 'ログアウト',
  [lngKeys.CreateNewSpace]: '新しいスペースを作る',
  [lngKeys.DownloadDesktopApp]: 'デスクトップアプリをダウンロードする',

  [lngKeys.ToolbarTooltipsSpaces]: 'スペース',
  [lngKeys.ToolbarTooltipsTree]: 'ツリー',
  [lngKeys.ToolbarTooltipsDiscount]: '期間限定割引を受け取る',

  [lngKeys.FolderNamePlaceholder]: 'フォルダー名',
  [lngKeys.DocTitlePlaceholder]: 'ドキュメント名',

  [lngKeys.SortLastUpdated]: '最新',
  [lngKeys.SortTitleAZ]: 'タイトル昇順',
  [lngKeys.SortTitleZA]: 'タイトル降順',
  [lngKeys.SortDragAndDrop]: 'ドラッグ&ドロップ',
  [lngKeys.CreateNewDoc]: 'ドキュメント作成',
  [lngKeys.UseATemplate]: 'テンプレートを使う',
  [lngKeys.RenameFolder]: 'フォルダー名変更',
  [lngKeys.RenameDoc]: 'ドキュメント名変更',
  [lngKeys.ModalsCreateNewFolder]: 'フォルダー作成',
  [lngKeys.ModalsCreateNewDocument]: 'ドキュメント作成',

  [lngKeys.ModalsDeleteWorkspaceTitle]: 'フォルダー削除',
  [lngKeys.ModalsDeleteWorkspaceDisclaimer]:
    'このフォルダーを削除しますか？中のアイテムも削除されます。',

  [lngKeys.ModalsDeleteDocFolderTitle]: '{{label}}を削除する',
  [lngKeys.ModalsDeleteDocDisclaimer]: 'このドキュメントを永久に削除しますか？',
  [lngKeys.ModalsDeleteFolderDisclaimer]:
    'このフォルダーを削除しますか？中のアイテムも削除されます。',

  [lngKeys.ModalsWorkspaceCreateTitle]: 'フォルダー作成',
  [lngKeys.ModalsWorkspaceEditTitle]: 'フォルダー編集',

  [lngKeys.ModalsWorkspaceMakePrivate]: 'プライベートにする',
  [lngKeys.ModalsWorkspaceAccess]: 'アクセス権限',
  [lngKeys.ModalsWorkspaceDefaultDisclaimer]:
    'デフォルトのフォルダーはパブリックであり、アクセス権限を変更することはできません。',
  [lngKeys.ModalsWorkspacePublicDisclaimer]:
    'このフォルダーはパブリックです。スペース内の誰でもアクセスすることができます。',
  [lngKeys.ModalsWorkspacePrivateDisclaimer]:
    'このフォルダーはプライベートです。招待されたメンバーのみアクセスすることができます。',
  [lngKeys.ModalsWorkspacePrivateOwner]:
    'こちらからメンバーを招待することができます。',

  [lngKeys.ModalsWorkspaceSetAccess]: '権限を設定する',
  [lngKeys.ModalsWorkspacesSetAccessMembers]: 'メンバーを追加する',
  [lngKeys.GeneralOwner]: 'オーナー',
  [lngKeys.GeneralAddVerb]: '追加',
  [lngKeys.GeneralSelectAll]: '全員を選択する',
  [lngKeys.ModalsWorkspacesWhoHasAcess]: 'アクセスを持っているメンバー',
  [lngKeys.ModalsWorkspacesNonOwnerDisclaimer]:
    'フォルダーのオーナーのみがアクセス権限を変更することができます',

  [lngKeys.ModalsImportDestinationTitle]: 'フォルダー選択',
  [lngKeys.ModalsImportDestinationDisclaimer]:
    'ドキュメントをインポートするフォルダーを選びましょう。',
  [lngKeys.ModalsImportDisclaimer]:
    'インポートするファイルを選びましょう（ファイル毎に５MBが最大です）',

  [lngKeys.ModalsSmartViewCreateTitle]: 'Create a Smart view',
  [lngKeys.ModalsSmartViewEditTitle]: 'Edit Smart view',
  [lngKeys.ModalsSmartViewPrivateDisclaimer]:
    'This Smart view will become private. Only you can see it.',
  [lngKeys.ModalsSmartViewPublicDisclaimer]:
    'This Smart view will become public. Every member can see it.',

  [lngKeys.EditorToolbarTooltipHeader]: 'ヘッダー',
  [lngKeys.EditorToolbarTooltipAdmonition]: 'Admonition',
  [lngKeys.EditorToolbarTooltipCodefence]: 'コードフェンス',
  [lngKeys.EditorToolbarTooltipQuote]: '引用',
  [lngKeys.EditorToolbarTooltipList]: '箇条書き',
  [lngKeys.EditorToolbarTooltipNumberedList]: '番号リスト',
  [lngKeys.EditorToolbarTooltipTaskList]: 'タスクリスト',
  [lngKeys.EditorToolbarTooltipBold]: '太文字',
  [lngKeys.EditorToolbarTooltipItalic]: 'イタリック',
  [lngKeys.EditorToolbarTooltipCode]: 'コード',
  [lngKeys.EditorToolbarTooltipLink]: 'リンク',
  [lngKeys.EditorToolbarTooltipUpload]: 'ファイルアップロード',
  [lngKeys.EditorToolbarTooltipTemplate]: 'テンプレートを使う',
  [lngKeys.EditorToolbarTooltipScrollSyncEnable]: 'スクロール同期',
  [lngKeys.EditorToolbarTooltipScrollSyncDisable]: 'スクロール非同期',

  [lngKeys.EditorReconnectAttempt]: '接続中です',
  [lngKeys.EditorReconnectAttempt1]: '自動接続を試みています',
  [lngKeys.EditorReconnectAttempt2]:
    'サーバーが接続されるまで変更は保存されません',
  [lngKeys.EditorReconnectDisconnected]: '再接続',
  [lngKeys.EditorReconnectDisconnected1]: '再接続を行ってください。',
  [lngKeys.EditorReconnectDisconnected2]:
    'サーバーが接続されるまで変更は保存されません',
  [lngKeys.EditorReconnectSyncing]: '同期中です',
  [lngKeys.EditorReconnectSyncing1]: 'クラウドと同期しています。',
  [lngKeys.EditorReconnectSyncing2]:
    '変更点を確認し、ドキュメントをライブアップデートしています',

  [lngKeys.DocSaveAsTemplate]: 'テンプレートとして保存する',
  [lngKeys.DocExportPdf]: 'PDFエクスポート',
  [lngKeys.DocExportMarkdown]: 'Markdownエクスポート',
  [lngKeys.DocExportHtml]: 'HTMLエクスポート',
  [lngKeys.OpenInBrowser]: 'ブラウザで開く',
  [lngKeys.GeneralPickYourDestination]: '保存先を選ぶ',

  [lngKeys.AttachmentsDeleteDisclaimer]:
    'このファイルを削除しますか？削除するとドキュメント内で表示されません。',
  [lngKeys.AttachmentsLimitDisclaimer]:
    '現在のプランの{{limit}}のうち、{{current}}が利用されています。',
  [lngKeys.AttachmentsPlanUpgradeDisclaimer]: '追加の容量が必要な場合',
  [lngKeys.AttachmentsUpgradeLink]: 'プランをアップグレードしてください。',

  [lngKeys.FolderInfo]: 'フォルダーの情報',
  [lngKeys.DocInfo]: 'ドキュメントの情報',
  [lngKeys.Assignees]: 'アサイン',
  [lngKeys.Unassigned]: 'アサイン',
  [lngKeys.DueDate]: '締切日',
  [lngKeys.AddDueDate]: '締切日',
  [lngKeys.AddALabel]: 'ラベル',
  [lngKeys.NoStatus]: 'ステータス',
  [lngKeys.CreationDate]: '作成日',
  [lngKeys.UpdateDate]: '更新日',
  [lngKeys.CreatedBy]: '作成者',
  [lngKeys.UpdatedBy]: '最新編集者',
  [lngKeys.Contributors]: '編集者',
  [lngKeys.WordCount]: '単語数',
  [lngKeys.CharacterCount]: '文字数',
  [lngKeys.History]: '履歴',
  [lngKeys.Share]: 'シェア',
  [lngKeys.PublicSharing]: 'パブリックシェア',
  [lngKeys.PublicSharingDisclaimer]:
    'リンクを知っている誰でもアクセスすることができます。',
  [lngKeys.SharingSettings]: 'シェア設定',
  [lngKeys.SharingRegenerateLink]: 'リンクの再発行',
  [lngKeys.Regenerate]: '再発行',
  [lngKeys.PasswordProtect]: 'パスワード保護',
  [lngKeys.ExpirationDate]: '有効期限',
  [lngKeys.SeeFullHistory]: '履歴を見る',
  [lngKeys.SeeLimitedHistory]: '最新{{days}}日の履歴',
  [lngKeys.ThreadsTitle]: 'スレッド',
  [lngKeys.ThreadPost]: '投稿',
  [lngKeys.ThreadFullDocLabel]: 'ドキュメントスレッド',
  [lngKeys.ThreadCreate]: 'スレッド作成',
  [lngKeys.ThreadOpen]: 'オープン',
  [lngKeys.ThreadClosed]: 'クローズ',
  [lngKeys.ThreadOutdated]: '無効',
  [lngKeys.ThreadReopen]: '再オープン',
  [lngKeys.ThreadReplies]: '{{count}}個のリプライ',
  [lngKeys.ModalsTemplatesDeleteDisclaimer]: `このテンプレートを削除しますか？`,
  [lngKeys.ModalsTemplatesSearchEmpty]:
    'テンプレートを見つけることができませんでした。',
  [lngKeys.ModalsTemplatesSelectTemplate]: 'テンプレート選択',
  [lngKeys.ModalsTemplatesUseInDoc]: 'このテンプレートを利用する',
  [lngKeys.GeneralAll]: '全て',
  [lngKeys.GeneralAny]: 'どれか',

  //Language
  [lngKeys.GeneralSelectVerb]: '選択',
  [lngKeys.GeneralOpenVerb]: '開く',
  [lngKeys.GeneralCopyTheLink]: 'リンクをコピーする',
  [lngKeys.GeneralMoveVerb]: '移動',
  [lngKeys.GeneralSource]: '移行元',
  [lngKeys.GeneralDestination]: '行き先',
  [lngKeys.GeneralPrevious]: '戻る',
  [lngKeys.GeneralNext]: '次に進む',
  [lngKeys.GeneralContinueVerb]: '次に進む',
  [lngKeys.GeneralShared]: 'シェア済',
  [lngKeys.GeneralRenameVerb]: '名前変更',
  [lngKeys.GeneralEditVerb]: '編集',
  [lngKeys.GeneralBookmarks]: 'ブックマーク',
  [lngKeys.GeneralUnbookmarkVerb]: 'ブックマーク削除',
  [lngKeys.GeneralBookmarkVerb]: 'ブックマークする',
  [lngKeys.GeneralDashboards]: 'Dashboards',
  [lngKeys.GeneralWorkspaces]: 'フォルダー',
  [lngKeys.GeneralPrivate]: 'プライベート',
  [lngKeys.GeneralLabels]: 'ラベル',
  [lngKeys.GeneralMore]: '他',
  [lngKeys.GeneralStatus]: 'ステータス',
  [lngKeys.GeneralMembers]: 'メンバー',
  [lngKeys.GeneralSettings]: '設定',
  [lngKeys.GeneralTimeline]: 'タイムライン',
  [lngKeys.GeneralImport]: 'インポート',
  [lngKeys.GeneralSearchVerb]: '検索',
  [lngKeys.GeneralHelp]: 'ヘルプ',
  [lngKeys.GeneralProfilePicture]: 'プロフィール写真',
  [lngKeys.GeneralName]: '名前',
  [lngKeys.GeneralSpaces]: 'スペース数',
  [lngKeys.GeneralTabs]: 'タブ',
  [lngKeys.GeneralLogo]: 'ロゴ',
  [lngKeys.GeneralUser]: 'ユーザー',
  [lngKeys.GeneralBack]: '戻る’',
  [lngKeys.GeneralAdmin]: 'Admin',
  [lngKeys.GeneralMember]: 'Member',
  [lngKeys.GeneralViewer]: 'Viewer',
  [lngKeys.GeneralSeeVerb]: '見る',
  [lngKeys.GeneralCopyVerb]: 'コピー',
  [lngKeys.GeneralCopied]: 'コピーされました',
  [lngKeys.GeneralSendVerb]: '送信',
  [lngKeys.GeneralSendMore]: 'もっと送る',
  [lngKeys.GeneralLeaveVerb]: '離れる',
  [lngKeys.GeneralRemoveVerb]: '削除',
  [lngKeys.GeneralDemoteVerb]: '変更する',
  [lngKeys.GeneralPromoteVerb]: '変更する',
  [lngKeys.GeneralEnableVerb]: '有効化',
  [lngKeys.GeneralDisableVerb]: '無効化',
  [lngKeys.GeneralShowVerb]: '見る',
  [lngKeys.GeneralHideVerb]: '隠す',
  [lngKeys.GeneralSaveVerb]: '保存',
  [lngKeys.GeneralCloseVerb]: '閉じる',
  [lngKeys.GeneralThisSpace]: 'このスペース',
  [lngKeys.GeneralToken]: 'トークン',
  [lngKeys.GeneralApplyVerb]: '適用',
  [lngKeys.GeneralUpdateVerb]: 'アップデート',
  [lngKeys.GeneralLearnMore]: 'もっと見る',
  [lngKeys.GeneralDoYouWishToProceed]: 'このまま続けてよろしいでしょうか？',
  [lngKeys.GeneralDays]: '日',
  [lngKeys.GeneralHours]: '時間',
  [lngKeys.GeneralMinutes]: '分',
  [lngKeys.GeneralSeconds]: '秒',

  [lngKeys.GeneralOrdering]: '並び順',
  [lngKeys.SidebarViewOptions]: '表示',
  [lngKeys.SidebarSettingsAndMembers]: '設定とメンバー',
  [lngKeys.GeneralInbox]: '通知',
  [lngKeys.SidebarNewUserDiscount]: '期間限定クーポン',
  [lngKeys.SettingsImportDescription]:
    '既存のツールから、ドキュメントを移行しましょう。',

  [lngKeys.GeneralPassword]: 'パスワード',

  [lngKeys.CooperateTitle]: 'Spaceを作成する',
  [lngKeys.CooperateSubtitle]: 'Space情報を設定しましょう',
  [lngKeys.PictureAdd]: '写真追加',
  [lngKeys.PictureChange]: '写真を変更する',
  [lngKeys.SpaceIntent]: 'どのような目的でこのSpaceを作成しますか？',
  [lngKeys.SpaceIntentPersonal]: '個人利用',
  [lngKeys.SpaceIntentTeam]: 'チームとのコラボレーション',
  [lngKeys.PlanFreePerk1]: '無制限のViewers権限',
  [lngKeys.PlanFreePerk2]: '3 Members権限',
  [lngKeys.PlanFreePerk3]: '無制限ドキュメント',
  [lngKeys.PlanStoragePerk]: 'ひとりあたり{{storageSize}}の容量',
  [lngKeys.PlanStandardPerk1]: '無制限Member権限',
  [lngKeys.PlanStandardPerk2]: '開発支援',
  [lngKeys.PlanStandardPerk3]: '直近{{days}}日間のドキュメント変更履歴',
  [lngKeys.PlanProPerk3]: '優先サポート',
  [lngKeys.PlanProPerk1]: 'シェアドキュメントへ、パスワードと有効期限設定',
  [lngKeys.PlanProPerk2]: '全てのドキュメント変更履歴',
  [lngKeys.PlanViewersMembersIntro]:
    'Viewer権限とMember権限の違いにつきましては、',
  [lngKeys.PlanViewersMembersLink]: 'こちらの記事をご覧ください。',
  [lngKeys.PlanSizePerUpload]: '{{size}}Mb per upload',
  [lngKeys.PlanDashboardPerUser]: '{{size}} dashboards per user',
  [lngKeys.PlanSmartviewPerDashboard]: '{{size}} smart views per dashboard',
  [lngKeys.SeeRoleDetails]: '各権限を確認する。',
  [lngKeys.ViewerDisclaimerIntro]: 'このドキュメントを編集できるように',
  [lngKeys.ViewerDisclaimerOutro]:
    'Admin権限の方があなたの権限をMemberに変更すると、ドキュメント編集等を行うことができるようになります。',
  [lngKeys.MemberRole]: 'メンバーの役割',

  [lngKeys.DiscountModalTitle]: '有料プランを購読し、割引を受け取りましょう！',
  [lngKeys.DiscountModalAlreadySubscribed]:
    'あなたは既に有料プランに加入しています。',
  [lngKeys.DiscountModalTimeRemaining]: 'タイムリミット',
  [lngKeys.DiscountModalExpired]: '割引への有効期限の期限が切れました。',
  [lngKeys.GeneralInvite]: '招待する',
  [lngKeys.SettingsRolesRestrictedTitle]: 'この権限は制限されています。',
  [lngKeys.SettingsRolesRestrictedDescription]:
    'メンバー権限を変更するためには、有料プランを購入する必要があります。アップグレードをご検討いただけますと幸いです。',

  [lngKeys.GeneralDocuments]: 'Documents',
  [lngKeys.RequestSent]: 'Request sent',
  [lngKeys.RequestAskMemberRole]: 'メンバーの役割を尋ねる',
  [lngKeys.UploadLimit]:
    'The maximum allowed size for uploads is {{sizeInMb}}Mb',

  [lngKeys.OnboardingFolderSectionTitle]: 'Welcome to Boost Note!',
  [lngKeys.OnboardingFolderSectionDisclaimer]:
    'Invite your teammates to this space',
  [lngKeys.GeneralContent]: 'Content',
  [lngKeys.CreateNewCanvas]: 'Create new canvas (beta)',

  [lngKeys.GeneralYes]: 'はい',
  [lngKeys.GeneralNo]: 'いいえ',

  [lngKeys.ModalUnlockDashboardsTitle]: 'Unlock Dashboards',
  [lngKeys.ModalUnlockDashboardsDescription]:
    'Create unlimited dashboards to organize your docs, tasks.. in order to guide your workflow in your own way! Display the information the way you want to see it.',
  [lngKeys.ModalUnlockSmartviewsTitle]: 'Unlock Smart Views',
  [lngKeys.ModalUnlockSmartviewsDescription]:
    'Add unlimited smart views to your dashboard in order to customize even more your own experience. More smart views will allow you to be even more specific when it comes to what you want to see and how you want to see it!',
  [lngKeys.ModalUnlockCheckDetails]:
    'Check the details of the Standard and Pro plans and learn what you can do with it!',
  [lngKeys.OverlimitDashboards]: `Your dashboards exceed the limit of your current plan. Consider upgrading your plan or deleting other dashboards in order to continue using this feature with your current plan.`,
}

export default {
  translation: jpTranslation,
}
