export type TutorialsNavigatorTreeItem = {
  label: string
  slug: string
  absolutePath: string
  type: 'folder' | 'note' | 'storage'
  children: TutorialsNavigatorTreeItem[]
}

export const tutorialsTree: TutorialsNavigatorTreeItem[] = [
  {
    label: 'Tutorials',
    absolutePath: 'tutorials',
    slug: 'tutorials',
    type: 'storage',
    children: [
      {
        label: 'Welcome Pack',
        absolutePath: 'WelcomePack',
        slug: 'welcome-pack',
        type: 'folder',
        children: [
          {
            label: 'Playground',
            absolutePath: 'Playground',
            slug: 'playground',
            type: 'folder',
            children: [
              {
                label: 'Get Started!',
                absolutePath: 'GetStarted.md',
                slug: 'get-started',
                type: 'note',
                children: []
              },
              {
                label: "Today's Task",
                absolutePath: 'TodaysTask.md',
                slug: 'daily-task',
                type: 'note',
                children: []
              }
            ]
          },
          {
            label: 'Guides',
            absolutePath: 'Guides',
            slug: 'guides',
            type: 'folder',
            children: [
              {
                label: 'About our community',
                absolutePath: 'AboutOurCommunity.md',
                slug: 'community',
                type: 'note',
                children: []
              },
              {
                label: 'Keyboard shortcuts',
                absolutePath: 'KeyboardShortcuts.md',
                slug: 'keyboard-shortcuts',
                type: 'note',
                children: []
              },
              {
                label: 'Storage guide',
                absolutePath: 'StorageGuide.md',
                slug: 'storage-guide',
                type: 'note',
                children: []
              }
            ]
          },
          {
            label: 'Templates',
            absolutePath: 'Templates',
            slug: 'templates',
            type: 'folder',
            children: [
              {
                label: 'Brainstorm',
                absolutePath: 'Brainstorm.md',
                slug: 'brainstorm',
                type: 'note',
                children: []
              },
              {
                label: 'Bugfix Report',
                absolutePath: 'BugfixReport.md',
                slug: 'bugfix-report',
                type: 'note',
                children: []
              },
              {
                label: 'Meeting Notes',
                absolutePath: 'MeetingNotes.md',
                slug: 'meeting-notes',
                type: 'note',
                children: []
              },
              {
                label: 'Weekly Planner',
                absolutePath: 'WeeklyPlanner.md',
                slug: 'weekly-planner',
                type: 'note',
                children: []
              }
            ]
          }
        ]
      }
    ]
  }
]
