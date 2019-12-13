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
      },
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
      },
      {
        label: 'Template - Brainstorm',
        absolutePath: 'Brainstorm.md',
        slug: 'brainstorm',
        type: 'note',
        children: []
      },
      {
        label: 'Template - Bugfix Report',
        absolutePath: 'BugfixReport.md',
        slug: 'bugfix-report',
        type: 'note',
        children: []
      },
      {
        label: 'Template - Meeting Notes',
        absolutePath: 'MeetingNotes.md',
        slug: 'meeting-notes',
        type: 'note',
        children: []
      },
      {
        label: 'Template - Weekly Planner',
        absolutePath: 'WeeklyPlanner.md',
        slug: 'weekly-planner',
        type: 'note',
        children: []
      }
    ]
  }
]
