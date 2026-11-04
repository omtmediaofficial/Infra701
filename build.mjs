import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(await fs.readFile(path.join(root, "content", "services.json"), "utf8"));
const immigrationServices = data.filter((service) => service.key !== "contracting");
const contractingService = data.find((service) => service.key === "contracting");

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function navLink(label, href, key, active) {
  const current = key === active ? ' aria-current="page"' : "";
  return '<a href="' + href + '"' + current + ">" + label + "</a>";
}

function renderHeader(active) {
  const serviceLinks = immigrationServices.map((service) =>
    '<a href="' + service.file + '">' + escapeHtml(service.title) + '<span>↗</span></a>'
  ).join("");
  return [
    '<a class="skip-link" href="#main">Skip to content</a>',
    '<header class="site-header">',
    '  <div class="nav-shell">',
    '    <a class="brand" href="index.html" aria-label="Infrastructure 701 Legal home">',
    '      <span class="brand-crop"><img src="assets/infra701-neon-sign.jpg" alt="Infrastructure 701 Legal"></span>',
    '    </a>',
    '    <button class="nav-toggle" type="button" aria-controls="primary-nav" aria-expanded="false" aria-label="Open navigation"><span></span><span></span></button>',
    '    <nav class="primary-nav" id="primary-nav" aria-label="Main navigation">',
    '      ' + navLink("Home", "index.html", "home", active),
    '      <div class="nav-dropdown">',
    '        <button class="nav-menu-trigger" type="button" aria-expanded="false" aria-controls="immigration-menu">Immigration <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 6 5 5 5-5"/></svg></button>',
    '        <div class="nav-menu-panel" id="immigration-menu">' + navLink("All immigration services", "immigration-services.html", "services", active) + serviceLinks + '</div>',
    '      </div>',
    '      ' + navLink("Government contracting", contractingService.file, "contracting", active),
    '      ' + navLink("About", "about.html", "about", active),
    '      ' + navLink("Resources", "resources.html", "resources", active),
    '      <a class="nav-call" href="tel:+18444637277"><span>Call the office</span><b>(844) 463-7277</b></a>',
    '    </nav>',
    '  </div>',
    '</header>'
  ].join("\n");
}

function renderFooter() {
  return [
    '<footer class="site-footer">',
    '  <div class="footer-aurora" aria-hidden="true"></div>',
    '  <div class="container footer-main">',
    '    <a class="footer-lockup" href="index.html"><span class="footer-monogram">701</span><span><b>INFRASTRUCTURE 701</b><small>LEGAL</small></span></a>',
    '    <div class="footer-summary"><p>Clearer preparation for immigration paperwork and public-sector opportunities.</p><a href="contact.html">Start a conversation <span>↗</span></a></div>',
    '    <div class="footer-links"><div><strong>Explore</strong><a href="immigration-services.html">Immigration services</a><a href="' + contractingService.file + '">Government contracting</a><a href="about.html">About</a><a href="resources.html">Resources</a></div><div><strong>Contact</strong><a href="tel:+18444637277">(844) 463-7277</a><a href="contact.html">Appointments</a><span>Se habla español</span></div></div>',
    '  </div>',
    '  <div class="container footer-scope"><span class="scope-symbol">i</span><p>INFRA701 LEGAL describes its immigration providers as California Immigration Consultants, not attorneys. The firm does not provide legal advice or court representation.</p></div>',
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

const iconPaths = [
  '<path d="M8 3 2.8 6v6c0 3.2 2.1 5.5 5.2 7 3.1-1.5 5.2-3.8 5.2-7V6L8 3Z"/><path d="m5.6 10.6 1.6 1.7 3.2-3.7"/>',
  '<path d="M3 5h10M3 9h10M3 13h6"/><path d="m10 14 2 2 4-5"/>',
  '<path d="M2.5 6.5h11l-1 8h-9l-1-8Z"/><path d="M5 6.5V5a3 3 0 0 1 6 0v1.5M5.5 10h5"/>',
  '<path d="M3 3h7l4 4v10H3V3Z"/><path d="M10 3v4h4M5.5 11h6M5.5 14h6"/>',
  '<path d="M2.5 7 8 3l5.5 4v9H2.5V7Z"/><path d="M6 16v-5h4v5"/>',
  '<path d="M2.5 4.5h11v11h-11z"/><path d="m4.5 11 2.2 2.2 4.8-5.4"/>',
  '<path d="M2 14.5 8 3l6 11.5M4.2 10.5h7.6M3 14.5h10"/>',
  '<path d="M3 4.5h10v11H3z"/><path d="M5.5 8h5M5.5 11h5"/><path d="m9 14 1.5 1.5L14 12"/>',
  '<path d="M2 10h12M4 10V5l4-2 4 2v5M5 14h6M8 10v4"/>'
];

function serviceCard(service, index) {
  const number = String(index + 1).padStart(2, "0");
  const href = service.key === "contracting" ? service.file : service.file;
  return [
    '<article class="service-card reveal" style="--card-index:' + index + '">',
    '  <div class="service-card-top"><span>' + number + " / " + escapeHtml(service.label) + '</span><span class="service-card-icon" aria-hidden="true"><svg viewBox="0 0 16 20">' + iconPaths[index % iconPaths.length] + '</svg></span></div>',
    '  <h3><a href="' + href + '">' + escapeHtml(service.title) + '</a></h3>',
    '  <p>' + escapeHtml(service.intro) + '</p>',
    '  <a class="service-card-link" href="' + href + '">View service <span>↗</span></a>',
    '  <span class="service-watermark" aria-hidden="true">' + number + '</span>',
    '</article>'
  ].join("\n");
}

function renderServicesOverview() {
  const cards = immigrationServices.map(serviceCard).join("\n");
  return [
    '<section class="page-hero interior-hero">',
    '  <div class="interior-grid" aria-hidden="true"></div><div class="interior-orbit" aria-hidden="true"></div>',
    '  <div class="container interior-hero-inner"><p class="eyebrow"><span>01</span> Immigration support</p><h1>Immigration services<br><em>with the details in view.</em></h1><p class="page-hero-lead">Explore the document-preparation categories currently listed by INFRA701 LEGAL. Confirm service availability and scope with the office.</p><a class="button button-primary" href="contact.html">Talk through your needs <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 4l6 6-6 6"/></svg></a></div>',
    '</section>',
    '<section class="section-pad service-index"><div class="container"><div class="section-head reveal"><p class="section-kicker"><span>02 / Service index</span></p><h2>Find the support<br><em>you’re looking for.</em></h2><p>These categories reflect the services named on the current website. The office can confirm what is available for your situation.</p></div><div class="service-grid">' + cards + '</div></div></section>',
    '<section class="scope-band"><div class="container scope-band-inner"><span class="scope-mark">i</span><div><p class="section-kicker">Immigration consultant scope</p><h2>Document support, clearly defined.</h2><p>INFRA701 LEGAL states that its immigration providers are California Immigration Consultants, not attorneys. They do not provide legal advice or court representation.</p></div><a class="text-link" href="about.html">About the firm <span>↗</span></a></div></section>',
    '<section class="section-pad"><div class="container split-cta reveal"><div><p class="section-kicker">Ready to talk?</p><h2>Start with a<br><em>clear conversation.</em></h2></div><div><p>Call the office to confirm service availability, required information, and next steps.</p><a class="button button-outline" href="tel:+18444637277">Call (844) 463-7277 <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3h3l2 4-2 2c1.2 2 2.5 3.3 4.5 4.5l2-2 4 2v3c0 1-1 1.5-2 1.5C8 18 2 12 2 5c0-1 .5-2 3-2Z"/></svg></a></div></div></section>'
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
  const isContracting = service.key === "contracting";
  const eyebrow = isContracting ? "Business preparation / New service area" : "Immigration support / " + service.label;
  const notice = isContracting
    ? '<p>This service is presented separately from immigration document support. Contact the office to confirm fit and scope.</p>'
    : '<p>INFRA701 LEGAL identifies its immigration providers as California Immigration Consultants, not attorneys. The firm does not provide legal advice or court representation.</p>';
  const listTitle = isContracting ? "A practical preparation rhythm" : "What this service page covers";
  return [
    '<section class="page-hero interior-hero detail-hero">',
    '  <div class="interior-grid" aria-hidden="true"></div><div class="interior-orbit" aria-hidden="true"></div>',
    '  <div class="container interior-hero-inner"><p class="eyebrow"><span>' + String(index + 1).padStart(2, "0") + '</span> ' + escapeHtml(eyebrow) + '</p><h1>' + escapeHtml(service.hero) + '</h1><p class="page-hero-lead">' + escapeHtml(service.intro) + '</p><div class="hero-actions"><a class="button button-primary" href="contact.html">' + (isContracting ? "Discuss an opportunity" : "Ask about this service") + ' <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 4l6 6-6 6"/></svg></a><a class="text-link" href="tel:+18444637277">Call (844) 463-7277 <span>↗</span></a></div></div>',
    '</section>',
    '<section class="section-pad detail-section"><div class="container">',
    '  <div class="detail-overview reveal"><div><p class="section-kicker">01 / ' + escapeHtml(service.label) + '</p><h2>' + escapeHtml(service.title) + '</h2></div><div class="detail-overview-copy"><p>' + escapeHtml(service.intro) + '</p><div class="chip-row">' + chips + '</div></div></div>',
    '  <div class="detail-card-grid">' + cards + '</div>',
    '  <div class="detail-note reveal"><span class="note-emblem">i</span><div><strong>' + (isContracting ? "Separate service area" : "A note on scope") + '</strong>' + notice + '</div></div>',
    '</div></section>',
    '<section class="detail-lower"><div class="container detail-lower-grid"><div class="detail-lower-heading"><p class="section-kicker">02 / Next step</p><h2>Start with the<br><em>right questions.</em></h2></div><div class="detail-lower-copy"><p>' + escapeHtml(service.note) + '</p><a class="button button-outline" href="contact.html">Contact INFRA701 LEGAL <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 4l6 6-6 6"/></svg></a><p class="detail-phone"><a href="tel:+18444637277">(844) 463-7277</a><span>Se habla español</span></p></div></div></section>',
    '<section class="related-strip"><div class="container related-strip-inner"><span>Keep exploring</span><a href="immigration-services.html">All services <b>↗</b></a><a href="resources.html">Forms &amp; resources <b>↗</b></a><a href="about.html">About the firm <b>↗</b></a></div></section>'
  ].join("\n");
}

function renderHome() {
  const featured = immigrationServices.slice(0, 6).map(serviceCard).join("\n");
  return [
    '<section class="hero-home" aria-labelledby="home-title">',
    '  <div class="hero-photo"><img src="assets/consultation-hero.jpg" alt="" fetchpriority="high"></div>',
    '  <div class="hero-overlay"></div><div class="hero-grid" aria-hidden="true"></div>',
    '  <svg class="hero-drawing" viewBox="0 0 920 600" aria-hidden="true"><path class="drawing-path path-one" d="M50 500C220 480 220 260 430 280s230 95 440-170"></path><path class="drawing-path path-two" d="M125 540C280 520 290 355 430 360s260-80 400-200"></path><circle class="drawing-node node-one" cx="430" cy="280" r="8"></circle><circle class="drawing-node node-two" cx="830" cy="110" r="8"></circle><circle class="drawing-orbit" cx="650" cy="265" r="155"></circle></svg>',
    '  <div class="container hero-home-inner"><div class="hero-copy reveal"><p class="eyebrow"><span class="eyebrow-pulse"></span> INFRA701 LEGAL / IMMIGRATION DOCUMENT SUPPORT</p><h1 id="home-title">Immigration documents.<br><em>Prepared with purpose.</em></h1><p class="hero-lead">Document preparation, certified translations, and practical support for individuals and families. A separate path for Government Contracting Preparation.</p><div class="hero-actions"><a class="button button-primary" href="immigration-services.html">Explore immigration services <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 4l6 6-6 6"/></svg></a><a class="text-link" href="tel:+18444637277">Call (844) 463-7277 <span>↗</span></a></div><div class="hero-language"><span>ES</span><p>Se habla español</p><i></i><p>California immigration document support</p></div></div><div class="hero-index" aria-hidden="true"><span>01</span><i></i><span>INFRA701</span></div></div>',
    '  <a class="hero-scroll" href="#welcome"><span></span> Scroll to explore</a>',
    '</section>',
    '<section class="welcome-band" id="welcome"><div class="container welcome-grid"><p class="section-kicker"><span>01</span> A steady place to begin</p><div class="welcome-copy reveal"><h2>Bring the details<br><em>into focus.</em></h2><p>Immigration paperwork can involve forms, supporting records, translations, and important personal history. INFRA701 LEGAL describes its role as helping prepare and organize documents with care.</p></div><div class="welcome-stamp" aria-hidden="true"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50"></circle><circle cx="60" cy="60" r="39"></circle><path d="M31 72h20l14-24 14 24h19"></path><circle cx="31" cy="72" r="3"></circle><circle cx="65" cy="48" r="3"></circle><circle cx="98" cy="72" r="3"></circle></svg></div></div></section>',
    '<section class="section-pad home-services"><div class="container"><div class="section-head reveal"><p class="section-kicker"><span>02 / Immigration support</span></p><h2>Support across<br><em>different paths.</em></h2><p>Explore the immigration categories listed by INFRA701 LEGAL. Contact the office to confirm current availability and scope.</p></div><div class="service-grid">' + featured + '</div><div class="section-end-link"><a class="text-link" href="immigration-services.html">View all immigration services <span>↗</span></a></div></div></section>',
    '<section class="dual-path"><div class="container dual-path-grid"><article class="path-panel path-immigration reveal"><p class="section-kicker">For individuals &amp; families</p><h2>Immigration<br><em>document support.</em></h2><p>Find information about the visa and petition categories currently listed on the site.</p><a class="button button-light" href="immigration-services.html">Explore services <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 4l6 6-6 6"/></svg></a><span class="path-index">01</span></article><article class="path-panel path-contracting reveal"><p class="section-kicker">For organizations</p><h2>Government<br><em>contracting preparation.</em></h2><p>A separate preparation service for organizations pursuing public-sector opportunities.</p><a class="button button-outline" href="' + contractingService.file + '">Explore preparation <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 4l6 6-6 6"/></svg></a><span class="path-index">02</span></article></div></section>',
    '<section class="scope-band home-scope"><div class="container scope-band-inner"><span class="scope-mark">i</span><div><p class="section-kicker">Clear scope matters</p><h2>Immigration support, within its role.</h2><p>The site describes its immigration providers as California Immigration Consultants, not attorneys. INFRA701 LEGAL does not provide legal advice or court representation.</p></div><a class="text-link" href="about.html">About the firm <span>↗</span></a></div></section>',
    '<section class="section-pad home-last-cta"><div class="container home-cta reveal"><div><p class="section-kicker">04 / Start here</p><h2>Ask about the<br><em>next step.</em></h2></div><div><p>Call to discuss service availability, documents, or appointment options. Se habla español.</p><a class="button button-primary" href="tel:+18444637277">Call (844) 463-7277 <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3h3l2 4-2 2c1.2 2 2.5 3.3 4.5 4.5l2-2 4 2v3c0 1-1 1.5-2 1.5C8 18 2 12 2 5c0-1 .5-2 3-2Z"/></svg></a></div></div></section>'
  ].join("\n");
}

async function readContent(name) {
  return fs.readFile(path.join(root, "content", name), "utf8");
}

function renderAbout() {
  return [
    '<section class="page-hero interior-hero"><div class="interior-grid" aria-hidden="true"></div><div class="interior-orbit" aria-hidden="true"></div><div class="container interior-hero-inner"><p class="eyebrow"><span>01</span> About INFRA701 LEGAL</p><h1>Grounded in the<br><em>details of the work.</em></h1><p class="page-hero-lead">Immigration document support shaped around careful preparation, clear organization, and a defined professional role.</p></div></section>',
    '<section class="section-pad about-story"><div class="container about-story-grid"><div><p class="section-kicker">02 / The firm</p><h2>Practical support.<br><em>Clear boundaries.</em></h2></div><div class="about-story-copy"><p>INFRA701 LEGAL provides immigration document preparation, certified translations, and same-day marriage facilitation. Its service list covers support for individuals, families, and businesses preparing immigration materials.</p><p>The firm identifies its immigration providers as California Immigration Consultants. They are not attorneys and do not provide legal advice or court representation.</p><p>Government Contracting Preparation is presented as a separate service area for organizations. Contact the team to confirm the current scope and process.</p></div></div></section>',
    '<section class="section-pad"><div class="container about-callout reveal"><span class="callout-mark">701</span><div><p class="section-kicker">The role, in plain language</p><h2>Document support<br><em>is not legal representation.</em></h2><p>For legal advice or court representation, speak with a licensed attorney. Contact INFRA701 LEGAL to confirm what document-preparation services are available.</p><a class="button button-outline" href="tel:+18444637277">Call the office <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3h3l2 4-2 2c1.2 2 2.5 3.3 4.5 4.5l2-2 4 2v3c0 1-1 1.5-2 1.5C8 18 2 12 2 5c0-1 .5-2 3-2Z"/></svg></a></div></div></section>'
  ].join("\n");
}

function renderResources() {
  return [
    '<section class="page-hero interior-hero"><div class="interior-grid" aria-hidden="true"></div><div class="interior-orbit" aria-hidden="true"></div><div class="container interior-hero-inner"><p class="eyebrow"><span>01</span> Forms &amp; resources</p><h1>Start with the<br><em>right information.</em></h1><p class="page-hero-lead">Download the forms currently linked from the INFRA701 LEGAL website. Contact the office to confirm which resource applies and how to return it.</p></div></section>',
    '<section class="section-pad resources-section"><div class="container"><div class="section-head reveal"><p class="section-kicker"><span>02 / Download library</span></p><h2>Prepare at your<br><em>own pace.</em></h2><p>These blank materials are provided for preparation. Completing a form does not create a professional relationship or guarantee an outcome.</p></div><div class="resource-grid"><article class="resource-card reveal"><div class="resource-card-head"><span class="resource-type">PDF / 8 PAGES</span><span class="resource-icon"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 6h18l8 8v28H12V6Z"></path><path d="M30 6v9h8M17 25h16M17 31h16M17 37h10"></path></svg></span></div><h3>Immigration Intake Form</h3><p>A broad intake worksheet covering identity, contact details, immigration history, family, addresses, employment, and related background.</p><a class="button button-outline" href="assets/forms/IMMIGRATION-INTAKE-FORM.pdf" download>Download PDF <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v10m-4-4 4 4 4-4M4 17h12"/></svg></a></article><article class="resource-card reveal"><div class="resource-card-head"><span class="resource-type">DOCX / I-589 QUESTIONNAIRE</span><span class="resource-icon"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 6h18l8 8v28H12V6Z"></path><path d="M30 6v9h8M17 25h16M17 31h16M17 37h10"></path></svg></span></div><h3>Asylum Questionnaire</h3><p>A questionnaire covering applicant, spouse, children, and background information. Contact the office to confirm service scope before completing or submitting it.</p><a class="button button-outline" href="assets/forms/I-589_Asylum_Questionnaire.docx" download>Download DOCX <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v10m-4-4 4 4 4-4M4 17h12"/></svg></a></article></div></div></section>',
    '<section class="sensitive-note"><div class="container sensitive-note-inner"><span class="scope-mark">!</span><div><p class="section-kicker">Protect your information</p><h2>These forms request sensitive personal details.</h2><p>They may ask for Social Security, passport, immigration, family, employment, criminal-history, and asylum-related information. Ask the office how to submit completed documents securely. Do not send completed forms through this website.</p></div></div></section>',
    '<section class="section-pad"><div class="container resource-cta reveal"><p class="section-kicker">Questions about a form?</p><h2>Call before you<br><em>send documents.</em></h2><a class="button button-primary" href="tel:+18444637277">Call (844) 463-7277 <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3h3l2 4-2 2c1.2 2 2.5 3.3 4.5 4.5l2-2 4 2v3c0 1-1 1.5-2 1.5C8 18 2 12 2 5c0-1 .5-2 3-2Z"/></svg></a></div></section>'
  ].join("\n");
}

function renderContact() {
  return [
    '<section class="page-hero interior-hero"><div class="interior-grid" aria-hidden="true"></div><div class="interior-orbit" aria-hidden="true"></div><div class="container interior-hero-inner"><p class="eyebrow"><span>01</span> Contact INFRA701 LEGAL</p><h1>Let’s start with<br><em>a conversation.</em></h1><p class="page-hero-lead">Call the office to ask about appointments, immigration document support, or Government Contracting Preparation. Se habla español.</p><div class="hero-actions"><a class="button button-primary" href="tel:+18444637277">Call (844) 463-7277 <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3h3l2 4-2 2c1 2 2.5 3.3 4.5 4.5l2-2 4 2v3c0 1-1 1.5-2 1.5C8 18 2 12 2 5c0-1 .5-2 3-2Z"/></svg></a><span class="text-link">Se habla español</span></div></div></section>',
    '<section class="section-pad contact-section"><div class="container contact-grid"><div class="contact-intro reveal"><p class="section-kicker">02 / Make an appointment</p><h2>Reach the office<br><em>directly.</em></h2><p>Call to talk through the service you’re looking for, ask about current availability, and find out what information to prepare.</p><div class="contact-phone-card"><span class="phone-icon"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M14 7h8l4 9-5 4c2 5 5 8 10 10l4-5 9 4v8c0 3-2 5-5 5C22 41 7 26 7 12c0-3 2-5 7-5Z"/></svg></span><div><small>Call the office</small><a href="tel:+18444637277">(844) 463-7277</a></div></div><p class="spanish-note"><span>ES</span> Se habla español</p></div><div class="contact-form contact-note reveal"><div class="form-topline"><span>WHAT TO EXPECT</span><span>01 / 03</span></div><ol class="contact-steps"><li><span>01</span><div><strong>Tell us what you need</strong><p>Immigration document support, translation, marriage facilitation, or contracting preparation.</p></div></li><li><span>02</span><div><strong>Confirm the scope</strong><p>Ask what services are available and what the preparation includes.</p></div></li><li><span>03</span><div><strong>Agree on next steps</strong><p>Learn which details to bring and how to share them securely.</p></div></li></ol><div class="form-privacy"><span>!</span><p>Please don’t send personal documents or sensitive information until the office confirms a secure way to share them.</p></div><a class="button button-primary" href="tel:+18444637277">Call the office <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3h3l2 4-2 2c1.2 2 2.5 3.3 4.5 4.5l2-2 4 2v3c0 1-1 1.5-2 1.5C8 18 2 12 2 5c0-1 .5-2 3-2Z"/></svg></a></div></div></section>'
  ].join("\n");
}

const staticPages = [
  {
    file: "index.html",
    key: "home",
    active: "home",
    title: "Immigration document support",
    description: "Immigration document preparation, certified translation, and Government Contracting Preparation from Infrastructure 701 Legal.",
    content: renderHome()
  },
  {
    file: "immigration-services.html",
    key: "services",
    active: "services",
    title: "Immigration services",
    description: "Explore immigration document-preparation categories currently listed by INFRA701 LEGAL.",
    content: renderServicesOverview()
  },
  {
    file: "about.html",
    key: "about",
    active: "about",
    title: "About Infrastructure 701 Legal",
    description: "Learn about INFRA701 LEGAL's immigration document-support role and stated professional scope.",
    content: renderAbout()
  },
  {
    file: "resources.html",
    key: "resources",
    active: "resources",
    title: "Immigration forms and resources",
    description: "Download the Immigration Intake Form and I-589 Asylum Questionnaire linked from INFRA701 LEGAL.",
    content: renderResources()
  },
  {
    file: "contact.html",
    key: "contact",
    active: "contact",
    title: "Contact INFRA701 LEGAL",
    description: "Call INFRA701 LEGAL at (844) 463-7277 to ask about appointments and service availability.",
    content: renderContact()
  }
];

for (const [index, service] of data.entries()) {
  staticPages.push({
    file: service.file,
    key: service.key,
    active: service.key === "contracting" ? "contracting" : "services",
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

