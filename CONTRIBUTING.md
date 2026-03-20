# Contributing to LawAI

Thank you for contributing to LawAI.

## Scope
This repository is a static frontend application (`HTML`, `CSS`, `JavaScript`) focused on legal-analysis UX and workflow support.

## Development Setup
1. Fork and clone the repository.
2. Start a local static server.
3. Open the app in a modern browser.

Example:
```bash
python -m http.server 5500
```
Then open `http://localhost:5500`.

## Branch and Commit Guidelines
- Branch naming:
  - `feature/<short-description>`
  - `fix/<short-description>`
  - `docs/<short-description>`
- Recommended commit format:
  - `feat: add history persistence toggle`
  - `fix: resolve theme transition flicker`
  - `docs: improve quick start section`

## Coding Standards
- Keep code readable and modular.
- Preserve existing DOM IDs/classes used by `script.js`.
- Prefer CSS variables for theme-aware styling.
- Maintain responsive behavior across desktop/tablet/mobile.
- Keep accessibility in mind:
  - semantic structure
  - visible focus states
  - keyboard usability
- Avoid introducing build dependencies unless discussed first.

## Pull Request Checklist
Before opening a PR, verify:
- New behavior works in both light and dark themes.
- Layout remains usable on small screens.
- Keyboard shortcuts and key workflows still work.
- No console errors are introduced.
- Documentation is updated when behavior changes.

## Testing Expectations
At minimum, manually test:
- Incident analysis submission flow
- Theme toggle and persistence
- History section behavior (max 3 saved entries)
- PDF download flow
- Modal open/close behavior

## Reporting Issues
When filing a bug, include:
- Clear reproduction steps
- Expected behavior
- Actual behavior
- Browser and OS details
- Screenshots/recordings when possible

## Security and Legal Notes
- Do not commit secrets or credentials.
- Do not claim generated output as final legal advice.

## Questions
For major changes, open an issue first to align on scope and implementation approach.
