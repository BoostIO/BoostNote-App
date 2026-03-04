# Changelog

All notable changes to this project will be documented in this file.

## [0.24.0] - 2026-03-04

### Added
- **Improved Auto-Update Flow** - Complete redesign of the automatic update system
  - Added 3-option update prompt: "Download", "Skip This Update", "Remind Me Later"
  - Added download progress bar with real-time percentage and speed display
  - Added user-controlled restart timing (restart now or later)
  - Added "Install Update" button to skip checking for users who previously skipped
  - Added user preference persistence (skip version, remind-later timestamp)
  - Added IPC communication between main and renderer processes
  - Added React component for displaying update progress in UI
  - Menu now dynamically updates to show current update status

### Changed
- Replaced basic auto-updater with comprehensive update management system
- Menu labels now reflect update status ("Downloading... 45%", "Restart to Update")

### Technical
- New module: `src/electron/updater-improved.ts` - Complete auto-updater implementation
- New component: `src/components/UpdateNotification.tsx` - Progress UI
- Updated: `src/electron/menu.ts` - Integrated new update menu options
- Updated: `src/electron/index.ts` - Initialize new auto-updater

## [0.23.1] - Previous Version

- Basic auto-updater with simple Yes/No prompt
- Automatic download and immediate restart
