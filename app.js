/**
 * FGAG 55 GODINA - GENERATIVNA WEB-ČESTITKA
 * "Znanje koje mijenja prostor" (1971. – 2026.)
 * 
 * Implementacija:
 * - Podloga: Tamni tehnički ugljen (#12141a) s koordinatnom mrežom
 * - Inicijalna suspenzija (START_DELAY = 1.00s):
 *   Garantirano čekanje učitavanja svih fontova i resursa (onPageFullyReady)
 *   + dvostruki requestAnimationFrame kako bi i najsporija računala/mobiteli
 *   prije početka animacije u potpunosti naslikali početni kadar (nema preskakanja).
 * - Optički nitni križ & reticle (HUD) na točki znaka (50% X, 45.4% Y)
 * - Singularnost / Big Bang: Obojana ploha pozadine silovito eruptira kroz
 *   generativno odabranu geometriju (Arhitektonski romb 45°, Kružni iris, Pravokutnik ili Tektonski rasjed)
 * - 58-70 arhitektonskih geometrijskih elemenata eksplodira u prostor s bogatim kontrastom i mjerilima
 * - Formiranje vodenog žiga s točno 0,00 px razmaka (Zero Gap)
 * - Završni kadrovi: Jubilej 55, godine 1971. – 2026., tekst čestitke, horizontalne crte,
 *   službeni institucionalni logotip s tekstom, slogan i dekanov potpis.
 */

(function () {
  'use strict';

  // Inicijalna pauza (1 sekunda za stabilno učitavanje na svim uređajima)
  const START_DELAY = 1.0;

  // Spriječi GSAP da preskače sekunde ako je CPU kratkotrajno zauzet inicijalnim crtanjem
  if (window.gsap && gsap.ticker) {
    gsap.ticker.lagSmoothing(1000, 16);
  }

  // =========================================================================
  // 1. DEFINICIJA SLUŽBENIH PALETA I RESURSA
  // =========================================================================

  const OFFICIAL_PALETTES = [
    {
      id: 'P01',
      name: 'P01 Jubilejska žuta',
      bg: '#F7B512',
      ink: '#373435',
      watermark: '#F5DE8C',
      primaryShape: '#FFEFC6',
      secondaryShape: '#FBDE76',
      accentShape: '#373435',
      isDark: false
    },
    {
      id: 'P02',
      name: 'P02 Crna i žuta',
      bg: '#1A1A1A',
      ink: '#FFFFFF',
      watermark: '#2D2D2D',
      primaryShape: '#FDB913',
      secondaryShape: '#FBDE76',
      accentShape: '#FFEFC6',
      isDark: true
    },
    {
      id: 'P03',
      name: 'P03 Crvena',
      bg: '#EF4E52',
      ink: '#373435',
      watermark: '#F69896',
      primaryShape: '#FBCABD',
      secondaryShape: '#F69896',
      accentShape: '#22252A',
      isDark: false
    },
    {
      id: 'P04',
      name: 'P04 Zelena',
      bg: '#6AC17B',
      ink: '#373435',
      watermark: '#A9D7AE',
      primaryShape: '#CDE7CB',
      secondaryShape: '#A9D7AE',
      accentShape: '#18382B',
      isDark: false
    },
    {
      id: 'P05',
      name: 'P05 Magenta',
      bg: '#EF5CA1',
      ink: '#373435',
      watermark: '#F8C2DA',
      primaryShape: '#FBD6E6',
      secondaryShape: '#F8C2DA',
      accentShape: '#24141E',
      isDark: false
    },
    {
      id: 'P06',
      name: 'P06 Svijetloplava',
      bg: '#99BCCB',
      ink: '#373435',
      watermark: '#BCDAE7',
      primaryShape: '#D6E2E9',
      secondaryShape: '#BCDAE7',
      accentShape: '#1A2E3B',
      isDark: false
    },
    {
      id: 'P07',
      name: 'P07 Navy',
      bg: '#524FA1',
      ink: '#FFFFFF',
      watermark: '#6B67BA',
      primaryShape: '#C7C4E2',
      secondaryShape: '#A5A9D5',
      accentShape: '#FFFFFF',
      isDark: true
    }
  ];

  // Geometrije pozadinske ekspanzije (Prijedlog 2)
  const BACKGROUND_GEOMETRIES = [
    { id: 'diamond', name: 'Arhitektonski romb (45°)' },
    { id: 'iris', name: 'Kružni geodetski iris' },
    { id: 'rect', name: 'Modularni pravokutnik' },
    { id: 'fracture', name: 'Tektonski rasjed' }
  ];

  // Središte singularnosti i položaj vodenog žiga
  const ORIGIN_X = 50.0;
  const ORIGIN_Y = 45.4;

  function getBackgroundClipPath(geomId, p) {
    if (p <= 0) {
      return `polygon(${ORIGIN_X}% ${ORIGIN_Y}%, ${ORIGIN_X}% ${ORIGIN_Y}%, ${ORIGIN_X}% ${ORIGIN_Y}%, ${ORIGIN_X}% ${ORIGIN_Y}%)`;
    }
    const progress = Math.max(0, Math.min(1, p));

    if (geomId === 'diamond') {
      const r = progress * 135;
      const top = `${ORIGIN_X}% ${ORIGIN_Y - r * 1.42}%`;
      const right = `${ORIGIN_X + r}% ${ORIGIN_Y}%`;
      const bottom = `${ORIGIN_X}% ${ORIGIN_Y + r * 1.42}%`;
      const left = `${ORIGIN_X - r}% ${ORIGIN_Y}%`;
      return `polygon(${top}, ${right}, ${bottom}, ${left})`;
    } else if (geomId === 'iris') {
      const r = progress * 145;
      return `circle(${r}% at ${ORIGIN_X}% ${ORIGIN_Y}%)`;
    } else if (geomId === 'rect') {
      const rx = progress * 110;
      const ry = progress * 110;
      const l = Math.max(0, ORIGIN_X - rx);
      const r = Math.min(100, ORIGIN_X + rx);
      const t = Math.max(0, ORIGIN_Y - ry);
      const b = Math.min(100, ORIGIN_Y + ry);
      return `polygon(${l}% ${t}%, ${r}% ${t}%, ${r}% ${b}%, ${l}% ${b}%)`;
    } else {
      // fracture: kosi tektonski rez
      const r = progress * 145;
      const p1 = `${ORIGIN_X - r * 1.2}% ${ORIGIN_Y - r * 0.8}%`;
      const p2 = `${ORIGIN_X + r * 1.5}% ${ORIGIN_Y - r * 0.2}%`;
      const p3 = `${ORIGIN_X + r * 0.8}% ${ORIGIN_Y + r * 1.4}%`;
      const p4 = `${ORIGIN_X - r * 1.5}% ${ORIGIN_Y + r * 0.4}%`;
      return `polygon(${p1}, ${p2}, ${p3}, ${p4})`;
    }
  }

  // Izvorne 3 vektorske geometrije znaka FGAG za eksploziju i dekonstrukciju
  const SVG_SHAPES = [
    // 0: Lijevi poligon (peterokutna/šesterokutna prizma)
    `<svg viewBox="0 0 93.64 65.81" preserveAspectRatio="xMidYMid meet">
      <polygon points="63.48 0 0 21.94 0 65.81 51.45 65.81 93.64 32.91 93.64 0 63.48 0" />
    </svg>`,
    // 1: Središnji trokutasti klin (kosi luk)
    `<svg viewBox="0 0 95.68 67.13" preserveAspectRatio="xMidYMid meet">
      <polygon points="43.88 0 0 34.23 0 67.13 95.68 67.13 43.88 0" />
    </svg>`,
    // 2: Desni segment (četvrtina luka s vertikalom)
    `<svg viewBox="0 0 71.1 65.85" preserveAspectRatio="xMidYMid meet">
      <path d="M54.84,0C21.94,0,0,21.94,0,54.85v11h71.1V0Z" />
    </svg>`
  ];

  // =========================================================================
  // 2. DETERMINISTIČKI PRNG (Mulberry32)
  // =========================================================================
  // 2. SHUFFLE BAG RANDOMIZER (FISHER-YATES CIKLUS BEZ PONAVLJANJA)
  // =========================================================================

  const SHUFFLE_BAG_KEY = 'fgag_palette_shuffle_bag';
  const LAST_PALETTE_KEY = 'fgag_last_palette_id';
  let memoryBag = [];
  let memoryLastId = null;

  function getNextPaletteFromBag() {
    let bag = [];
    let lastId = null;

    // 1. Pokušaj čitanja iz sessionStorage uz memorijski fallback
    try {
      const stored = sessionStorage.getItem(SHUFFLE_BAG_KEY);
      if (stored) {
        bag = JSON.parse(stored);
      }
      lastId = sessionStorage.getItem(LAST_PALETTE_KEY);
    } catch (e) {
      bag = memoryBag;
      lastId = memoryLastId;
    }

    // 2. Ako je vrećica prazna ili neispravna, stvori novi promiješani krug (Fisher-Yates)
    if (!Array.isArray(bag) || bag.length === 0) {
      bag = OFFICIAL_PALETTES.map(p => p.id);

      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = bag[i];
        bag[i] = bag[j];
        bag[j] = temp;
      }

      // Ako je prva paleta u novom krugu jednaka zadnjoj iz prethodnog,
      // zamijeni je s nekom drugom kako se ista boja NIKADA ne bi ponovila uzastopno!
      if (bag.length > 1 && bag[0] === lastId) {
        const swapIdx = 1 + Math.floor(Math.random() * (bag.length - 1));
        const temp = bag[0];
        bag[0] = bag[swapIdx];
        bag[swapIdx] = temp;
      }
    }

    // 3. Uzmi sljedeću paletu iz vrećice
    const nextId = bag.shift();

    // 4. Spremi stanje
    try {
      sessionStorage.setItem(SHUFFLE_BAG_KEY, JSON.stringify(bag));
      sessionStorage.setItem(LAST_PALETTE_KEY, nextId);
    } catch (e) {
      memoryBag = bag;
      memoryLastId = nextId;
    }

    const selected = OFFICIAL_PALETTES.find(p => p.id === nextId);
    return selected || OFFICIAL_PALETTES[0];
  }

  function createPrng(seed) {
    let s = seed >>> 0;
    return function () {
      let t = (s += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function getFreshSeed() {
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get('seed');
    if (seedParam !== null && !isNaN(parseInt(seedParam, 10))) {
      return parseInt(seedParam, 10) >>> 0;
    }
    const t = Date.now();
    const entropy = Math.floor(Math.random() * 10000000);
    return ((t ^ entropy) >>> 0);
  }

  function formatUtcDisplay(date, paletteName, modeName, geomName, seed) {
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} UTC`;
    return `${timeStr} | ${paletteName} | ${modeName} | ${geomName} (#${seed % 100000})`;
  }

  // =========================================================================
  // 3. GENERATIVNA KONFIGURACIJA EKSPLOZIJE (ODREĐENA SEEDOM I SHUFFLE BAGOM)
  // =========================================================================

  const EXPLOSION_MODES = [
    { id: 'radial', name: 'Radijalna ekspanzija', desc: 'Centrifugalno širenje prostora' },
    { id: 'diagonal', name: 'Dijagonalna struktura', desc: 'Statički vektor kosih krovnih ploha' },
    { id: 'horizontal', name: 'Lateralni horizont', desc: 'Horizontalno širenje ravnine tla' },
    { id: 'vertical', name: 'Tektonska vertikala', desc: 'Vertikalno uzdizanje stupova i volumena' },
    { id: 'vortex', name: 'Vrtložna dinamika', desc: 'Spiralna transformacija arhitektonske forme' },
    { id: 'asymmetric', name: 'Asimetrični fokus', desc: 'Ekscentrično žarište novih prostora' }
  ];

  function createConfiguration(seed, forcedPalette = null) {
    const random = createPrng(seed);
    const params = new URLSearchParams(window.location.search);

    // 1. Odabir palete: URL parametar ?palette=, fiksni seed ili Shuffle Bag
    const paletteParam = params.get('palette');
    const seedParam = params.get('seed');
    let palette = forcedPalette || null;
    if (!palette && paletteParam) {
      palette = OFFICIAL_PALETTES.find(p => p.id.toLowerCase() === paletteParam.toLowerCase());
    }
    if (!palette && seedParam !== null) {
      const paletteIndex = Math.floor(random() * OFFICIAL_PALETTES.length);
      palette = OFFICIAL_PALETTES[paletteIndex];
    }
    if (!palette) {
      palette = getNextPaletteFromBag();
    }

    // 2. Odabir geometrije ekspanzije pozadine (ili URL parametar ?geom=)
    const geomParam = params.get('geom');
    let geom = null;
    if (geomParam) {
      geom = BACKGROUND_GEOMETRIES.find(g => g.id.toLowerCase() === geomParam.toLowerCase());
    }
    if (!geom) {
      const geomIndex = Math.floor(random() * BACKGROUND_GEOMETRIES.length);
      geom = BACKGROUND_GEOMETRIES[geomIndex];
    }

    // 3. Odabir karaktera kretanja elemenata
    const modeIndex = Math.floor(random() * EXPLOSION_MODES.length);
    const mode = EXPLOSION_MODES[modeIndex];

    // 4. Broj elemenata: točno 21 do 24 autentičnih FGAG fragmenata za savršenih 60 FPS
    const fragmentCount = 21 + Math.floor(random() * 4);
    const fragments = [];

    // Žarište eksplozije
    const focusX = mode.id === 'asymmetric' ? (random() * 160 - 80) : 0;
    const focusY = mode.id === 'asymmetric' ? (random() * 140 - 70) : 0;

    for (let i = 0; i < fragmentCount; i++) {
      const shapeType = i % 3; // 0: lijevi poligon, 1: srednji klin, 2: desni luk (točno 3 znaka)

      // Mjerilo i hijerarhija elemenata
      let sizeClass = 'size-mid';
      let scaleBurst = 1.0;

      if (i < 4) {
        // Monumentalne tektonske plohe
        sizeClass = 'size-monumental';
        scaleBurst = 1.70 + random() * 0.50;
      } else if (i < 12) {
        // Veliki modularni elementi
        sizeClass = 'size-large';
        scaleBurst = 1.30 + random() * 0.35;
      } else if (i < 18) {
        // Srednji elementi
        sizeClass = 'size-mid';
        scaleBurst = 0.95 + random() * 0.25;
      } else {
        // Brze sitne krhotine i detalji
        sizeClass = 'size-shard';
        scaleBurst = 0.60 + random() * 0.20;
      }

      // Sofisticirana harmonijska distribucija boja (izvedena iz teme)
      let color;
      let opacityBurst;

      if (i % 6 === 0) {
        // Duboki arhitektonski rez / akcent
        color = palette.accentShape;
        opacityBurst = 0.92;
      } else if (i % 6 === 1) {
        // Čista svijetla ravnina visokog kontrasta
        color = '#FFFFFF';
        opacityBurst = 0.95;
      } else if (i % 2 === 0) {
        // Sekundarni tonirani ton (Tint B)
        color = palette.secondaryShape;
        opacityBurst = 0.92;
      } else {
        // Primarni svijetli ton (Tint A)
        color = palette.primaryShape;
        opacityBurst = 0.94;
      }

      // Kretanje kroz cijeli format čestitke (220px do 480px za bogatu prostornu disperziju)
      let burstX, burstY;
      const baseDistance = (sizeClass === 'size-shard' ? 220 : 260) + random() * 220;

      if (mode.id === 'diagonal') {
        const diagAngle = (random() > 0.5 ? Math.PI * 0.25 : Math.PI * 1.25) + (random() * 0.5 - 0.25);
        burstX = Math.cos(diagAngle) * (baseDistance * 1.15);
        burstY = Math.sin(diagAngle) * (baseDistance * 0.95);
      } else if (mode.id === 'horizontal') {
        const horizSign = random() > 0.5 ? 1 : -1;
        burstX = horizSign * (200 + random() * 260);
        burstY = (random() * 240 - 120);
      } else if (mode.id === 'vertical') {
        const vertSign = random() > 0.5 ? 1 : -1;
        burstX = (random() * 180 - 90);
        burstY = vertSign * (200 + random() * 260);
      } else if (mode.id === 'vortex') {
        const spiralAngle = (i / fragmentCount) * Math.PI * 2.2 + (random() * 0.35);
        const spiralDist = baseDistance * (0.75 + (i / fragmentCount) * 0.5);
        burstX = Math.cos(spiralAngle) * spiralDist;
        burstY = Math.sin(spiralAngle) * spiralDist;
      } else if (mode.id === 'asymmetric') {
        const angle = (i / fragmentCount) * Math.PI * 2 + (random() * 0.3 - 0.15);
        burstX = focusX + Math.cos(angle) * (baseDistance * 1.1);
        burstY = focusY + Math.sin(angle) * (baseDistance * 0.9);
      } else {
        // Radijalna ekspanzija
        const angle = (i / fragmentCount) * Math.PI * 2 + (random() * 0.3 - 0.15);
        burstX = Math.cos(angle) * baseDistance;
        burstY = Math.sin(angle) * baseDistance;
      }

      const rotationBurst = (random() * 460 - 230);
      const delayBurst = START_DELAY + 0.20 + (random() * 0.10);
      const dissolveDelay = START_DELAY + 1.65 + (i * 0.02) + (random() * 0.06);

      fragments.push({
        id: `frag-${i}`,
        shapeType,
        sizeClass,
        color,
        burstX,
        burstY,
        scaleBurst,
        driftScale: scaleBurst * 1.15,
        rotationBurst,
        driftRotation: rotationBurst + (random() * 60 - 30),
        opacityBurst,
        delayBurst,
        dissolveDelay
      });
    }

    // 5. Kinematički parametri za 3-dijelno sklapanje vodenog žiga (Shape Transformation)
    const wmAssembly = {
      left: {
        startX: -210 - random() * 80,
        startY: -130 - random() * 90,
        startScale: 2.2 + random() * 0.6,
        startRotation: -160 + random() * 60,
        delay: START_DELAY + 1.80
      },
      center: {
        startX: -20 + random() * 50,
        startY: -210 - random() * 90,
        startScale: 2.4 + random() * 0.7,
        startRotation: 120 + random() * 60,
        delay: START_DELAY + 1.92 // 120ms stagger
      },
      right: {
        startX: 200 + random() * 80,
        startY: 110 + random() * 90,
        startScale: 2.1 + random() * 0.6,
        startRotation: -140 + random() * 60,
        delay: START_DELAY + 2.04 // 120ms stagger
      }
    };

    return {
      seed,
      palette,
      geom,
      mode,
      fragmentCount,
      fragments,
      wmAssembly
    };
  }

  // =========================================================================
  // 4. DOM ELEMENTI
  // =========================================================================

  const DOM = {
    card: document.getElementById('greeting-card'),
    cardBase: document.getElementById('card-base'),
    gridLines: document.getElementById('grid-lines'),
    floodPlane: document.getElementById('flood-plane'),
    shockwavesSvg: document.getElementById('shockwaves-svg'),
    shockwavesGroup: document.getElementById('shockwaves-group'),
    singularityHud: document.getElementById('singularity-hud'),
    crossH: document.getElementById('cross-h'),
    crossV: document.getElementById('cross-v'),
    crossRing: document.getElementById('cross-ring'),
    seedDot: document.getElementById('seed-dot'),
    fragmentsLayer: document.getElementById('fragments-layer'),
    watermarkZone: document.getElementById('el-watermark-zone'),
    wmLeft: document.getElementById('wm-left'),
    wmCenter: document.getElementById('wm-center'),
    wmRight: document.getElementById('wm-right'),
    // Elementi završnog kadra
    jubileeNum: document.getElementById('el-jubilee-num'),
    jubileeYears: document.getElementById('el-jubilee-years'),
    greetingMsg: document.getElementById('el-greeting-msg'),
    slogan: document.getElementById('el-slogan'),
    rule1: document.getElementById('el-rule-1'),
    rule2: document.getElementById('el-rule-2'),
    institutionZone: document.getElementById('el-institution'),
    officialLogo: document.getElementById('official-logo-svg'),
    dekanZone: document.getElementById('el-dekan-zone'),
    dekanTitle: document.getElementById('el-dekan-title'),
    dekanName: document.getElementById('el-dekan-name'),
    seedBadge: document.getElementById('seed-badge'),
    replayBtn: document.getElementById('replay-btn'),
    motifsTracker: document.getElementById('motifs-tracker'),
    motifsCount: document.getElementById('motifs-count'),
    motifDots: document.querySelectorAll('.motif-dot'),
    counterBadge: document.getElementById('global-counter-badge'),
    counterValue: document.getElementById('counter-value')
  };

  function createFragments(config) {
    DOM.fragmentsLayer.innerHTML = '';
    const fragmentElements = [];

    config.fragments.forEach((frag) => {
      const el = document.createElement('div');
      el.className = `fragment-item ${frag.sizeClass}`;
      el.id = frag.id;
      el.innerHTML = SVG_SHAPES[frag.shapeType];

      const svg = el.querySelector('svg');
      if (svg) {
        svg.style.fill = frag.color;
      }

      DOM.fragmentsLayer.appendChild(el);
      fragmentElements.push(el);
    });

    return fragmentElements;
  }

  // =========================================================================
  // 5. POSTAVLJANJE POČETNOG STANJA (t = 0)
  // =========================================================================

  function setInitialState(config, fragmentElements) {
    // 1. Dinamički postavi CSS varijable
    DOM.card.style.setProperty('--color-bg', config.palette.bg);
    DOM.card.style.setProperty('--color-ink', config.palette.ink);
    DOM.card.style.setProperty('--color-watermark', config.palette.watermark);

    DOM.card.style.color = config.palette.ink;
    const wmSvg = DOM.watermarkZone.querySelector('svg');
    if (wmSvg) {
      wmSvg.style.fill = config.palette.watermark;
    }
    if (DOM.officialLogo) {
      DOM.officialLogo.style.fill = config.palette.ink;
    }
    DOM.rule1.style.backgroundColor = config.palette.ink;
    DOM.rule2.style.backgroundColor = config.palette.ink;

    // Resetiraj karticu na nultu poziciju
    gsap.set(DOM.card, { x: 0, y: 0, scale: 1 });

    // 2. Početno stanje pozadine: Tamni tehnički ugljen je vidljiv, obojana ploha je točkica
    DOM.floodPlane.style.backgroundColor = config.palette.bg;
    if (config.geom.id === 'iris') {
      DOM.floodPlane.style.clipPath = `circle(0% at ${ORIGIN_X}% ${ORIGIN_Y}%)`;
    } else {
      DOM.floodPlane.style.clipPath = getBackgroundClipPath(config.geom.id, 0);
    }
    gsap.set(DOM.floodPlane, { opacity: 1 });

    // 3. Očisti vektorske udarne valove
    DOM.shockwavesGroup.innerHTML = '';

    // 4. Optički nitni križ & reticle (HUD)
    gsap.set(DOM.singularityHud, { opacity: 1, scale: 1 });
    gsap.set(DOM.crossRing, { scale: 0.25, opacity: 0, rotation: 0 });
    gsap.set([DOM.crossH, DOM.crossV], { scale: 0, opacity: 0 });
    gsap.set(DOM.seedDot, { scale: 0, opacity: 1, rotation: 45, backgroundColor: config.palette.bg, boxShadow: `0 0 18px ${config.palette.bg}` });

    // 5. Jubilej 55 i godine 1971. - 2026.
    gsap.set(DOM.jubileeNum, {
      yPercent: 115,
      y: 0,
      opacity: 0,
      display: 'block'
    });

    gsap.set(DOM.jubileeYears, {
      yPercent: 115,
      y: 0,
      opacity: 0,
      display: 'block'
    });

    // 6. Tekst čestitke
    gsap.set(DOM.greetingMsg, {
      y: 12,
      opacity: 0,
      display: 'block'
    });

    // 7. Horizontalne crte
    gsap.set([DOM.rule1, DOM.rule2], {
      scaleX: 0,
      opacity: 0,
      transformOrigin: 'left center',
      display: 'block'
    });

    // 8. Službeni institucionalni logotip
    gsap.set(DOM.institutionZone, {
      display: 'flex',
      opacity: 1
    });

    gsap.set(DOM.officialLogo, {
      opacity: 0,
      y: 8,
      display: 'block'
    });

    // 9. Slogan
    const sloganSpans = DOM.slogan.querySelectorAll('span');
    gsap.set(DOM.slogan, {
      display: 'flex',
      opacity: 1
    });

    gsap.set(sloganSpans, {
      yPercent: 40,
      opacity: 0
    });

    // 10. Dekan potpis
    if (DOM.dekanZone) {
      gsap.set(DOM.dekanZone, { opacity: 1, display: 'flex' });
    }
    gsap.set([DOM.dekanTitle, DOM.dekanName], {
      y: 10,
      opacity: 0,
      display: 'block'
    });

    // 11. Sekundarni leteći oblici (21 do 24 autentičnih FGAG elemenata)
    gsap.set(DOM.fragmentsLayer, { opacity: 1, display: 'block' });
    fragmentElements.forEach((el) => {
      gsap.set(el, {
        x: 0,
        y: 0,
        scale: 0.05,
        rotation: 0,
        opacity: 0,
        xPercent: -50,
        yPercent: -50
      });
    });

    // 12. Središnji vodeni žig - priprema za kinematičko 3-dijelno sklapanje
    gsap.set(DOM.watermarkZone, {
      opacity: 1,
      scale: 1,
      visibility: 'visible',
      transformOrigin: '50% 50%'
    });

    gsap.set([DOM.wmLeft, DOM.wmCenter, DOM.wmRight], {
      xPercent: 0,
      yPercent: 0,
      scale: 0,
      rotation: 0,
      opacity: 0,
      filter: 'blur(0px)',
      transformOrigin: '50% 50%'
    });
  }

  // =========================================================================
  // 6. IZGRADNJA TIMELINEA: KOMPLETNA GENERATIVNA ANIMACIJA
  // "ZNANJE KOJE MIJENJA PROSTOR"
  // =========================================================================

  function buildTimeline(config, fragmentElements) {
    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: 'power2.out' }
    });

    const isIris = (config.geom.id === 'iris');
    const T0 = START_DELAY; // Inicijalna suspenzija (1.00s)

    // -----------------------------------------------------------------------
    // FAZA 1: OPTIČKI NITNI KRIŽ & RETICLE HUD (T0 + 0.00s – T0 + 0.22s)
    // Podloga je tamni tehnički ugljen. U točki znaka fokusira se nitni križ.
    // -----------------------------------------------------------------------
    tl.to(DOM.crossRing, {
      scale: 1,
      opacity: 0.85,
      rotation: 90,
      duration: 0.18,
      ease: 'power2.out'
    }, T0 + 0.02)
      .to([DOM.crossH, DOM.crossV], {
        scale: 1,
        opacity: 0.95,
        duration: 0.15,
        ease: 'power3.out'
      }, T0 + 0.04)
      .to(DOM.seedDot, {
        scale: 1,
        duration: 0.16,
        ease: 'back.out(3)',
        boxShadow: `0 0 28px ${config.palette.bg}`
      }, T0 + 0.06);

    // -----------------------------------------------------------------------
    // FAZA 2: "ZNANJE KOJE MIJENJA PROSTOR" - DETONACIJA & BIG BANG (T0 + 0.22s)
    // 1. HUD munjevito bljesne i raspline se
    // 2. Taktilni mikro-trzaj kartice (camera recoil)
    // 3. Obojana ploha pozadine munjevito preplavi čestitku
    // 4. Kinetički vektorski udarni valovi pucaju prema rubovima
    // 5. 21-24 autentičnih FGAG elemenata eruptira u prostor
    // -----------------------------------------------------------------------

    // 1. HUD nestaje u bljesku
    tl.to(DOM.singularityHud, {
      opacity: 0,
      scale: 2.2,
      duration: 0.12,
      ease: 'power2.in'
    }, T0 + 0.20);

    // 2. Fizički mikroskopski trzaj kartice (recoil)
    tl.to(DOM.card, { x: -2.5, y: 1.8, duration: 0.04, ease: 'none' }, T0 + 0.22)
      .to(DOM.card, { x: 2.0, y: -1.2, duration: 0.04, ease: 'none' }, T0 + 0.26)
      .to(DOM.card, { x: 0, y: 0, duration: 0.16, ease: 'power2.out' }, T0 + 0.30);

    // 3. Generativna ekspanzija obojane pozadine (energičnih 0.65s za vidljivu, dinamičnu tranziciju)
    const bgProgress = { val: 0 };
    tl.to(bgProgress, {
      val: 1,
      duration: 0.65,
      ease: 'power2.out',
      onUpdate: () => {
        if (isIris) {
          const r = bgProgress.val * 145;
          DOM.floodPlane.style.clipPath = `circle(${r}% at ${ORIGIN_X}% ${ORIGIN_Y}%)`;
        } else {
          DOM.floodPlane.style.clipPath = getBackgroundClipPath(config.geom.id, bgProgress.val);
        }
      },
      onComplete: () => {
        DOM.floodPlane.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
      }
    }, T0 + 0.22);

    // Timeline marker koji osigurava punu pokrivenost kod seek/scrub operacija
    tl.set(DOM.floodPlane, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
    }, T0 + 0.90);

    // 4. Stvaranje 4 dinamička udarna vala (shockwave contours)
    const shockwavePaths = [];
    for (let w = 0; w < 4; w++) {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', config.palette.isDark ? '#FFFFFF' : config.palette.accentShape);
      p.setAttribute('stroke-width', (2.8 - w * 0.6) + 'px');
      p.setAttribute('stroke-dasharray', w % 2 === 1 ? '8 5' : 'none');
      p.setAttribute('opacity', '0');
      DOM.shockwavesGroup.appendChild(p);
      shockwavePaths.push(p);

      const delayW = T0 + 0.22 + w * 0.045;
      const waveObj = { r: 0 };
      const maxR = 960 + w * 140;

      tl.to(p, { opacity: 0.75 - w * 0.16, duration: 0.05 }, delayW);
      tl.to(waveObj, {
        r: maxR,
        duration: 0.60,
        ease: 'power2.out',
        onUpdate: () => {
          const rad = waveObj.r;
          const cx = 500;
          const cy = 1422 * 0.454;
          if (config.geom.id === 'diamond') {
            p.setAttribute('d', `M ${cx} ${cy - rad * 1.35} L ${cx + rad} ${cy} L ${cx} ${cy + rad * 1.35} L ${cx - rad} ${cy} Z`);
          } else if (config.geom.id === 'rect') {
            p.setAttribute('d', `M ${cx - rad} ${cy - rad} L ${cx + rad} ${cy - rad} L ${cx + rad} ${cy + rad} L ${cx - rad} ${cy + rad} Z`);
          } else {
            p.setAttribute('d', `M ${cx - rad},${cy} a ${rad},${rad} 0 1,0 ${rad * 2},0 a ${rad},${rad} 0 1,0 -${rad * 2},0`);
          }
        }
      }, delayW);
      tl.to(p, { opacity: 0, duration: 0.35, ease: 'power2.in' }, delayW + 0.35);
    }

    // 5. Erupcija 21-24 autentičnih FGAG fragmenata iz središta singularnosti
    // Korištenje kinetičke krivulje (power3.out) za bogat osjećaj prostornog raspršivanja
    fragmentElements.forEach((el, index) => {
      const frag = config.fragments[index];
      tl.to(el, {
        x: frag.burstX,
        y: frag.burstY,
        scale: frag.scaleBurst,
        rotation: frag.rotationBurst,
        opacity: frag.opacityBurst,
        duration: 1.55,
        ease: 'power3.out'
      }, frag.delayBurst);
    });

    // -----------------------------------------------------------------------
    // FAZA 3: RASPLET EKSPLOZIJE & TRANSFORMACIJA OBLIKA (T0 + 1.80 – T0 + 3.65s)
    // 1. Raspršeni fragmenti nastavljaju lagani drift i nestaju u pozadini
    // 2. Tri izvorne plohe vodenog žiga ulijeću iz prostora rotirajući se,
    //    postupno se izoštravaju iz blura (filter: blur(8px) -> blur(0px))
    //    i dosjedaju u točan monolitni FGAG simbol (Zero Gap).
    // -----------------------------------------------------------------------

    // 1. Sekundarni drift i tiho nestajanje fragmenata
    fragmentElements.forEach((el, index) => {
      const frag = config.fragments[index];
      tl.to(el, {
        scale: frag ? frag.driftScale : 1.2,
        rotation: frag ? frag.driftRotation : 45,
        opacity: 0,
        duration: 0.85,
        ease: 'power2.inOut'
      }, frag ? (T0 + 1.55 + (index * 0.015)) : (T0 + 1.60 + (index * 0.015)));
    });

    // Čišćenje sloja fragmenata nakon potpunog rasapa
    tl.set(DOM.fragmentsLayer, { opacity: 0, display: 'none' }, T0 + 2.90);

    // 2. Kinematičko sklapanje simbola: 3 segmenta stižu uz stagger od 120ms (provjerena verzija)
    // Lijevi segment (wm-left)
    tl.fromTo(DOM.wmLeft, {
      xPercent: config.wmAssembly.left.startX,
      yPercent: config.wmAssembly.left.startY,
      scale: config.wmAssembly.left.startScale,
      rotation: config.wmAssembly.left.startRotation,
      filter: 'blur(8px)',
      opacity: 0
    }, {
      xPercent: 0,
      yPercent: 0,
      scale: 1.0,
      rotation: 0,
      filter: 'blur(0px)',
      opacity: 1,
      duration: 1.25,
      ease: 'power3.out'
    }, config.wmAssembly.left.delay);

    // Središnji klin (wm-center) - 120ms stagger
    tl.fromTo(DOM.wmCenter, {
      xPercent: config.wmAssembly.center.startX,
      yPercent: config.wmAssembly.center.startY,
      scale: config.wmAssembly.center.startScale,
      rotation: config.wmAssembly.center.startRotation,
      filter: 'blur(8px)',
      opacity: 0
    }, {
      xPercent: 0,
      yPercent: 0,
      scale: 1.0,
      rotation: 0,
      filter: 'blur(0px)',
      opacity: 1,
      duration: 1.25,
      ease: 'power3.out'
    }, config.wmAssembly.center.delay);

    // Desni zakrivljeni segment (wm-right) - 120ms stagger
    tl.fromTo(DOM.wmRight, {
      xPercent: config.wmAssembly.right.startX,
      yPercent: config.wmAssembly.right.startY,
      scale: config.wmAssembly.right.startScale,
      rotation: config.wmAssembly.right.startRotation,
      filter: 'blur(8px)',
      opacity: 0
    }, {
      xPercent: 0,
      yPercent: 0,
      scale: 1.0,
      rotation: 0,
      filter: 'blur(0px)',
      opacity: 1,
      duration: 1.25,
      ease: 'power3.out'
    }, config.wmAssembly.right.delay);

    // 3. Suptilni makro-puls vodenog žiga pri sklapanju (elastično smirivanje)
    tl.fromTo(DOM.watermarkZone, {
      scale: 1.06
    }, {
      scale: 1.0,
      duration: 0.80,
      ease: 'power2.out'
    }, T0 + 2.30);

    // Čišćenje GPU filtera nakon završetka transformacije oblika
    tl.set([DOM.wmLeft, DOM.wmCenter, DOM.wmRight], {
      filter: 'none'
    }, T0 + 3.35);

    // -----------------------------------------------------------------------
    // FAZA 4: TEKTONSKA KOREOGRAFIJA JUBILEJA I ZAVRŠNOG KADRA (T0 + 3.20 – T0 + 5.00s)
    // Redoslijed od vrha prema dnu: 55 -> Godine -> Čestitka -> Slogan -> Crte -> Logo -> Dekan
    // -----------------------------------------------------------------------
    // 1. Broj 55 izranja (T0 + 3.20s)
    tl.to(DOM.jubileeNum, {
      yPercent: 0,
      y: 0,
      opacity: 1,
      duration: 0.65,
      ease: 'power3.out'
    }, T0 + 3.20);

    // 2. Godine 1971. – 2026. (T0 + 3.35s)
    tl.to(DOM.jubileeYears, {
      yPercent: 0,
      y: 0,
      opacity: 1,
      duration: 0.60,
      ease: 'power3.out'
    }, T0 + 3.35);

    // 3. Tekst čestitke (T0 + 3.55s)
    tl.to(DOM.greetingMsg, {
      y: 0,
      opacity: 1,
      duration: 0.50,
      ease: 'power3.out'
    }, T0 + 3.55);

    // 4. Slogan "ZNANJE KOJE MIJENJA PROSTOR" (T0 + 3.80s)
    const sloganSpans = DOM.slogan.querySelectorAll('span');
    tl.to(sloganSpans, {
      yPercent: 0,
      opacity: 1,
      duration: 0.45,
      stagger: 0.08,
      ease: 'power3.out'
    }, T0 + 3.80);

    // 5. Horizontalne crte 1 i 2 (T0 + 4.10s)
    tl.to([DOM.rule1, DOM.rule2], {
      scaleX: 1,
      opacity: 0.95,
      duration: 0.40,
      stagger: 0.08,
      ease: 'power3.out'
    }, T0 + 4.10);

    // 6. Službeni institucionalni logotip (T0 + 4.25s)
    tl.to(DOM.officialLogo, {
      opacity: 1,
      y: 0,
      duration: 0.45,
      ease: 'power3.out'
    }, T0 + 4.25);

    // 7. Dekan potpis: "Dekan" i "prof. dr. sc. Neno Torić" (T0 + 4.45s)
    tl.to([DOM.dekanTitle, DOM.dekanName], {
      y: 0,
      opacity: 1,
      duration: 0.45,
      stagger: 0.06,
      ease: 'power3.out'
    }, T0 + 4.45);

    // 8. Završetak točno u T0 + 5.00s (real-time 6.00s) – potpuna stabilnost i savršen kadar
    tl.set({}, {}, T0 + 5.00);

    return tl;
  }

  // =========================================================================
  // 7. KONTROLNA LOGIKA & UPRAVLJANJE (MOTIVI & BROJAČ IZVOĐENJA)
  // =========================================================================

  const STORAGE_KEY_MOTIFS = 'fgag_unlocked_motifs';
  const STORAGE_KEY_COUNTER_SIM = 'fgag_global_counter_sim';

  let activeConfig = null;
  let activeTimeline = null;
  let activeFragmentElements = [];

  function getUnlockedMotifs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MOTIFS);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function updateMotifsTracker(activePaletteId) {
    if (!DOM.motifsTracker) return;

    let unlocked = getUnlockedMotifs();
    if (activePaletteId && !unlocked.includes(activePaletteId)) {
      unlocked.push(activePaletteId);
      try {
        localStorage.setItem(STORAGE_KEY_MOTIFS, JSON.stringify(unlocked));
      } catch (e) { }
    }

    const count = unlocked.length;
    if (DOM.motifsCount) {
      DOM.motifsCount.textContent = count === 7 ? '' : `${count}/7`;
    }

    if (count === 7) {
      DOM.motifsTracker.classList.add('all-unlocked');
      DOM.motifsTracker.setAttribute('title', 'Čestitamo! Otključali ste svih 7 službenih motiva FGAG-a.');
    } else {
      DOM.motifsTracker.classList.remove('all-unlocked');
      DOM.motifsTracker.setAttribute('title', `Zbirka motiva: ${count} od 7 otključano`);
    }

    if (DOM.motifDots) {
      DOM.motifDots.forEach((dot) => {
        const pId = dot.getAttribute('data-palette');
        const isUnlocked = unlocked.includes(pId);
        const isActive = pId === activePaletteId;

        dot.classList.toggle('unlocked', isUnlocked);
        dot.classList.toggle('active', isActive);
      });
    }
  }

  function formatCounterNumber(num) {
    const padded = String(Math.max(0, num)).padStart(6, '0');
    const thousands = padded.slice(0, 3);
    const units = padded.slice(3);
    return `#${thousands}.${units}`;
  }

  function renderCounterValue(num) {
    if (!DOM.counterValue) return;
    DOM.counterValue.textContent = formatCounterNumber(num);
    DOM.counterValue.classList.remove('bump');
    void DOM.counterValue.offsetWidth;
    DOM.counterValue.classList.add('bump');
  }

  async function recordExecutionCount() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch('/api/counter/hit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (typeof data.total === 'number') {
          renderCounterValue(data.total);
          try { localStorage.setItem(STORAGE_KEY_COUNTER_SIM, String(data.total)); } catch (e) { }
          return;
        }
      }
    } catch (err) {
      // API nije dostupan (statički GitHub Pages ili lokalno bez poslužitelja)
    }

    // Automatski lokalni fallback
    try {
      let sim = parseInt(localStorage.getItem(STORAGE_KEY_COUNTER_SIM) || '0', 10);
      if (isNaN(sim)) sim = 0;
      sim += 1;
      localStorage.setItem(STORAGE_KEY_COUNTER_SIM, String(sim));
      renderCounterValue(sim);
    } catch (e) {
      renderCounterValue(0);
    }
  }

  function initializeAndPlay(reuseExisting = false) {
    if (activeTimeline) {
      activeTimeline.kill();
      activeTimeline = null;
    }

    if (!reuseExisting || !activeConfig) {
      const seed = getFreshSeed();
      activeConfig = createConfiguration(seed);
      activeFragmentElements = createFragments(activeConfig);
      setInitialState(activeConfig, activeFragmentElements);
    }

    const now = new Date();
    DOM.seedBadge.textContent = formatUtcDisplay(
      now,
      activeConfig.palette.name,
      activeConfig.mode.name,
      activeConfig.geom.name,
      activeConfig.seed
    );

    updateMotifsTracker(activeConfig.palette.id);
    recordExecutionCount();

    activeTimeline = buildTimeline(activeConfig, activeFragmentElements);
    activeTimeline.play(0);

    const params = new URLSearchParams(window.location.search);
    const seekParam = params.get('t');
    if (seekParam !== null) {
      const tVal = parseFloat(seekParam);
      if (!isNaN(tVal)) {
        activeTimeline.pause(tVal);
      }
    }
  }

  function playNewVariation() {
    if (activeTimeline) {
      activeTimeline.kill();
      activeTimeline = null;
    }

    // Generiraj potpuno novi nasumični seed
    const freshSeed = getFreshSeed();
    // createConfiguration automatski vuče sljedeću paletu iz Shuffle Baga i novu nasumičnu dinamiku
    activeConfig = createConfiguration(freshSeed);

    const now = new Date();
    DOM.seedBadge.textContent = formatUtcDisplay(
      now,
      activeConfig.palette.name,
      activeConfig.mode.name,
      activeConfig.geom.name,
      freshSeed
    );

    activeFragmentElements = createFragments(activeConfig);
    setInitialState(activeConfig, activeFragmentElements);

    updateMotifsTracker(activeConfig.palette.id);
    recordExecutionCount();

    activeTimeline = buildTimeline(activeConfig, activeFragmentElements);
    activeTimeline.play(0);
  }

  DOM.replayBtn.addEventListener('click', (e) => {
    e.preventDefault();
    playNewVariation();
  });

  // =========================================================================
  // 8. POUZDANI STARTUP ZA SVE UREĐAJE (PAINT GATE & FONTS READY)
  // =========================================================================

  function onPageFullyReady(callback) {
    const execute = () => {
      // 1. Ako preglednik podržava Font Loading API, čekaj učitavanje webfontova
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          // 2. Dvostruki requestAnimationFrame garantira da je GPU naslikao prvi frame
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              callback();
            });
          });
        }).catch(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              callback();
            });
          });
        });
      } else {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            callback();
          });
        });
      }
    };

    if (document.readyState === 'complete') {
      execute();
    } else {
      window.addEventListener('load', execute, { once: true });
    }
  }

  // Ako korisnik otvori stranicu u pozadinskom tabu, čekaj dok ne postane vidljiva
  let hasStarted = false;
  function startWhenVisible() {
    if (hasStarted) return;
    if (document.hidden) {
      const onVisible = () => {
        if (!document.hidden) {
          document.removeEventListener('visibilitychange', onVisible);
          hasStarted = true;
          initializeAndPlay(true);
        }
      };
      document.addEventListener('visibilitychange', onVisible);
    } else {
      hasStarted = true;
      initializeAndPlay(true);
    }
  }

  // Instant initial setup to guarantee zero-state before paint
  try {
    const immediateSeed = getFreshSeed();
    activeConfig = createConfiguration(immediateSeed);
    activeFragmentElements = createFragments(activeConfig);
    setInitialState(activeConfig, activeFragmentElements);
    updateMotifsTracker(activeConfig.palette.id);
  } catch (err) {
    console.error('Init zero-state err:', err);
  }

  onPageFullyReady(() => {
    startWhenVisible();
  });

  window.seekTo = function (t) {
    if (activeTimeline) {
      activeTimeline.pause(t);
    }
  };

  window.playAnim = function () {
    if (activeTimeline) {
      activeTimeline.play();
    }
  };

  window.playNewVariation = function () {
    playNewVariation();
  };

})();
