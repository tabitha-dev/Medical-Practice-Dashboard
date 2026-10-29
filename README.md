# MedOps Practice Studio — Medical Practice Dashboard

**[View the interactive dashboard](https://tabitha-dev.github.io/Medical-Practice-Dashboard/)** · [Browse the code](https://github.com/tabitha-dev/Medical-Practice-Dashboard)

A modernized **frontend demonstration** of healthcare practice operations. Explore patient directories, appointment scheduling, billing and practice analytics using **randomly generated synthetic data**. The project showcases responsive UI architecture, interaction patterns, accessibility work, and operational workflow design.

> **Demonstration only.** This static GitHub Pages website is not an EHR, patient portal, clinical system, or real practice-management service. It cannot send booking confirmations, authenticate users, process payments, store medical records, or connect to live EHR systems. Do not enter protected health information (PHI).

## What you can explore

- **Practice overview:** sample appointment, patient experience, waiting-time and revenue KPIs with trends.
- **Patient directory:** 200 synthetic patients, searchable by name and filterable by status and insurer.
- **Appointments:** 500 randomly generated appointments, daily / weekly / calendar layouts and simulated check-in actions.
- **Booking preview:** demo visit-type, calendar and time-slot UI. Submitting does not create a real appointment.
- **Billing:** 300 illustrative invoices, collection metrics and simulated action feedback. No payment processing.
- **Analytics:** original illustrative metrics and advanced report modal, clearly identified as a demo.
- **Settings and help:** mock settings panels, integration cards and documentation views. Connected statuses do **not** indicate actual integration.
- **Responsive navigation:** persistent desktop sidebar, mobile bottom navigation with an accessible More menu, focus indicators and modal interactions.

## Technology

- HTML5, CSS and vanilla JavaScript
- Tailwind CSS via CDN and bespoke responsive design tokens
- Synthetic in-memory JavaScript data, generated on each page load
- GitHub Pages static hosting

No application server, credentials, protected health database or persistent record storage. **Changes in this demo are not saved locally and do not sync between devices.** Some controls are illustrative and intentionally do not alter the sample dataset.

## Design, SEO/AEO and accessibility

The refresh adds a clean clinical-operations visual direction, semantic site content, public demo disclosures, crawlable FAQs, a canonical URL, description, favicon, social card, WebApplication structured data, robots.txt, sitemap.xml and llms.txt.

Accessibility updates include keyboard-operable sidebar navigation, a mobile navigation bar, skip link, visible focus, reduced-motion preference handling, accessible demo notices and responsive table overflow. Browser regression checks cover phone, tablet and desktop views. **Passing automated checks is not a full WCAG 2.2 AA or screen-reader certification.** Search metadata does not guarantee indexing or appearance in AI-generated answers.

## Run locally

```bash
git clone https://github.com/tabitha-dev/Medical-Practice-Dashboard.git
cd Medical-Practice-Dashboard
python -m http.server 8000
```

Open http://localhost:8000. Internet access is required for the project's Tailwind CDN and Google Fonts.

## Run automated browser checks

With the local server running in another terminal:

```bash
python -m pip install playwright==1.57.0
python -m playwright install chromium
npm install --no-save axe-core@4.10.3
python scripts/qa_responsive.py
python scripts/qa_accessibility.py
```

These automated tests use randomly generated demonstration records and should be supplemented by manual keyboard, screen-reader, zoom, and real-device testing.

## License

See [LICENSE](LICENSE).
