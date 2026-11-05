import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const services = JSON.parse(await fs.readFile(path.join(root, "content", "services.json"), "utf8"));

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function navLink(label, href, key, active) {
  const current = key === active ? ' aria-current="page"' : "";
  return '<a href="' + href + '"' + current + ">" + label + "</a>";
}

const iconPaths = [
  '<path d="M8 3 2.8 6v6c0 3.2 2.1 5.5 5.2 7 3.1-1.5 5.2-3.8 5.2-7V6L8 3Z"/><path d="m5.6 10.6 1.6 1.7 3.2-3.7"/>',
  '<path d="M3 5h10M3 9h10M3 13h6"/><path d="m10 14 2 2 4-5"/>',
  '<path d="M2.5 6.5h11l-1 8h-9l-1-8Z"/><path d="M5 6.5V5a3 3 0 0 1 6 0v1.5M5.5 10h5"/>',
  '<path d="M3 3h7l4 4v10H3V3Z"/><path d="M10 3v4h4M5.5 11h6M5.5 14h6"/>',
  '<path d="M2.5 7 8 3l5.5 4v9H2.5V7Z"/><path d="M6 16v-5h4v5"/>',
  '<path d="M2.5 4.5h11v11h-11z"/><path d="m4.5 11 2.2 2.2 4.8-5.4"/>',
  '<path d="M2 14.5 8 3l6 11.5M4.2 10.5h7.6M3 14.5h10"/>'
];

function renderHeader(active) {
  const serviceLinks = services.map((service) => {
    const current = service.key === active ? ' aria-current="page"' : "";
    return '<a href="' + service.file + '"' + current + '>' + escapeHtml(service.label) + '<span>↗</span></a>';
  }).join("");
  return [
    '<a class="skip-link" href="#main">Skip to content</a>',
    '<header class="site-header">',
    '  <div class="nav-shell">',
    '    <a class="brand" href="index.html" aria-label="Infrastructure 701 Legal home">',
    '      <img src="assets/infra701-neon-logo.jpg" alt="Infrastructure 701 Legal">',
    '    </a>',
    '    <button class="nav-toggle" type="button" aria-controls="primary-nav" aria-expanded="false" aria-label="Open navigation"><span></span><span></span></button>',
    '    <nav class="primary-nav" id="primary-nav" aria-label="Main navigation">',
    '      ' + navLink("Home", "index.html", "home", active),
    '      <div class="nav-dropdown">',
    '        <button class="nav-menu-trigger" type="button" aria-expanded="false" aria-controls="service-menu">Services <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 6 5 5 5-5"/></svg></button>',
    '        <div class="nav-menu-panel" id="service-menu">' + navLink("All service areas", "services.html", "services", active) + serviceLinks + '</div>',
    '      </div>',
    '      ' + navLink("About", "about.html", "about", active),
    '      ' + navLink("Contact", "contact.html", "contact", active),
    '      <a class="nav-call" href="tel:+18444637277"><span>Call the office</span><b>(844) 463-7277</b></a>',
    '    </nav>',
    '  </div>',
    '</header>'
  ].join("\n");
}

function renderFooter() {
  const footerServices = services.map((service) => '<a href="' + service.file + '">' + escapeHtml(service.label) + '</a>').join("");
  return [
    '<footer class="site-footer">',
    '  <div class="footer-aurora" aria-hidden="true"></div>',
    '  <div class="container footer-main">',
    '    <a class="footer-lockup" href="index.html"><span class="footer-monogram">701</span><span><b>INFRASTRUCTURE 701</b><small>LEGAL</small></span></a>',
    '    <div class="footer-summary"><p>Support for people, businesses, and organizations making their next move.</p><a href="contact.html">Start a conversation <span>↗</span></a></div>',
    '    <div class="footer-links"><div><strong>Service areas</strong>' + footerServices + '</div><div><strong>Contact</strong><a href="tel:+18444637277">(844) 463-7277</a><span>Se habla español</span><a href="contact.html">Appointments</a></div></div>',
    '  </div>',
    '  <div class="container footer-scope"><span class="scope-symbol">i</span><p>Information on this site is general and does not promise legal, tax, credit, filing, or contracting outcomes. Professional roles and service scope vary by matter. Confirm engagement terms with the office and seek advice from a properly licensed professional when needed.</p></div>',
    '  <div class="container footer-bottom"><span>© ' + new Date().getFullYear() + ' Infrastructure 701 Legal</span><span class="footer-bottom-line"></span><span>Information is for general purposes only.</span><a href="#top">Back to top ↑</a></div>',
    '</footer>'
  ].join("\n");
}

function renderShell(page, content) {
  const canonical = "https://infra701legal.com/" + (page.file === "index.html" ? "" : page.file);
  const preload = page.key === "home" ? '<link rel="preload" as="image" href="assets/consultation-hero.jpg">' : "";
  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    '  <meta name="theme-color" content="#11100e">',
    '  <meta name="description" content="' + escapeHtml(page.description) + '">',
    '  <meta property="og:title" content="' + escapeHtml(page.title) + ' | Infrastructure 701 Legal">',
    '  <meta property="og:description" content="' + escapeHtml(page.description) + '">',
    '  <meta property="og:type" content="website">',
    '  <meta property="og:image" content="https://infra701legal.com/assets/consultation-hero.jpg">',
    '  <meta property="og:image:alt" content="A family reviewing documents with a preparation professional">',
    '  <meta name="twitter:card" content="summary_large_image">',
    '  <link rel="canonical" href="' + canonical + '">',
    '  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">',
    "  " + preload,
    '  <link rel="stylesheet" href="styles.css">',
    '  <script src="site.js" defer></script>',
    '  <title>' + escapeHtml(page.title) + ' | Infrastructure 701 Legal</title>',
    "</head>",
    '<body id="top" data-page="' + page.key + '">',
    renderHeader(page.active),
    '<main id="main">' + content + "</main>",
    renderFooter(),
    "</body>",
    "</html>"
  ].join("\n");
}

function serviceCard(service, index) {
  const number = String(index + 1).padStart(2, "0");
  return [
    '<article class="service-card reveal" style="--card-index:' + index + '">',
    '  <div class="service-card-top"><span>' + number + " / " + escapeHtml(service.group) + '</span><span class="service-card-icon" aria-hidden="true"><svg viewBox="0 0 16 20">' + iconPaths[index % iconPaths.length] + '</svg></span></div>',
    '  <h3><a href="' + service.file + '">' + escapeHtml(service.title) + '</a></h3>',
    '  <p>' + escapeHtml(service.intro) + '</p>',
    '  <a class="service-card-link" href="' + service.file + '">Explore service <span>↗</span></a>',
    '  <span class="service-watermark" aria-hidden="true">' + number + '</span>',
    '</article>'
  ].join("\n");
}

function renderServicesOverview() {
  const cards = services.map(serviceCard).join("\n");
  return [
    '<section class="page-hero interior-hero">',
    '  <div class="interior-grid" aria-hidden="true"></div><div class="interior-orbit" aria-hidden="true"></div>',
    '  <div class="container interior-hero-inner"><p class="eyebrow"><span>01</span> Service areas</p><h1>One place to begin.<br><em>Seven ways forward.</em></h1><p class="page-hero-lead">Explore immigration law, filings, business formation, tax preparation, data furnishing, credit-report support, and government-contracting preparation.</p><a class="button button-primary" href="contact.html">Talk through your needs <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 4l6 6-6 6"/></svg></a></div>',
    '</section>',
    '<section class="section-pad service-index"><div class="container"><div class="section-head reveal"><p class="section-kicker"><span>02 / Choose a service area</span></p><h2>Find the support<br><em>that fits the move.</em></h2><p>Service scope, professional involvement, availability, and terms are confirmed for each matter.</p></div><div class="service-grid">' + cards + '</div></div></section>',
    '<section class="scope-band"><div class="container scope-band-inner"><span class="scope-mark">i</span><div><p class="section-kicker">Clear scope matters</p><h2>Know who is doing the work.</h2><p>Ask which attorney, CPA, or service professional is involved, what the engagement includes, and what outcomes are outside anyone’s control.</p></div><a class="text-link" href="contact.html">Contact the office <span>↗</span></a></div></section>'
  ].join("\n");
}

function renderServicePage(service, index) {
  const chips = (service.chips || []).map((chip) => '<span class="service-chip">' + escapeHtml(chip) + '</span>').join("");
  const cards = service.items.map((item, itemIndex) => [
    '<article class="detail-card reveal" style="--card-index:' + itemIndex + '">',
    '  <span class="detail-card-index">0' + (itemIndex + 1) + '</span>',
    '  <h2>' + escapeHtml(item.title) + '</h2>',
    '  <p>' + escapeHtml(item.text) + '</p>',
    '</article>'
  ].join("\n")).join("\n");
  const links = (service.links || []).map((link) => '<a class="source-link" href="' + escapeHtml(link.href) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(link.label) + ' <span>↗</span></a>').join("");
  return [
    '<section class="page-hero interior-hero detail-hero">',
    '  <div class="interior-grid" aria-hidden="true"></div><div class="interior-orbit" aria-hidden="true"></div>',
    '  <div class="container interior-hero-inner"><p class="eyebrow"><span>' + String(index + 1).padStart(2, "0") + '</span> ' + escapeHtml(service.group) + '</p><h1>' + escapeHtml(service.hero) + '</h1><p class="page-hero-lead">' + escapeHtml(service.intro) + '</p><div class="hero-actions"><a class="button button-primary" href="contact.html">Ask about this service <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 4l6 6-6 6"/></svg></a><a class="text-link" href="tel:+18444637277">Call (844) 463-7277 <span>↗</span></a></div></div>',
    '</section>',
    '<section class="section-pad detail-section"><div class="container">',
    '  <div class="detail-overview reveal"><div><p class="section-kicker">01 / ' + escapeHtml(service.label) + '</p><h2>' + escapeHtml(service.title) + '</h2></div><div class="detail-overview-copy"><p>' + escapeHtml(service.intro) + '</p><div class="chip-row">' + chips + '</div></div></div>',
    '  <div class="detail-card-grid">' + cards + '</div>',
    '  <div class="detail-note reveal"><span class="note-emblem">i</span><div><strong>Important to know</strong><p>' + escapeHtml(service.note) + '</p>' + (links ? '<div class="source-links">' + links + '</div>' : "") + '</div></div>',
    '</div></section>',
    '<section class="detail-lower"><div class="container detail-lower-grid"><div class="detail-lower-heading"><p class="section-kicker">02 / Next step</p><h2>Start with the<br><em>right questions.</em></h2></div><div class="detail-lower-copy"><p>Tell us what you are trying to accomplish. We’ll confirm whether this service is available, who will provide it, and what information to prepare.</p><a class="button button-outline" href="contact.html">Contact INFRA701 LEGAL <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 4l6 6-6 6"/></svg></a><p class="detail-phone"><a href="tel:+18444637277">(844) 463-7277</a><span>Se habla español</span></p></div></div></section>',
    '<section class="related-strip"><div class="container related-strip-inner"><span>Keep exploring</span><a href="services.html">All service areas <b>↗</b></a><a href="about.html">About <b>↗</b></a><a href="contact.html">Contact <b>↗</b></a></div></section>'
  ].join("\n");
}

function renderHome() {
  const cards = services.map(serviceCard).join("\n");
  return [
    '<section class="hero-home" aria-labelledby="home-title">',
    '  <div class="hero-photo"><img src="assets/consultation-hero.jpg" alt="" fetchpriority="high"></div>',
    '  <div class="hero-overlay"></div><div class="hero-grid" aria-hidden="true"></div>',
    '  <svg class="hero-drawing" viewBox="0 0 920 600" aria-hidden="true"><path class="drawing-path path-one" d="M50 500C220 480 220 260 430 280s230 95 440-170"></path><path class="drawing-path path-two" d="M125 540C280 520 290 355 430 360s260-80 400-200"></path><circle class="drawing-node node-one" cx="430" cy="280" r="8"></circle><circle class="drawing-node node-two" cx="830" cy="110" r="8"></circle><circle class="drawing-orbit" cx="650" cy="265" r="155"></circle></svg>',
    '  <div class="container hero-home-inner"><div class="hero-copy reveal"><p class="eyebrow"><span class="eyebrow-pulse"></span> INFRA701 LEGAL / SEVEN SERVICE AREAS</p><h1 id="home-title">Where important moves<br><em>take shape.</em></h1><p class="hero-lead">Attorney-assisted immigration, business filings, tax preparation, data furnishing, credit-report support, and government contracting preparation.</p><div class="hero-actions"><a class="button button-primary" href="services.html">Explore all services <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 4l6 6-6 6"/></svg></a><a class="text-link" href="tel:+18444637277">Call (844) 463-7277 <span>↗</span></a></div><div class="hero-language"><span>ES</span><p>Se habla español</p><i></i><p>People · business · opportunity</p></div></div><div class="hero-index" aria-hidden="true"><span>01</span><i></i><span>INFRA701</span></div></div>',
    '  <a class="hero-scroll" href="#welcome"><span></span> Scroll to explore</a>',
    '</section>',
    '<section class="welcome-band" id="welcome"><div class="container welcome-grid"><p class="section-kicker"><span>01</span> One place to begin</p><div class="welcome-copy reveal"><h2>Different needs.<br><em>Clear next steps.</em></h2><p>From a family immigration matter to a business filing, tax return, credit report, or contract opportunity, the right next step starts with clear scope and the right professional involved.</p></div><div class="welcome-stamp" aria-hidden="true"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50"></circle><circle cx="60" cy="60" r="39"></circle><path d="M31 72h20l14-24 14 24h19"></path><circle cx="31" cy="72" r="3"></circle><circle cx="65" cy="48" r="3"></circle><circle cx="98" cy="72" r="3"></circle></svg></div></div></section>',
    '<section class="section-pad home-services"><div class="container"><div class="section-head reveal"><p class="section-kicker"><span>02 / Explore INFRA701</span></p><h2>Seven services.<br><em>One clear starting point.</em></h2><p>Choose a service area to see what is offered, what to ask, and how to start a conversation.</p></div><div class="service-grid">' + cards + '</div><div class="section-end-link"><a class="text-link" href="services.html">View all service areas <span>↗</span></a></div></div></section>',
    '<section class="dual-path"><div class="container dual-path-grid"><article class="path-panel path-immigration reveal"><p class="section-kicker">For people &amp; families</p><h2>Immigration law.<br><em>Credit report support.</em></h2><p>Get attorney-assisted immigration support or review help for credit information you believe is wrong.</p><a class="button button-light" href="immigration-law.html">Explore personal services <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 4l6 6-6 6"/></svg></a><span class="path-index">01</span></article><article class="path-panel path-contracting reveal"><p class="section-kicker">For businesses &amp; organizations</p><h2>Build the base.<br><em>Prepare to grow.</em></h2><p>Explore UCC filings, aged entities, tax preparation, data furnishing, and government-contracting preparation.</p><a class="button button-outline" href="services.html">Explore business services <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 4l6 6-6 6"/></svg></a><span class="path-index">02</span></article></div></section>',
    '<section class="scope-band home-scope"><div class="container scope-band-inner"><span class="scope-mark">i</span><div><p class="section-kicker">Clear scope matters</p><h2>Know who is doing the work.</h2><p>Confirm which licensed attorney, CPA, or other professional is involved, what the engagement includes, and which outcomes depend on an agency, lender, bureau, or filing office.</p></div><a class="text-link" href="about.html">About the firm <span>↗</span></a></div></section>',
    '<section class="section-pad home-last-cta"><div class="container home-cta reveal"><div><p class="section-kicker">03 / Start here</p><h2>Tell us what<br><em>you’re working on.</em></h2></div><div><p>Call to discuss service availability, professional involvement, and the information to prepare. Se habla español.</p><a class="button button-primary" href="tel:+18444637277">Call (844) 463-7277 <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3h3l2 4-2 2c1.2 2 2.5 3.3 4.5 4.5l2-2 4 2v3c0 1-1 1.5-2 1.5C8 18 2 12 2 5c0-1 .5-2 3-2Z"/></svg></a></div></div></section>'
  ].join("\n");
}

function renderAbout() {
  return [
    '<section class="page-hero interior-hero"><div class="interior-grid" aria-hidden="true"></div><div class="interior-orbit" aria-hidden="true"></div><div class="container interior-hero-inner"><p class="eyebrow"><span>01</span> About INFRA701 LEGAL</p><h1>Support for the<br><em>work ahead.</em></h1><p class="page-hero-lead">A multi-service practice built around practical preparation for individuals, families, business owners, lenders, data furnishers, and organizations pursuing public-sector opportunities.</p></div></section>',
    '<section class="section-pad about-story"><div class="container about-story-grid"><div><p class="section-kicker">02 / The firm</p><h2>Different service areas.<br><em>Clear responsibilities.</em></h2></div><div class="about-story-copy"><p>INFRA701 LEGAL brings together seven areas of support: attorney-assisted immigration, UCC filing, aged shelf corporations and entity filings, business and personal tax preparation, consumer and commercial data furnishing, credit-report review, and government-contracting preparation.</p><p>The professional involved depends on the service. Confirm attorney participation, CPA credentials, deliverables, fees, and written engagement terms directly with the office before work begins.</p><p>Every matter is different. Filing offices, taxing authorities, credit bureaus, lenders, and contracting agencies make their own decisions; no service can promise a specific result.</p></div></div></section>',
    '<section class="section-pad"><div class="container about-callout reveal"><span class="callout-mark">701</span><div><p class="section-kicker">The role, in plain language</p><h2>Start with the right<br><em>professional for the job.</em></h2><p>Ask who will handle your matter and whether they are licensed or qualified for the service you need. Attorney, CPA, and other professional roles are stated in the service agreement.</p><a class="button button-outline" href="services.html">Explore service areas <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 4l6 6-6 6"/></svg></a></div></div></section>'
  ].join("\n");
}

function renderContact() {
  return [
    '<section class="page-hero interior-hero"><div class="interior-grid" aria-hidden="true"></div><div class="interior-orbit" aria-hidden="true"></div><div class="container interior-hero-inner"><p class="eyebrow"><span>01</span> Contact INFRA701 LEGAL</p><h1>Let’s start with<br><em>a conversation.</em></h1><p class="page-hero-lead">Call the office to ask about immigration, business filings, taxes, data furnishing, credit-report support, or government contracting preparation. Se habla español.</p><div class="hero-actions"><a class="button button-primary" href="tel:+18444637277">Call (844) 463-7277 <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3h3l2 4-2 2c1 2 2.5 3.3 4.5 4.5l2-2 4 2v3c0 1-1 1.5-2 1.5C8 18 2 12 2 5c0-1 .5-2 3-2Z"/></svg></a><span class="text-link">Se habla español</span></div></div></section>',
    '<section class="section-pad contact-section"><div class="container contact-grid"><div class="contact-intro reveal"><p class="section-kicker">02 / Make an appointment</p><h2>Reach the office<br><em>directly.</em></h2><p>Call to talk through the service you’re looking for, ask who will provide it, and learn what information to prepare.</p><div class="contact-phone-card"><span class="phone-icon"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M14 7h8l4 9-5 4c2 5 5 8 10 10l4-5 9 4v8c0 3-2 5-5 5C22 41 7 26 7 12c0-3 2-5 7-5Z"/></svg></span><div><small>Call the office</small><a href="tel:+18444637277">(844) 463-7277</a></div></div><p class="spanish-note"><span>ES</span> Se habla español</p></div><div class="contact-form contact-note reveal"><div class="form-topline"><span>WHAT TO EXPECT</span><span>01 / 03</span></div><ol class="contact-steps"><li><span>01</span><div><strong>Tell us what you need</strong><p>Share the service area and the goal you’re working toward.</p></div></li><li><span>02</span><div><strong>Confirm the scope</strong><p>Ask who will provide the service and what is included.</p></div></li><li><span>03</span><div><strong>Agree on next steps</strong><p>Confirm fees, timing, documents, and how to share them securely.</p></div></li></ol><div class="form-privacy"><span>!</span><p>Do not send sensitive records until the office confirms a secure way to share them.</p></div><a class="button button-primary" href="tel:+18444637277">Call the office <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3h3l2 4-2 2c1.2 2 2.5 3.3 4.5 4.5l2-2 4 2v3c0 1-1 1.5-2 1.5C8 18 2 12 2 5c0-1 .5-2 3-2Z"/></svg></a></div></div></section>'
  ].join("\n");
}

const staticPages = [
  {
    file: "index.html",
    key: "home",
    active: "home",
    title: "Legal, business & tax services",
    description: "Attorney-assisted immigration, UCC filings, entity services, tax preparation, data furnishing, credit-report review, and government-contracting preparation.",
    content: renderHome()
  },
  {
    file: "services.html",
    key: "services",
    active: "services",
    title: "Service areas",
    description: "Explore seven service areas at INFRA701 LEGAL, including immigration, filings, taxes, data furnishing, credit-report review, and contracting preparation.",
    content: renderServicesOverview()
  },
  {
    file: "about.html",
    key: "about",
    active: "about",
    title: "About INFRA701 LEGAL",
    description: "Learn about the service areas offered by INFRA701 LEGAL and how to confirm professional scope for your matter.",
    content: renderAbout()
  },
  {
    file: "contact.html",
    key: "contact",
    active: "contact",
    title: "Contact INFRA701 LEGAL",
    description: "Call INFRA701 LEGAL at (844) 463-7277 to ask about service availability and appointments.",
    content: renderContact()
  }
];

for (const [index, service] of services.entries()) {
  staticPages.push({
    file: service.file,
    key: service.key,
    active: service.key,
    title: service.title,
    description: service.intro,
    content: renderServicePage(service, index)
  });
}

for (const page of staticPages) {
  const html = renderShell(page, page.content);
  await fs.writeFile(path.join(root, page.file), html, "utf8");
}

const urls = staticPages.map((page) => "  <url><loc>https://infra701legal.com/" + page.file.replace("index.html", "") + "</loc></url>").join("\n");
await fs.writeFile(path.join(root, "sitemap.xml"), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "\n</urlset>\n", "utf8");
await fs.writeFile(path.join(root, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: https://infra701legal.com/sitemap.xml\n", "utf8");
console.log("Generated " + staticPages.length + " static pages.");
