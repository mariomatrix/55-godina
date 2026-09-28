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

  // Izvorne vektorske geometrije znaka FGAG i arhitektonske grede za eksploziju
  const SVG_SHAPES = [
    // 0: Lijevi poligon
    `<svg viewBox="0 0 93.64 65.81" preserveAspectRatio="xMidYMid meet">
      <polygon points="63.48 0 0 21.94 0 65.81 51.45 65.81 93.64 32.91 93.64 0 63.48 0" />
    </svg>`,
    // 1: Središnji trokut
    `<svg viewBox="0 0 95.68 67.13" preserveAspectRatio="xMidYMid meet">
      <polygon points="43.88 0 0 34.23 0 67.13 95.68 67.13 43.88 0" />
    </svg>`,
    // 2: Desni zakrivljeni segment
    `<svg viewBox="0 0 71.1 65.85" preserveAspectRatio="xMidYMid meet">
      <path d="M54.84,0C21.94,0,0,21.94,0,54.85v11h71.1V0Z" />
    </svg>`,
    // 3: Arhitektonski romboidni profil / statička greda
    `<svg viewBox="0 0 100 45" preserveAspectRatio="xMidYMid meet">
      <polygon points="0,45 35,0 100,0 65,45" />
    </svg>`
  ];

  // =========================================================================
  // 2. DETERMINISTIČKI PRNG (Mulberry32)
  // =========================================================================

  function createPrng(seed) {
    let s = seed >>> 0;
    return function () {
      let t = (s += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function getUtcSeed() {
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get('seed');
    if (seedParam !== null && !isNaN(parseInt(seedParam, 10))) {
      return parseInt(seedParam, 10) >>> 0;
    }
    const now = new Date();
    return Math.floor(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
      ) / 1000
    ) >>> 0;
  }

  function formatUtcDisplay(date, paletteName, modeName, geomName, seed) {
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} UTC`;
    return `${timeStr} | ${paletteName} | ${modeName} | ${geomName} (#${seed % 100000})`;
  }

  // =========================================================================
  // 3. GENERATIVNA KONFIGURACIJA EKSPLOZIJE (ODREĐENA UTC SEEDOM)
  // =========================================================================

  const EXPLOSION_MODES = [
    { id: 'radial', name: 'Radijalna ekspanzija', desc: 'Centrifugalno širenje prostora' },
    { id: 'diagonal', name: 'Dijagonalna struktura', desc: 'Statički vektor kosih krovnih ploha' },
    { id: 'horizontal', name: 'Lateralni horizont', desc: 'Horizontalno širenje ravnine tla' },
    { id: 'vertical', name: 'Tektonska vertikala', desc: 'Vertikalno uzdizanje stupova i volumena' },
    { id: 'vortex', name: 'Vrtložna dinamika', desc: 'Spiralna transformacija arhitektonske forme' },
    { id: 'asymmetric', name: 'Asimetrični fokus', desc: 'Ekscentrično žarište novih prostora' }
  ];

  function createConfiguration(seed) {
    const random = createPrng(seed);
    const params = new URLSearchParams(window.location.search);

    // 1. Odabir palete (ili URL parametar ?palette=)
    const paletteParam = params.get('palette');
    let palette = null;
    if (paletteParam) {
      palette = OFFICIAL_PALETTES.find(p => p.id.toLowerCase() === paletteParam.toLowerCase());
    }
    if (!palette) {
      const paletteIndex = Math.floor(random() * OFFICIAL_PALETTES.length);
      palette = OFFICIAL_PALETTES[paletteIndex];
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

    // 4. Broj elemenata: reducirano za 50% (28 do 34 elementa) za glatko izvođenje na slabijim računalima
    const fragmentCount = 28 + Math.floor(random() * 7);
    const fragments = [];

    // Žarište eksplozije
    const focusX = mode.id === 'asymmetric' ? (random() * 160 - 80) : 0;
    const focusY = mode.id === 'asymmetric' ? (random() * 140 - 70) : 0;

    for (let i = 0; i < fragmentCount; i++) {
      const shapeType = i % 4; // 0: poligon, 1: trokut, 2: luk, 3: greda

      // Mjerilo i hijerarhija elemenata
      let sizeClass = 'size-mid';
      let scaleBurst = 1.0;

      if (i < 5) {
        // Monumentalne tektonske plohe
        sizeClass = 'size-monumental';
        scaleBurst = 2.6 + random() * 1.3;
      } else if (i < 15) {
        // Veliki modularni elementi
        sizeClass = 'size-large';
        scaleBurst = 1.6 + random() * 0.8;
      } else if (i < 25) {
        // Srednji elementi
        sizeClass = 'size-mid';
        scaleBurst = 1.0 + random() * 0.5;
      } else {
        // Brze sitne krhotine i detalji
        sizeClass = 'size-shard';
        scaleBurst = 0.6 + random() * 0.35;
      }

      // Bogat, visokokontrastan raspored boja
      let color;
      let opacityBurst;

      if (i % 5 === 0) {
        // Tamni arhitektonski rez / akcent
        color = palette.accentShape;
        opacityBurst = 0.85 + random() * 0.15;
      } else if (i % 5 === 1) {
        // Čista svijetla ravnina (visoki kontrast)
        color = '#FFFFFF';
        opacityBurst = 0.90 + random() * 0.10;
      } else if (i % 2 === 0) {
        color = palette.secondaryShape;
        opacityBurst = 0.88 + random() * 0.12;
      } else {
        color = palette.primaryShape;
        opacityBurst = 0.92 + random() * 0.08;
      }

      // Kretanje ovisno o režimu
      let burstX, burstY;
      const baseDistance = (sizeClass === 'size-shard' ? 380 : 260) + random() * 460;

      if (mode.id === 'diagonal') {
        const diagAngle = (random() > 0.5 ? Math.PI * 0.25 : Math.PI * 1.25) + (random() * 0.6 - 0.3);
        burstX = Math.cos(diagAngle) * (baseDistance * 1.15);
        burstY = Math.sin(diagAngle) * (baseDistance * 0.95);
      } else if (mode.id === 'horizontal') {
        const horizSign = random() > 0.5 ? 1 : -1;
        burstX = horizSign * (280 + random() * 480);
        burstY = (random() * 280 - 140);
      } else if (mode.id === 'vertical') {
        const vertSign = random() > 0.5 ? 1 : -1;
        burstX = (random() * 240 - 120);
        burstY = vertSign * (280 + random() * 450);
      } else if (mode.id === 'vortex') {
        const spiralAngle = (i / fragmentCount) * Math.PI * 2.2 + (random() * 0.4);
        const spiralDist = baseDistance * (0.75 + (i / fragmentCount) * 0.55);
        burstX = Math.cos(spiralAngle) * spiralDist;
        burstY = Math.sin(spiralAngle) * spiralDist;
      } else if (mode.id === 'asymmetric') {
        const angle = (i / fragmentCount) * Math.PI * 2 + (random() * 0.3 - 0.15);
        burstX = focusX + Math.cos(angle) * (baseDistance * 1.1);
        burstY = focusY + Math.sin(angle) * (baseDistance * 0.9);
      } else {
        // Radijalna ekspanzija
        const angle = (i / fragmentCount) * Math.PI * 2 + (random() * 0.35 - 0.175);
        burstX = Math.cos(angle) * baseDistance;
        burstY = Math.sin(angle) * baseDistance;
      }

      const rotationBurst = (random() * 540 - 270);
      const delayBurst = START_DELAY + 0.22 + (random() * 0.14);
      const dissolveDelay = START_DELAY + 1.70 + (i * 0.015) + (random() * 0.10);

      fragments.push({
        id: `frag-${i}`,
        shapeType,
        sizeClass,
        color,
        burstX,
        burstY,
        scaleBurst,
        rotationBurst,
        opacityBurst,
        delayBurst,
        dissolveDelay
      });
    }

    // 5. Tri temeljna dijela vodenog žiga
    const wmPieces = {
      left: {
        burstX: -200 - random() * 120,
        burstY: -90 - random() * 120,
        scaleBurst: 2.1 + random() * 0.7,
        rotationBurst: -45 + random() * 25,
        delayBurst: START_DELAY + 0.23 + random() * 0.05,
        convDelay: START_DELAY + 1.90 + random() * 0.08
      },
      center: {
        burstX: -40 + random() * 80,
        burstY: -190 - random() * 120,
        scaleBurst: 2.2 + random() * 0.8,
        rotationBurst: 15 + random() * 35,
        delayBurst: START_DELAY + 0.25 + random() * 0.05,
        convDelay: START_DELAY + 1.93 + random() * 0.08
      },
      right: {
        burstX: 190 + random() * 130,
        burstY: 90 + random() * 120,
        scaleBurst: 2.0 + random() * 0.7,
        rotationBurst: -45 + random() * 30,
        delayBurst: START_DELAY + 0.27 + random() * 0.05,
        convDelay: START_DELAY + 1.96 + random() * 0.08
      }
    };

    return {
      seed,
      palette,
      geom,
      mode,
      fragmentCount,
      fragments,
      wmPieces
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
    dekanTitle: document.getElementById('el-dekan-title'),
    dekanName: document.getElementById('el-dekan-name'),
    seedBadge: document.getElementById('seed-badge'),
    replayBtn: document.getElementById('replay-btn')
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
    gsap.set([DOM.dekanTitle, DOM.dekanName], {
      y: 10,
      opacity: 0,
      display: 'block'
    });

    // 11. Sekundarni leteći oblici (58-70 elemenata)
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

    // 12. Vodeni žig - pripremi dijelove za rođenje iz singularnosti
    gsap.set(DOM.watermarkZone, {
      opacity: 1,
      visibility: 'visible'
    });

    gsap.set([DOM.wmLeft, DOM.wmCenter, DOM.wmRight], {
      x: 0,
      y: 0,
      scale: 0,
      rotation: 0,
      opacity: 0,
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
    // 5. 58-70 monumentalnih i modularnih elemenata eruptira prema van
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

    // 3. Generativna ekspanzija obojane pozadine
    const bgProgress = { val: 0 };
    tl.to(bgProgress, {
      val: 1,
      duration: 0.52,
      ease: 'expo.out',
      onUpdate: () => {
        if (isIris) {
          const r = bgProgress.val * 145;
          DOM.floodPlane.style.clipPath = `circle(${r}% at ${ORIGIN_X}% ${ORIGIN_Y}%)`;
        } else {
          DOM.floodPlane.style.clipPath = getBackgroundClipPath(config.geom.id, bgProgress.val);
        }
      }
    }, T0 + 0.22);

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
        duration: 0.55,
        ease: 'power3.out',
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
      tl.to(p, { opacity: 0, duration: 0.32, ease: 'power2.in' }, delayW + 0.18);
    }

    // 5. Erupcija 58-70 elemenata iz središta singularnosti
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

    // 6. Tri izvorne plohe vodenog žiga rađaju se iz središnje singularnosti
    tl.fromTo(DOM.wmLeft, {
      x: 0,
      y: 0,
      scale: 0.05,
      rotation: 0,
      opacity: 0
    }, {
      x: config.wmPieces.left.burstX,
      y: config.wmPieces.left.burstY,
      scale: config.wmPieces.left.scaleBurst,
      rotation: config.wmPieces.left.rotationBurst,
      opacity: 0.95,
      duration: 1.50,
      ease: 'power3.out'
    }, config.wmPieces.left.delayBurst);

    tl.fromTo(DOM.wmCenter, {
      x: 0,
      y: 0,
      scale: 0.05,
      rotation: 0,
      opacity: 0
    }, {
      x: config.wmPieces.center.burstX,
      y: config.wmPieces.center.burstY,
      scale: config.wmPieces.center.scaleBurst,
      rotation: config.wmPieces.center.rotationBurst,
      opacity: 0.95,
      duration: 1.50,
      ease: 'power3.out'
    }, config.wmPieces.center.delayBurst);

    tl.fromTo(DOM.wmRight, {
      x: 0,
      y: 0,
      scale: 0.05,
      rotation: 0,
      opacity: 0
    }, {
      x: config.wmPieces.right.burstX,
      y: config.wmPieces.right.burstY,
      scale: config.wmPieces.right.scaleBurst,
      rotation: config.wmPieces.right.rotationBurst,
      opacity: 0.95,
      duration: 1.50,
      ease: 'power3.out'
    }, config.wmPieces.right.delayBurst);

    // -----------------------------------------------------------------------
    // FAZA 3: KRISTALIZACIJA VODENOG ŽIGA & RED (T0 + 1.80 – T0 + 3.36s)
    // -----------------------------------------------------------------------
    // 1. Raspršeni oblici usporavaju i nestaju u obojanoj podlozi
    fragmentElements.forEach((el, index) => {
      const frag = config.fragments[index];
      tl.to(el, {
        scale: 0.15,
        opacity: 0,
        duration: 0.95,
        ease: 'power2.inOut'
      }, frag ? frag.dissolveDelay : (T0 + 1.80 + (index * 0.018)));
    });

    // 2. Tri plohe vodenog žiga precizno dosjedaju u točan znak (Zero Gap)
    tl.to(DOM.wmLeft, {
      x: 0,
      y: 0,
      scale: 1.0,
      rotation: 0,
      opacity: 1,
      duration: 1.35,
      ease: 'power3.out'
    }, config.wmPieces.left.convDelay);

    tl.to(DOM.wmCenter, {
      x: 0,
      y: 0,
      scale: 1.0,
      rotation: 0,
      opacity: 1,
      duration: 1.38,
      ease: 'power3.out'
    }, config.wmPieces.center.convDelay);

    tl.to(DOM.wmRight, {
      x: 0,
      y: 0,
      scale: 1.0,
      rotation: 0,
      opacity: 1,
      duration: 1.35,
      ease: 'power3.out'
    }, config.wmPieces.right.convDelay);

    // -----------------------------------------------------------------------
    // FAZA 4: TEKTONSKA KOREOGRAFIJA JUBILEJA I ZAVRŠNOG KADRA (T0 + 3.86 – T0 + 6.00s)
    // -----------------------------------------------------------------------
    // 1. Broj 55 izranja točno ~0.50 s nakon smirenja znaka (T0 + 3.86s)
    tl.to(DOM.jubileeNum, {
      yPercent: 0,
      y: 0,
      opacity: 1,
      duration: 0.80,
      ease: 'power3.out'
    }, T0 + 3.86);

    // 2. Godine 1971. – 2026. (T0 + 4.06s)
    tl.to(DOM.jubileeYears, {
      yPercent: 0,
      y: 0,
      opacity: 1,
      duration: 0.70,
      ease: 'power3.out'
    }, T0 + 4.06);

    // 3. Tekst čestitke (T0 + 4.25s)
    tl.to(DOM.greetingMsg, {
      y: 0,
      opacity: 1,
      duration: 0.55,
      ease: 'power3.out'
    }, T0 + 4.25);

    // 4. Horizontalne crte (T0 + 4.60s)
    tl.to([DOM.rule1, DOM.rule2], {
      scaleX: 1,
      opacity: 0.95,
      duration: 0.45,
      stagger: 0.08,
      ease: 'power3.out'
    }, T0 + 4.60);

    // 5. Službeni znak sa tekstom (T0 + 4.85s)
    tl.to(DOM.officialLogo, {
      opacity: 1,
      y: 0,
      duration: 0.50,
      ease: 'power3.out'
    }, T0 + 4.85);

    // 6. Slogan (T0 + 5.20s)
    const sloganSpans = DOM.slogan.querySelectorAll('span');
    tl.to(sloganSpans, {
      yPercent: 0,
      opacity: 1,
      duration: 0.45,
      stagger: 0.12,
      ease: 'power3.out'
    }, T0 + 5.20);

    // 7. Dekan potpis (T0 + 5.55s)
    tl.to([DOM.dekanTitle, DOM.dekanName], {
      y: 0,
      opacity: 1,
      duration: 0.45,
      stagger: 0.08,
      ease: 'power3.out'
    }, T0 + 5.55);

    // 8. Završetak točno u T0 + 6.00s – potpuna stabilnost i tišina
    tl.set({}, {}, T0 + 6.00);

    return tl;
  }

  // =========================================================================
  // 7. KONTROLNA LOGIKA & UPRAVLJANJE
  // =========================================================================

  let activeConfig = null;
  let activeTimeline = null;
  let activeFragmentElements = [];

  function initializeAndPlay(useCurrentSeed = false) {
    if (activeTimeline) {
      activeTimeline.kill();
    }

    const seed = useCurrentSeed && activeConfig ? activeConfig.seed : getUtcSeed();
    const now = new Date();

    activeConfig = createConfiguration(seed);
    DOM.seedBadge.textContent = formatUtcDisplay(
      now,
      activeConfig.palette.name,
      activeConfig.mode.name,
      activeConfig.geom.name,
      seed
    );

    activeFragmentElements = createFragments(activeConfig);
    setInitialState(activeConfig, activeFragmentElements);
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

  function replaySameTimeline() {
    if (!activeConfig || !activeTimeline) {
      initializeAndPlay(false);
      return;
    }

    activeTimeline.pause(0);
    setInitialState(activeConfig, activeFragmentElements);
    activeTimeline.restart();
  }

  DOM.replayBtn.addEventListener('click', (e) => {
    e.preventDefault();
    replaySameTimeline();
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
          initializeAndPlay(false);
        }
      };
      document.addEventListener('visibilitychange', onVisible);
    } else {
      hasStarted = true;
      initializeAndPlay(false);
    }
  }

  // Instant initial setup to guarantee zero-state before paint
  try {
    const immediateSeed = getUtcSeed();
    activeConfig = createConfiguration(immediateSeed);
    activeFragmentElements = createFragments(activeConfig);
    setInitialState(activeConfig, activeFragmentElements);
  } catch (err) {
    console.error('Init zero-state err:', err);
  }

  onPageFullyReady(() => {
    startWhenVisible();
  });

  window.seekTo = function(t) {
    if (activeTimeline) {
      activeTimeline.pause(t);
    }
  };

  window.playAnim = function() {
    if (activeTimeline) {
      activeTimeline.play();
    }
  };

})();
