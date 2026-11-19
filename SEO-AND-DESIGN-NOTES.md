# Imani Teachers Center — design and SEO update

## What the product communicates
- A browser-based workspace for Kenyan teachers to prepare schemes of work, lesson plans, revision materials and exams.
- Coverage presented on the landing page: PP1–PP2, Grade 1–6, Grade 7–12 and Form 1–4/KCSE.
- Workflow: create an account, choose class/learning area, set term dates and breaks, check document cover details, review the lesson table, then save Word/PDF.
- Supporting areas include calendar, schedule, document history, exams, research and account workspace.

## Design changes
- Replaced the cramped, small-type landing presentation with stronger editorial typography, clearer spacing and a restrained navy/stone/ochre palette.
- Made the hero a deliberate split layout using the supplied classroom photography rather than gradients or generic AI-style visual effects.
- Reworked class levels and workflow into quieter, structured layouts; reduced excessive rounded cards and decorative effects.
- Improved mobile layout, focus visibility, skip navigation and reduced-motion behavior.
- Added lazy loading to supporting images and high fetch priority to the lead image.

## SEO changes
- Added a descriptive title, meta description, robots directives, canonical URL, Kenyan English locale, Open Graph and Twitter metadata.
- Added Organization, WebSite and SoftwareApplication JSON-LD.
- Added robots.txt and sitemap.xml.
- Added descriptive image alt text already present in the source and retained the page's visible product terminology.

## Important before production
- Confirm that `https://imaniteachers.co.ke/` is the canonical live domain and that HTTPS redirects are enabled.
- Confirm the exact product capabilities, pricing, account requirements and any AI features before adding claims to landing copy. This update intentionally does not invent prices, testimonials, accreditation, curriculum approval or guarantees.
- Submit `https://imaniteachers.co.ke/sitemap.xml` in Google Search Console and Bing Webmaster Tools after deployment.
- Configure server-side redirects so `/index/alternate.html` and `/index/index.html` resolve to `/` (or are not separately indexed).
- SEO metadata improves crawl clarity; rankings are not guaranteed and depend on useful original content, performance, links and indexing.

## Deployment
Use the contents of the `Imaniteachers.co.ke` folder as the website document root. A root-level `index.html` is included for standard static hosting. Keep the `assets/` and `js/` directories alongside it.
