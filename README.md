# G-Class Savings Tracker

A tiny minimalist web app to track progress toward buying a Mercedes‑Benz G‑Class (target 185 380 €). The app:

- Lets you add earnings (€/€) which are subtracted from the remaining amount
- Persists contributions in the browser (localStorage)
- Shows progress bar and percentage
- Displays congratulatory toasts when hitting milestones (10%, 25%, 50%, 75%, 90%, 100%)
- Minimal, glassy full-screen UI — replace the car image in index.html to customize

How to use
1. Copy `index.html`, `styles.css`, and `app.js` into your repo (e.g., in a folder `gclass-tracker/`).
2. Open `index.html` in a browser, or publish via GitHub Pages.

To change the target price
- Edit the `TARGET` constant in `app.js` (line near top) or change the visible text in `index.html`.

Deployment
- For a one-file deployment use GitHub Pages on the branch root or put the files into `gh-pages` branch or repository root and enable Pages.

Suggested commit message
- "Add G-Class savings tracker web app (index.html, styles.css, app.js)"

License
- Use however you like — small MIT-friendly sample.