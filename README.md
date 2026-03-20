<h1 align="center">LawAI</h1>
<p align="center"><strong>Intelligent Legal Assistant for FIR Support Workflows</strong></p>
<p align="center">Professional, responsive web interface for AI-assisted incident-to-law mapping.</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-HTML%2FCSS%2FJS-1f3a8a?style=for-the-badge" alt="Frontend Badge" />
  <img src="https://img.shields.io/badge/UI-Responsive-334155?style=for-the-badge" alt="Responsive Badge" />
  <img src="https://img.shields.io/badge/Theme-Light%20%2F%20Dark-4f46e5?style=for-the-badge" alt="Theme Badge" />
  <img src="https://img.shields.io/badge/License-MIT-111827?style=for-the-badge" alt="License Badge" />
</p>

## Product Summary
LawAI helps law-enforcement teams convert incident narratives into structured legal guidance.  
The UI is optimized for clarity, speed, and professional reporting support.

## Core Capabilities
| Capability | Description |
|---|---|
| AI Legal Analysis | Parses incident text and returns relevant legal context and section-level guidance. |
| Professional UI | Enterprise-grade interface with refined layout, typography, and interaction design. |
| Light/Dark Themes | Persistent theme preferences via `localStorage` with smooth transitions. |
| Search History | Optional local history storage with a strict cap of 3 most recent results. |
| PDF Export | Generates a downloadable legal analysis report for documentation workflows. |
| Keyboard Productivity | `Ctrl/Cmd + K` to focus input and `Ctrl/Cmd + Enter` to submit quickly. |

## Visual Workflow
```mermaid
flowchart LR
  A[Officer enters incident details] --> B[LawAI sends analysis request]
  B --> C[AI response is parsed + formatted]
  C --> D[Structured legal output shown]
  D --> E[Optional: Save to local history (max 3)]
  D --> F[Optional: Export PDF report]
```

## Tech Stack
- HTML5
- CSS3 (custom design system with CSS variables)
- JavaScript (ES6+)
- Font Awesome (icons)
- Google Fonts (`Manrope`, `Source Sans 3`)
- Puter AI client (`https://js.puter.com/v2/`)
- `html2pdf.js` for PDF generation

## Project Structure
```text
.
|-- index.html         # Main UI structure
|-- styles.css         # Theme system and visual design
|-- script.js          # App logic, AI interaction, history, PDF export
|-- test.html          # Optional development/testing page
|-- favicon.ico        # App icon
|-- README.md          # Project overview
|-- CONTRIBUTING.md    # Contribution guidelines
`-- LICENSE            # MIT license
```

## Quick Start
1. Clone or download this repository.
2. Open `index.html` directly in a modern browser, or run a local static server.
3. Enter incident details in the query box.
4. Click `Analyze Incident` (or use `Ctrl/Cmd + Enter`).
5. Review output, optionally save history locally, and export PDF if needed.

## Local Development
Use any static server. Example:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Local Storage Keys
| Key | Purpose |
|---|---|
| `theme` | Stores current theme (`light` / `dark`) |
| `lawai_search_history` | Stores recent saved results (max 3) |
| `lawai_search_history_enabled` | Stores history save toggle preference |

## Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + K` | Focus incident input |
| `Ctrl/Cmd + Enter` | Submit analysis |
| `Esc` | Close modal dialogs |

## Notes and Disclaimer
- This tool supports legal workflow preparation.
- Output should be reviewed by qualified legal professionals before official use.

## Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, coding standards, and PR workflow.

## License
This project is licensed under the MIT License.  
See [LICENSE](./LICENSE) for details.

## Team
Developed by **CODE-A-COLA** for Smart India Hackathon 2024.
