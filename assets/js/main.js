/* ==================================================================
   Jade — site behavior. Content comes from data.js.
=================================================================== */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover)").matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const serviceById = Object.fromEntries([...SERVICES, PRODUCTION].map((s) => [s.id, s]));
const currentPage = () => location.pathname.split("/").pop() || "index.html";
const store = {
  get(k, s = sessionStorage) { try { return s.getItem(k); } catch { return null; } },
  set(k, v, s = sessionStorage) { try { s.setItem(k, v); } catch {} },
  del(k, s = sessionStorage) { try { s.removeItem(k); } catch {} }
};
// Where a service "lives": production has its own page, the rest open on the home page.
const serviceHref = (s) => s.link || `index.html?service=${s.id}#services`;

/* ---------- fonts: try pairings from fonts.html ---------- */
function applyFont() {
  const fromUrl = new URLSearchParams(location.search).get("font");
  if (fromUrl) store.set("jadeFont", fromUrl, localStorage);
  const id = fromUrl || store.get("jadeFont", localStorage);
  const pair = FONT_PAIRS.find((p) => p.id === id);
  if (!pair || pair.id === FONT_PAIRS[0].id) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${pair.href}&display=swap`;
  document.head.appendChild(link);
  const root = document.documentElement.style;
  root.setProperty("--display", `"${pair.display}", Georgia, serif`);
  root.setProperty("--sans", `"${pair.sans}", "Helvetica Neue", sans-serif`);
  root.setProperty("--dw", pair.weight);
  root.setProperty("--optical", pair.optical || "auto");
}

/* ---------- drawing: the peacock ---------- */
// Tail feathers fan out from behind the body at (400, 440) in an 800-wide box.
const CX = 400;
const CY = 440;
const polar = (r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [CX + r * Math.sin(a), CY - r * Math.cos(a)];
};
const fx = (n) => n.toFixed(1);
let artCount = 0;

// A feather eye (ocellus), centered on (0,0) with its rounded end toward the tip.
function eyeShape(scale = 1) {
  const s = (n) => fx(n * scale);
  return `
    <path class="vane" d="M0,${s(58)} C${s(-30)},${s(40)} ${s(-38)},${s(-22)} 0,${s(-44)} C${s(38)},${s(-22)} ${s(30)},${s(40)} 0,${s(58)} Z"/>
    <circle class="halo" cy="${s(-4)}" r="${s(30)}"/>
    <circle class="ring" cy="${s(-4)}" r="${s(22)}"/>
    <circle class="iris-c" cy="${s(-6)}" r="${s(12)}"/>
    <circle class="pupil" cy="${s(-7)}" r="${s(5)}"/>`;
}

// One tail feather pointing up from (0,0): shaft, soft barbs and an eye near the tip.
function featherMarkup(L, eyeScale = 1) {
  const eyeY = -L * 0.86;
  const n = Math.round(L / 14);
  let barbs = "";
  for (let i = 0; i < n; i++) {
    const t = 0.1 + (0.72 * i) / n;
    const y = -t * L;
    const b = L * (0.02 + t * 0.075);
    barbs += `M0,${fx(y)} l${fx(-b)},${fx(-b * 0.8)} M0,${fx(y)} l${fx(b)},${fx(-b * 0.8)} `;
  }
  const s = (L / 330) * eyeScale;
  return `
    <path class="barbs" d="${barbs}"/>
    <line class="shaft" x1="0" y1="0" x2="0" y2="${fx(eyeY + 40 * s)}"/>
    <g transform="translate(0 ${fx(eyeY)})">${eyeShape(s)}</g>`;
}

// The bird itself: blue neck, crest, wings and feet, in front of its tail.
function peacockBody() {
  return `
    <g class="bird">
      <path class="b-leg" d="M390 484 L386 500 M386 500 L378 503 M386 500 L390 505 M410 484 L414 500 M414 500 L422 503 M414 500 L410 505"/>
      <path class="b-body" d="M352 478 C340 430 358 380 392 360 L408 360 C442 380 460 430 448 478 C430 490 370 490 352 478 Z"/>
      <path class="b-wing" d="M340 476 C326 436 338 392 376 366 C366 404 368 446 384 486 C366 488 350 484 340 476 Z"/>
      <path class="b-wing" d="M460 476 C474 436 462 392 424 366 C434 404 432 446 416 486 C434 488 450 484 460 476 Z"/>
      <path class="b-bar" d="M344 468 C340 440 350 410 368 388 M354 474 C350 446 356 420 371 400 M456 468 C460 440 450 410 432 388 M446 474 C450 446 444 420 429 400"/>
      <path class="b-neck" d="M385 292 C386 274 396 262 408 263 C418 264 422 276 417 288 C411 305 413 330 420 350 C428 372 426 398 400 406 C374 398 372 372 380 350 C387 330 389 305 385 292 Z"/>
      <path class="b-crest" d="M405 263 L396 238 M405 263 L404 233 M405 263 L413 238"/>
      <circle class="b-dot" cx="396" cy="237" r="3.4"/><circle class="b-dot" cx="404" cy="232" r="3.4"/><circle class="b-dot" cx="413" cy="237" r="3.4"/>
      <path class="b-face" d="M397 269 C402 266 409 267 413 272 M398 280 C403 282 408 281 411 278"/>
      <path class="b-beak" d="M388 272 L373 278 L388 283 Z"/>
      <circle cx="401" cy="274" r="2.8" fill="#000"/><circle cx="402" cy="273" r=".9" fill="#fff"/>
    </g>`;
}

// The full peacock. `services` become the six interactive feathers in the hero.
function peacockArt({ services = [], interactive = false, labels = false, bird = true, rows: rowCount = 3 } = {}) {
  const id = ++artCount;
  const rows = [
    { n: 15, L: 385, spread: 80, o: 0.55 },
    { n: 12, L: 298, spread: 74, o: 0.7 },
    { n: 9, L: 212, spread: 64, o: 0.85 }
  ].slice(0, rowCount);
  const serviceSlots = [2, 4, 6, 8, 10, 12];
  let feathers = "";
  let labelMarkup = "";
  rows.forEach((row, r) => {
    for (let i = 0; i < row.n; i++) {
      const a = -row.spread + ((2 * row.spread) / (row.n - 1)) * i;
      const slot = r === 0 ? serviceSlots.indexOf(i) : -1;
      const svc = slot >= 0 ? services[slot] : null;
      const d = Math.abs(i - (row.n - 1) / 2) + r * 3;
      const opacity = services.length ? (svc ? 1 : row.o) : Math.max(row.o, 0.8);
      const attrs = svc && interactive ? ` role="button" tabindex="0" data-id="${svc.id}" aria-label="${svc.name}"` : "";
      feathers += `
        <g class="plume${svc ? " svc" : ""}"${attrs} style="--a:${fx(a)}deg; --d:${fx(d)}; --o:${opacity}">
          <g transform="translate(${CX} ${CY})">${featherMarkup(row.L, svc ? 1.15 : 1)}</g>
        </g>`;
      if (svc && labels) {
        const [lx, ly] = polar(row.L + 26, a);
        labelMarkup += `<text class="feather-label" data-for="${svc.id}" x="${fx(lx)}" y="${fx(ly)}" text-anchor="middle">${svc.short}</text>`;
      }
    }
  });
  return `
    <defs><radialGradient id="glow${id}"><stop class="g1" offset="0"/><stop class="g2" offset="1"/></radialGradient></defs>
    <circle class="glow" cx="400" cy="300" r="330" fill="url(#glow${id})"/>
    <g class="train">${feathers}</g>
    ${labelMarkup}
    ${bird ? peacockBody() : ""}`;
}

const PEACOCK_VIEWBOX = "0 20 800 490";

function logoMark() {
  const rays = Array.from({ length: 13 }, (_, i) => {
    const a = ((-80 + (160 / 12) * i) * Math.PI) / 180;
    return `<line x1="${fx(50 + 13 * Math.sin(a))}" y1="${fx(60 - 13 * Math.cos(a))}" x2="${fx(50 + 46 * Math.sin(a))}" y2="${fx(60 - 46 * Math.cos(a))}" stroke="currentColor" stroke-width="1"/>`;
  }).join("");
  const eyes = [-60, -30, 0, 30, 60].map((d) => {
    const a = (d * Math.PI) / 180;
    return `<circle cx="${fx(50 + 44 * Math.sin(a))}" cy="${fx(60 - 44 * Math.cos(a))}" r="3.4" class="f-pu" stroke="currentColor" stroke-width="1.2"/>`;
  }).join("");
  return `
    <svg class="mark" viewBox="0 0 100 64" aria-hidden="true">
      <g class="rays">${rays}${eyes}</g>
    </svg>`;
}

function eyeIcon() {
  return `<svg class="s-icon" viewBox="-40 -64 80 116" aria-hidden="true">
    <path d="M0,-58 C30,-40 34,20 0,46 C-34,20 -30,-40 0,-58 Z" fill="none" stroke="currentColor" stroke-width="2.5"/>
    <circle r="22" class="icon-ring" stroke-width="3"/><circle r="11" class="icon-iris"/><circle r="4.5" fill="#000"/>
  </svg>`;
}

/* ---------- shared header + footer ---------- */
const NAV = [
  ["about.html", "About"],
  ["index.html#services", "Services"],
  ["color-jade.html", "The Color Jade Productions"],
  ["portfolio.html", "Portfolio"],
  ["work-with-jade.html", "Who I work with"]
];

function renderChrome() {
  const here = currentPage();
  const header = $("#site-header");
  if (header) {
    header.className = "site-header";
    header.innerHTML = `
      <div class="wrap">
        <a class="logo" href="index.html" aria-label="Jade, home">${logoMark()}<span class="logo-word">Jade</span></a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
        <nav class="nav" id="site-nav" aria-label="Main">
          ${NAV.map(([href, label]) => `<a href="${href}"${href === here ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
          <a class="nav-cta" href="contact.html"${here === "contact.html" ? ' aria-current="page"' : ""}>Let's talk</a>
        </nav>
      </div>`;
    const toggle = $(".menu-toggle", header);
    const nav = $("#site-nav", header);
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
      toggle.textContent = open ? "Close" : "Menu";
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
      }
    });
  }

  const footer = $("#site-footer");
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="wrap">
        <div class="footer-top">
          <div>
            <p class="footer-big">Got a story that <em>needs telling?</em></p>
            <a class="btn btn-peacock" href="contact.html">Let's talk</a>
          </div>
          <ul class="footer-links">
            <li><a href="index.html">Home</a></li>
            ${NAV.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join("")}
            <li><a href="contact.html">Let's talk</a></li>
          </ul>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} Jade and The Color Jade Productions</span>
          <a href="fonts.html">Font tester</a>
        </div>
      </div>`;
  }
}

/* ---------- cinematic page transitions ---------- */
function goTo(href, x = innerWidth / 2, y = innerHeight / 2) {
  if (reduceMotion) {
    location.href = href;
    return;
  }
  const iris = document.createElement("div");
  iris.className = "iris wide";
  iris.style.setProperty("--x", `${x}px`);
  iris.style.setProperty("--y", `${y}px`);
  document.body.appendChild(iris);
  void iris.offsetWidth;
  iris.classList.remove("wide");
  setTimeout(() => {
    store.set("iris", "1");
    location.href = href;
  }, 680);
}

function initTransitions() {
  if (store.get("iris") && !reduceMotion) {
    store.del("iris");
    const iris = document.createElement("div");
    iris.className = "iris";
    document.body.appendChild(iris);
    requestAnimationFrame(() => requestAnimationFrame(() => iris.classList.add("wide")));
    setTimeout(() => iris.remove(), 900);
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target || a.hasAttribute("download") || a.origin !== location.origin) return;
    if (a.pathname === location.pathname && a.search === location.search) return; // same page, just a hash
    e.preventDefault();
    goTo(a.href, e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
  });

  window.addEventListener("pageshow", (e) => {
    if (e.persisted) $$(".iris").forEach((el) => el.remove());
  });
}

/* ---------- service detail panel ---------- */
function openService(id, x, y) {
  const s = serviceById[id];
  const dialog = $("#service-dialog");
  if (!s || !dialog) return;
  const steps = s.process
    ? `<ol class="dialog-steps">${s.process.map((p) => `<li><strong>${p.step}</strong>${p.text}</li>`).join("")}</ol>`
    : "";
  dialog.innerHTML = `
    <div class="dialog-top" data-tone="${s.tone}">
      <button class="dialog-close" type="button" aria-label="Close">×</button>
      <h2 id="service-title">${s.name}</h2>
      <p class="verb">${s.verb}</p>
    </div>
    <div class="dialog-body">
      <div class="dialog-cols">
        <div>
          <p class="lead" style="font-size:1.15rem">${s.about}</p>
          <p class="good-for"><strong>Good for:</strong> ${s.goodFor}</p>
        </div>
        <div>
          <h3>What you can get</h3>
          <ul>${s.gets.map((g) => `<li>${g}</li>`).join("")}</ul>
        </div>
      </div>
      ${steps}
      <div class="dialog-actions">
        <a class="btn btn-black" href="contact.html?service=${s.id}">Start a ${s.name.toLowerCase()} project</a>
        <a class="btn" href="portfolio.html?service=${s.id}">See related work</a>
      </div>
    </div>`;
  dialog.setAttribute("aria-labelledby", "service-title");
  if (!dialog.open) dialog.showModal();
  const r = dialog.getBoundingClientRect();
  dialog.style.setProperty("--x", `${(x ?? r.left + r.width / 2) - r.left}px`);
  dialog.style.setProperty("--y", `${(y ?? r.top + r.height / 2) - r.top}px`);
  $(".dialog-close", dialog).addEventListener("click", () => dialog.close());
}

function initDialogs() {
  $$("dialog").forEach((d) => {
    d.addEventListener("click", (e) => {
      if (e.target === d) d.close();
    });
  });
}

/* ---------- home: intro + peacock ---------- */
function initPeacock() {
  const stage = $("#stage");
  if (!stage) return;
  stage.innerHTML = `<svg viewBox="${PEACOCK_VIEWBOX}" role="group" aria-label="Jade's peacock. Six of its feathers are her services.">${peacockArt({ services: SERVICES, interactive: true, labels: true })}</svg>`;

  const line = $("#hero-line");
  const caption = $("#caption");
  let current = null;

  function preview(id) {
    const s = serviceById[id];
    if (!s || current === id) return;
    current = id;
    $$(".plume.svc", stage).forEach((f) => f.classList.toggle("lift", f.dataset.id === id));
    $$(".feather-label", stage).forEach((t) => t.classList.toggle("on", t.dataset.for === id));
    caption.innerHTML = `
      <h2>${s.name}</h2>
      <p>${s.line}</p>
      <div class="caption-actions">
        <button class="btn btn-peacock" type="button" data-open="${s.id}">See the details</button>
        <button class="btn" type="button" data-next>Next feather</button>
      </div>`;
    line.textContent = s.verb;
    line.classList.remove("in");
    void line.offsetWidth;
    line.classList.add("in");
  }

  const eyeCenter = (id) => {
    const r = $(`.plume[data-id="${id}"] .ring`, stage).getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  };

  stage.addEventListener("pointerover", (e) => {
    const eye = e.target.closest(".plume[data-id]");
    if (eye && canHover) preview(eye.dataset.id);
  });
  stage.addEventListener("click", (e) => {
    const eye = e.target.closest(".plume[data-id]");
    if (!eye) return;
    // on touch screens the first tap previews, the second opens
    if (canHover || current === eye.dataset.id) openService(eye.dataset.id, ...eyeCenter(eye.dataset.id));
    else preview(eye.dataset.id);
  });
  stage.addEventListener("focusin", (e) => {
    const eye = e.target.closest(".plume[data-id]");
    if (eye) preview(eye.dataset.id);
  });
  stage.addEventListener("keydown", (e) => {
    const eye = e.target.closest(".plume[data-id]");
    if (eye && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openService(eye.dataset.id, ...eyeCenter(eye.dataset.id));
    }
  });
  caption.addEventListener("click", (e) => {
    const open = e.target.closest("[data-open]");
    if (open) {
      const r = open.getBoundingClientRect();
      openService(open.dataset.open, r.left + r.width / 2, r.top + r.height / 2);
    }
    if (e.target.closest("[data-next]")) {
      const i = SERVICES.findIndex((s) => s.id === current);
      preview(SERVICES[(i + 1) % SERVICES.length].id);
    }
  });

  // a gentle tilt that follows the pointer
  const fan = $(".train", stage);
  if (canHover && !reduceMotion) {
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      fan.style.transform = `rotate(${fx(dx * 4)}deg)`;
    });
    stage.addEventListener("pointerleave", () => (fan.style.transform = ""));
  }

  const unfurl = () => stage.classList.add("open");
  const deepLink = new URLSearchParams(location.search).get("service");
  if (reduceMotion || store.get("introSeen") || deepLink) setTimeout(unfurl, reduceMotion ? 0 : 200);
  else playIntro(unfurl);
}

function playIntro(done) {
  store.set("introSeen", "1");
  const intro = document.createElement("div");
  intro.className = "intro";
  intro.setAttribute("role", "region");
  intro.setAttribute("aria-label", "Intro");
  intro.innerHTML = `
    <div class="bar top"></div>
    <div class="credits-stack">
      <p class="credit-1">THE COLOR JADE PRODUCTIONS<small>presents</small></p>
      <p class="credit-3">Jade</p>
    </div>
    <div class="bar bottom"></div>
    <button class="skip-intro" type="button">Skip intro</button>`;
  document.body.appendChild(intro);
  document.documentElement.style.overflow = "hidden";

  let finished = false;
  const onKey = (e) => { if (e.key === "Escape") finish(); };
  function finish() {
    if (finished) return;
    finished = true;
    intro.classList.add("open");
    document.documentElement.style.overflow = "";
    document.removeEventListener("keydown", onKey);
    setTimeout(done, 300);
    setTimeout(() => intro.remove(), 1400);
  }
  document.addEventListener("keydown", onKey);
  $(".skip-intro", intro).addEventListener("click", finish);
  $(".skip-intro", intro).focus({ preventScroll: true });
  setTimeout(finish, 4400);
}

/* ---------- home: services, clients, people ---------- */
function initServiceGrid() {
  const grid = $("#service-grid");
  if (!grid) return;
  grid.innerHTML = SERVICES.map(
    (s) => `
    <li>
      <button class="service-card" type="button" data-tone="${s.tone}" data-open="${s.id}" aria-haspopup="dialog">
        ${eyeIcon()}
        <span class="s-name">${s.name}</span>
        <span class="s-line">${s.line}</span>
        <span class="s-more">See the details</span>
      </button>
    </li>`
  ).join("");
  grid.addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]");
    if (b) openService(b.dataset.open, e.clientX || undefined, e.clientY || undefined);
  });

  // index.html?service=brand#services opens that service's details
  const deepLink = new URLSearchParams(location.search).get("service");
  if (deepLink && serviceById[deepLink] && !serviceById[deepLink].link) {
    setTimeout(() => openService(deepLink), reduceMotion ? 0 : 500);
  }
}

function initClients() {
  const list = $("#client-list");
  if (!list) return;
  list.innerHTML = PORTFOLIO.map(
    (p) => `<li><a href="portfolio.html#${p.id}"><span class="c-name">${p.client}</span><span class="c-role">${p.role}</span></a></li>`
  ).join("");
}

function initPeopleTeaser() {
  const strip = $("#people-strip");
  if (!strip) return;
  strip.innerHTML = PEOPLE.slice(0, 3)
    .map(
      (p) => `
      <a href="work-with-jade.html#${p.id}" data-tone="${p.tone}">
        <h3>${p.label}</h3>
        <p>${p.feel}</p>
        <span class="more">See how I help</span>
      </a>`
    )
    .join("");
}

/* ---------- decorative fans (page heads, bands, photo slots) ---------- */
function decorate() {
  $$(".page-head").forEach((head) => {
    head.insertAdjacentHTML(
      "beforeend",
      `<svg class="head-fan stage open" viewBox="${PEACOCK_VIEWBOX}" aria-hidden="true">${peacockArt()}</svg>`
    );
  });
  $$("[data-fan]").forEach((el) => {
    el.insertAdjacentHTML(
      "beforeend",
      `<svg class="stage open" viewBox="${PEACOCK_VIEWBOX}" aria-hidden="true">${peacockArt({ bird: el.dataset.fan !== "plain" })}</svg>`
    );
  });
  $$(".ornament").forEach((el) => {
    el.innerHTML = `<svg viewBox="0 0 150 44"><g transform="translate(4 22) rotate(90)">${featherMarkup(140, 1.3)}</g></svg>`;
  });
}

/* ---------- portfolio ---------- */
function initPortfolio() {
  const grid = $("#work-grid");
  if (!grid) return;
  const filters = $("#filters");
  const count = $("#filter-count");
  const dialog = $("#work-dialog");
  const used = [...SERVICES, PRODUCTION].filter((s) => PORTFOLIO.some((p) => p.services.includes(s.id)));

  filters.innerHTML =
    `<button type="button" data-filter="all" aria-pressed="true">Everything</button>` +
    used.map((s) => `<button type="button" data-filter="${s.id}" aria-pressed="false">${s.name}</button>`).join("");

  grid.innerHTML = PORTFOLIO.map((p) => {
    const tone = serviceById[p.services[0]].tone;
    return `
      <article class="work-card" data-services="${p.services.join(" ")}" id="${p.id}">
        <button type="button" data-open="${p.id}" aria-haspopup="dialog">
          <div class="work-art" data-tone="${tone}">
            <svg viewBox="${PEACOCK_VIEWBOX}" aria-hidden="true" class="stage open">${peacockArt({ bird: false, rows: 2 })}</svg>
            <span class="soon">Photos coming soon</span>
          </div>
          <div class="work-meta">
            <h3>${p.client}</h3>
            <p class="role">${p.role}</p>
            <p>${p.summary}</p>
          </div>
        </button>
      </article>`;
  }).join("");

  function applyFilter(id) {
    let n = 0;
    $$(".work-card", grid).forEach((c) => {
      const show = id === "all" || c.dataset.services.split(" ").includes(id);
      c.classList.toggle("hide", !show);
      if (show) n++;
    });
    $$("button", filters).forEach((b) => b.setAttribute("aria-pressed", b.dataset.filter === id));
    const label = id === "all" ? "in total" : `in ${serviceById[id].name.toLowerCase()}`;
    count.textContent = `${n} ${n === 1 ? "project" : "projects"} ${label}`;
  }
  filters.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) applyFilter(b.dataset.filter);
  });
  const pre = new URLSearchParams(location.search).get("service");
  applyFilter(pre && used.some((s) => s.id === pre) ? pre : "all");

  function openWork(id, x, y) {
    const p = PORTFOLIO.find((w) => w.id === id);
    if (!p) return;
    const tone = serviceById[p.services[0]].tone;
    dialog.innerHTML = `
      <div class="dialog-top" data-tone="${tone}">
        <button class="dialog-close" type="button" aria-label="Close">×</button>
        <h2 id="work-title">${p.client}</h2>
        <p class="verb">${p.subtitle ? p.subtitle + ". " : ""}${p.role}</p>
      </div>
      <div class="dialog-body">
        <p class="lead" style="font-size:1.15rem">${p.summary}</p>
        <div class="dialog-cols">
          <div>
            <h3>What I did</h3>
            <ul>${p.did.map((d) => `<li>${d}</li>`).join("")}</ul>
          </div>
          <div>
            <h3>Services</h3>
            <div class="tags">${p.services.map((s) => `<a href="${serviceHref(serviceById[s])}">${serviceById[s].name}</a>`).join("")}</div>
          </div>
        </div>
        <p class="note">The full case study, with photos and results, is on its way.</p>
        <div class="dialog-actions"><a class="btn btn-black" href="contact.html?service=${p.services[0]}">Start something like this</a></div>
      </div>`;
    dialog.setAttribute("aria-labelledby", "work-title");
    if (!dialog.open) dialog.showModal();
    const r = dialog.getBoundingClientRect();
    dialog.style.setProperty("--x", `${(x ?? r.left + r.width / 2) - r.left}px`);
    dialog.style.setProperty("--y", `${(y ?? r.top + r.height / 2) - r.top}px`);
    $(".dialog-close", dialog).addEventListener("click", () => dialog.close());
  }
  grid.addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]");
    if (b) openWork(b.dataset.open, e.clientX || undefined, e.clientY || undefined);
  });
  dialog.addEventListener("close", () => {
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  });

  const fromHash = () => {
    const id = location.hash.slice(1);
    if (PORTFOLIO.some((p) => p.id === id)) openWork(id);
  };
  window.addEventListener("hashchange", fromHash);
  fromHash();
}

/* ---------- who I work with ---------- */
function initPeople() {
  const list = $("#people-list");
  if (!list) return;
  const panel = $("#people-panel");

  list.innerHTML = PEOPLE.map(
    (p, i) => `
    <button type="button" role="tab" id="tab-${p.id}" data-id="${p.id}"
      aria-selected="${i === 0}" aria-controls="people-panel" tabindex="${i === 0 ? 0 : -1}">
      <span class="d" aria-hidden="true"></span>${p.label}
    </button>`
  ).join("");

  function show(id, focus = false) {
    const p = PEOPLE.find((x) => x.id === id) || PEOPLE[0];
    $$("button", list).forEach((b) => {
      const on = b.dataset.id === p.id;
      b.setAttribute("aria-selected", on);
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    panel.dataset.tone = p.tone;
    panel.setAttribute("aria-labelledby", `tab-${p.id}`);
    const btn = p.tone === "peacock" ? "btn-black" : "btn-peacock";
    panel.innerHTML = `
      <h2>${p.label}</h2>
      <p class="feel">“${p.feel}”</p>
      <div class="panel-cols">
        <div>
          <h3>How I help</h3>
          <ul>${p.services.map((s) => `<li><a href="${serviceHref(serviceById[s])}">${serviceById[s].name}</a></li>`).join("")}</ul>
        </div>
        <div>
          <h3>What you walk away with</h3>
          <p class="leave">${p.leave}</p>
        </div>
      </div>
      <p class="example">I've done this for ${p.example}.</p>
      <a class="btn ${btn}" href="contact.html">That's me, let's talk</a>`;
    panel.classList.remove("in");
    void panel.offsetWidth;
    panel.classList.add("in");
  }

  list.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    show(b.dataset.id);
    history.replaceState(null, "", `#${b.dataset.id}`);
  });
  list.addEventListener("keydown", (e) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key)) return;
    e.preventDefault();
    const i = PEOPLE.findIndex((p) => p.id === document.activeElement.dataset.id);
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    show(PEOPLE[(i + dir + PEOPLE.length) % PEOPLE.length].id, true);
  });

  const fromHash = () => {
    const id = location.hash.slice(1);
    show(id);
    if (PEOPLE.some((p) => p.id === id)) $("#people")?.scrollIntoView();
  };
  window.addEventListener("hashchange", fromHash);
  fromHash();
}

/* ---------- Color Jade Productions: timeline + sleep stories ---------- */
function initTimeline() {
  const list = $("#timeline");
  if (!list) return;
  const out = $("#timeline-copy");
  const pick = (b) => {
    $$("button", list).forEach((x) => x.setAttribute("aria-pressed", x === b));
    out.textContent = b.dataset.say;
    out.classList.remove("in");
    void out.offsetWidth;
    out.classList.add("in");
  };
  list.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) pick(b);
  });
  if (canHover) list.addEventListener("mouseover", (e) => {
    const b = e.target.closest("button");
    if (b && b.getAttribute("aria-pressed") !== "true") pick(b);
  });
}

function initSleep() {
  const breath = $("#breath");
  if (!breath) return;
  const lines = $("#story-lines");
  const story = [
    "The lighthouse keeper turned the lamp down low.",
    "Outside, the sea breathed in, and out, and in again.",
    "No ships tonight. Nothing left to watch for.",
    "She set her boots by the door and let the quiet in.",
    "Somewhere far below, the tide was counting slowly to ten.",
    "And so, for now, was she."
  ];
  let timer = null;
  let i = 0;
  const label = breath.querySelector("span");
  const stop = () => {
    clearInterval(timer);
    timer = null;
    breath.classList.remove("playing");
    breath.setAttribute("aria-pressed", "false");
    label.textContent = "Press to begin";
  };
  const next = () => {
    if (i >= story.length) return stop();
    const span = document.createElement("span");
    span.textContent = story[i++];
    lines.appendChild(span);
    if (lines.children.length > 3) lines.firstElementChild.remove();
  };
  breath.addEventListener("click", () => {
    if (timer) return stop();
    lines.innerHTML = "";
    i = 0;
    breath.classList.add("playing");
    breath.setAttribute("aria-pressed", "true");
    label.textContent = "Breathe with me";
    next();
    timer = setInterval(next, 5000);
  });
}

/* ---------- forms ---------- */
function initForms() {
  const chipSet = $("#service-chips");
  if (chipSet) {
    const pre = new URLSearchParams(location.search).get("service");
    chipSet.innerHTML = [...SERVICES, PRODUCTION, { id: "sleep", name: "Sleep stories" }]
      .map(
        (s) => `
      <label>
        <input type="checkbox" name="services" value="${s.name}"${s.id === pre ? " checked" : ""}>
        <span>${s.name}</span>
      </label>`
      )
      .join("");
  }

  const form = $("#starter");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const err = $("#form-error");
      if (!data.get("name") || !data.get("email") || !data.get("details")) {
        err.textContent = "Add your name, email and a few words about the project so Jade can reply.";
        err.hidden = false;
        return;
      }
      err.hidden = true;
      const body = [
        `Name: ${data.get("name")}`,
        `Email: ${data.get("email")}`,
        `Business or project: ${data.get("org") || "-"}`,
        `Interested in: ${data.getAll("services").join(", ") || "Not sure yet"}`,
        `Timeline: ${data.get("timeline")}`,
        "",
        data.get("details")
      ].join("\n");
      location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`New project from ${data.get("name")}`)}&body=${encodeURIComponent(body)}`;
      $("#form-msg").hidden = false;
    });
  }

  const notify = $("#notify");
  if (notify) {
    notify.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = new FormData(notify).get("email");
      if (!email) return;
      location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Tell me when the sleep stories launch")}&body=${encodeURIComponent(`Please add ${email} to the list.`)}`;
      $("#notify-msg").hidden = false;
    });
  }
}

/* ---------- font tester page ---------- */
function initFontTester() {
  const grid = $("#font-grid");
  if (!grid) return;
  const current = store.get("jadeFont", localStorage) || FONT_PAIRS[0].id;
  FONT_PAIRS.forEach((p) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${p.href}&display=swap`;
    document.head.appendChild(link);
  });
  grid.innerHTML = FONT_PAIRS.map(
    (p) => `
    <article class="font-card${p.id === current ? " current" : ""}">
      <div style="font-family:'${p.sans}', sans-serif; font-weight:450">
        <p class="sample-h" style="font-family:'${p.display}', serif; font-weight:${p.weight}; font-optical-sizing:${p.optical || "auto"}">Hi, I'm Jade. <em>I tell stories people finish.</em></p>
        <p class="sample-p">Writer, creative director and founder of The Color Jade Productions. I help founders, creators and organizations say what they mean, beautifully.</p>
      </div>
      <div class="meta">
        <h2>${p.name}${p.id === current ? " (showing now)" : ""}</h2>
        <p class="names">${p.display} + ${p.sans}</p>
        <p>${p.note}</p>
        <a class="btn ${p.id === current ? "btn-black" : ""}" href="index.html?font=${p.id}">See the site in ${p.name.toLowerCase()}</a>
      </div>
    </article>`
  ).join("");
}

/* ---------- boot ---------- */
applyFont();
renderChrome();
initTransitions();
initDialogs();
initPeacock();
initServiceGrid();
initClients();
initPeopleTeaser();
decorate();
initPortfolio();
initPeople();
initTimeline();
initSleep();
initForms();
initFontTester();
