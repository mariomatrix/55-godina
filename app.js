/**
 * FGAG 55 GODINA - GENERATIVNA WEB-ČESTITKA
 * Faze A, B i C: Animacija pozadine i formiranje vodenog žiga (0.00 – 3.40s)
 * 
 * Specifikacija: master_prompt.txt
 * Paleta: P01 Jubilejska žuta (#f7b512, #373435, #f5de8c, #FFEFC6)
 * Trajanje ove faze testiranja: Točno 3.40 sekundi
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. DEFINICIJA SLUŽBENIH PALETA I RESURSA (master_prompt.txt, Poglavlje 8)
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
      accentShape: '#373435'
    },
    {
      id: 'P02',
      name: 'P02 Crna i žuta',
      bg: '#1A1A1A',
      ink: '#FFFFFF',
      watermark: '#2D2D2D',
      primaryShape: '#FDB913',
      secondaryShape: '#FBDE76',
      accentShape: '#FFEFC6'
    },
    {
      id: 'P03',
      name: 'P03 Crvena',
      bg: '#EF4E52',
      ink: '#373435',
      watermark: '#F69896',
      primaryShape: '#FBCABD',
      secondaryShape: '#F69896',
      accentShape: '#373435'
    },
    {
      id: 'P04',
      name: 'P04 Zelena',
      bg: '#6AC17B',
      ink: '#373435',
      watermark: '#A9D7AE',
      primaryShape: '#CDE7CB',
      secondaryShape: '#A9D7AE',
      accentShape: '#373435'
    },
    {
      id: 'P05',
      name: 'P05 Magenta',
      bg: '#EF5CA1',
      ink: '#373435',
      watermark: '#F8C2DA',
      primaryShape: '#FBD6E6',
      secondaryShape: '#F8C2DA',
      accentShape: '#373435'
    },
    {
      id: 'P06',
      name: 'P06 Svijetloplava',
      bg: '#99BCCB',
      ink: '#373435',
      watermark: '#BCDAE7',
      primaryShape: '#D6E2E9',
      secondaryShape: '#BCDAE7',
      accentShape: '#373435'
    },
    {
      id: 'P07',
      name: 'P07 Navy',
      bg: '#524FA1',
      ink: '#FFFFFF',
      watermark: '#6B67BA',
      primaryShape: '#C7C4E2',
      secondaryShape: '#A5A9D5',
      accentShape: '#FFFFFF'
    }
  ];

  // Tri izvorne SVG geometrije znaka FGAG za sekundarne leteće oblike
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

  function formatUtcDisplay(date, paletteName, modeName, seed) {
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} UTC`;
    return `${timeStr} | ${paletteName} | ${modeName} (#${seed % 100000})`;
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
    
    // 1. Odabir palete na temelju seeda (ili URL parametra ?palette=)
    const params = new URLSearchParams(window.location.search);
    const paletteParam = params.get('palette');
    let palette = null;
    if (paletteParam) {
      palette = OFFICIAL_PALETTES.find(p => p.id.toLowerCase() === paletteParam.toLowerCase());
    }
    if (!palette) {
      const paletteIndex = Math.floor(random() * OFFICIAL_PALETTES.length);
      palette = OFFICIAL_PALETTES[paletteIndex];
    }

    // 2. Odabir karaktera eksplozije na temelju seeda
    const modeIndex = Math.floor(random() * EXPLOSION_MODES.length);
    const mode = EXPLOSION_MODES[modeIndex];

    // 3. Generativni broj fragmenata (između 15 i 24)
    const fragmentCount = 15 + Math.floor(random() * 9);
    const fragments = [];

    // Žarište eksplozije (kod asimetričnog režima pomaknuto)
    const focusX = mode.id === 'asymmetric' ? (random() * 160 - 80) : 0;
    const focusY = mode.id === 'asymmetric' ? (random() * 140 - 70) : 0;

    for (let i = 0; i < fragmentCount; i++) {
      const shapeType = i % 3; // 0: poligon, 1: trokut, 2: luk
      
      // Boje fragmenata usklađene s odabranom paletom
      let color;
      let opacityBurst;
      if (i === 3 || i === 11 || (fragmentCount > 18 && i === 17)) {
        color = palette.accentShape; // Strukturni akcent
        opacityBurst = 0.55 + random() * 0.25;
      } else if (i % 2 === 0) {
        color = palette.secondaryShape;
        opacityBurst = 0.85 + random() * 0.15;
      } else {
        color = palette.primaryShape;
        opacityBurst = 0.90 + random() * 0.10;
      }

      // Kretanje ovisno o prostornom karakteru
      let burstX, burstY;
      const baseDistance = 280 + random() * 480;

      if (mode.id === 'diagonal') {
        const diagAngle = (random() > 0.5 ? Math.PI * 0.25 : Math.PI * 1.25) + (random() * 0.7 - 0.35);
        burstX = Math.cos(diagAngle) * (baseDistance * 1.15);
        burstY = Math.sin(diagAngle) * (baseDistance * 0.95);
      } else if (mode.id === 'horizontal') {
        const horizSign = random() > 0.5 ? 1 : -1;
        burstX = horizSign * (300 + random() * 450);
        burstY = (random() * 260 - 130);
      } else if (mode.id === 'vertical') {
        const vertSign = random() > 0.5 ? 1 : -1;
        burstX = (random() * 240 - 120);
        burstY = vertSign * (280 + random() * 420);
      } else if (mode.id === 'vortex') {
        const spiralAngle = (i / fragmentCount) * Math.PI * 2 + (random() * 0.4);
        const spiralDist = baseDistance * (0.8 + (i / fragmentCount) * 0.5);
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

      // Mjerila: monumentalne krovne/zidne plohe (2.5 do 3.8x) te manji akcenti
      let scaleBurst;
      if (i < 4) {
        scaleBurst = 2.6 + random() * 1.2;
      } else if (i < 12) {
        scaleBurst = 1.3 + random() * 0.8;
      } else {
        scaleBurst = 0.65 + random() * 0.45;
      }

      const rotationBurst = (random() * 480 - 240);
      const delayBurst = 0.22 + (random() * 0.18);
      const dissolveDelay = 1.75 + (i * 0.022) + (random() * 0.08);

      fragments.push({
        id: `frag-${i}`,
        shapeType,
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

    // 3. Generativne polazne putanje za tri osnovna dijela vodenog žiga
    const wmPieces = {
      left: {
        burstX: -200 - random() * 120,
        burstY: -90 - random() * 120,
        scaleBurst: 2.0 + random() * 0.7,
        rotationBurst: -45 + random() * 25,
        delayBurst: 0.24 + random() * 0.08,
        convDelay: 1.90 + random() * 0.08
      },
      center: {
        burstX: -40 + random() * 80,
        burstY: -190 - random() * 120,
        scaleBurst: 2.1 + random() * 0.8,
        rotationBurst: 15 + random() * 35,
        delayBurst: 0.26 + random() * 0.08,
        convDelay: 1.93 + random() * 0.08
      },
      right: {
        burstX: 190 + random() * 130,
        burstY: 90 + random() * 120,
        scaleBurst: 1.9 + random() * 0.7,
        rotationBurst: -45 + random() * 30,
        delayBurst: 0.28 + random() * 0.08,
        convDelay: 1.96 + random() * 0.08
      }
    };

    return {
      seed,
      palette,
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
    fragmentsLayer: document.getElementById('fragments-layer'),
    centralWrap: document.getElementById('central-symbol-wrap'),
    pieceLeft: document.getElementById('piece-left'),
    pieceCenter: document.getElementById('piece-center'),
    pieceRight: document.getElementById('piece-right'),
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
      el.className = 'fragment-item';
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
    // 1. Dinamički postavi boje odabrane službene palete
    DOM.card.style.backgroundColor = config.palette.bg;
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

    // Jubilej 55 i godine 1971. - 2026. (arhitektonska maska iz horizonta)
    gsap.set(DOM.jubileeNum, {
      yPercent: 115,
      opacity: 0,
      display: 'block'
    });

    gsap.set(DOM.jubileeYears, {
      yPercent: 115,
      opacity: 0,
      display: 'block'
    });

    // Tekst čestitke
    gsap.set(DOM.greetingMsg, {
      y: 12,
      opacity: 0,
      display: 'block'
    });

    // Horizontalne crte (spremne za precizno arhitektonsko crtanje s lijeva nadesno)
    gsap.set([DOM.rule1, DOM.rule2], {
      scaleX: 0,
      opacity: 0,
      transformOrigin: 'left center',
      display: 'block'
    });

    // Službeni institucionalni logotip (simbol + tekst)
    gsap.set(DOM.institutionZone, {
      display: 'flex',
      opacity: 1
    });

    gsap.set(DOM.officialLogo, {
      opacity: 0,
      y: 8,
      display: 'block'
    });

    // Slogan (dva retka, precizno lijevo poravnanje)
    const sloganSpans = DOM.slogan.querySelectorAll('span');
    gsap.set(DOM.slogan, {
      display: 'flex',
      opacity: 1
    });

    gsap.set(sloganSpans, {
      yPercent: 40,
      opacity: 0
    });

    // Dekan potpis
    gsap.set([DOM.dekanTitle, DOM.dekanName], {
      y: 10,
      opacity: 0,
      display: 'block'
    });

    // Sekundarni leteći oblici
    fragmentElements.forEach((el) => {
      gsap.set(el, {
        x: 0,
        y: 0,
        scale: 0.1,
        rotation: 0,
        opacity: 0,
        xPercent: -50,
        yPercent: -50
      });
    });

    // Centralni crni znak FGAG - potpuno sakriven (animacija počinje iz čistog, praznog prostora)
    gsap.set(DOM.centralWrap, {
      display: 'none',
      opacity: 0,
      visibility: 'hidden'
    });

    gsap.set([DOM.pieceLeft, DOM.pieceCenter, DOM.pieceRight], {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: 0
    });

    // Vodeni žig - pripremi dijelove za rođenje iz eksplozije
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
  // 6. IZGRADNJA TIMELINEA: FAZE A, B i C (0.00 – 3.40s)
  // "ZNANJE KOJE MIJENJA PROSTOR"
  // =========================================================================

  function buildTimeline(config, fragmentElements) {
    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: 'power2.out' }
    });

    // -----------------------------------------------------------------------
    // FAZA 1: PRAZNA POZADINA / ČISTI PROSTOR (0.00 – 0.22s)
    // Monokromatska jubilarna žuta ploha. Tišina. Neobrađeni prostor.
    // -----------------------------------------------------------------------

    // -----------------------------------------------------------------------
    // FAZA 2: "ZNANJE KOJE MIJENJA PROSTOR" - PROSTORNA EKSPLOZIJA (0.22 – 1.80s)
    // Iz središta čistog prostora eruptira geometrija:
    // Arhitektonske plohe (krem #FFEFC6, zlato #FBDE76 i tamni rezovi #373435)
    // eksplodiraju, preklapaju se, rotiraju i doslovno preoblikuju žuti prostor.
    // -----------------------------------------------------------------------
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

    // Tri temeljne plohe vodenog žiga rađaju se iz središnje eksplozije (generativne putanje određene seedom)
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
      opacity: 0.92,
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
      opacity: 0.92,
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
      opacity: 0.92,
      duration: 1.50,
      ease: 'power3.out'
    }, config.wmPieces.right.delayBurst);

    // -----------------------------------------------------------------------
    // FAZA 3: ORGANIZACIJA GEOMETRIJE & KRISTALIZACIJA VODENOG ŽIGA (1.80 – 3.40s)
    // Znanje unosi red: raspršeni oblici usporavaju i nestaju u podlozi,
    // a 3 glavne plohe vodenog žiga glatko dosjedaju i stapaju se u službeni znak
    // s točno 0,00 px razmaka (Zero Gap).
    // -----------------------------------------------------------------------
    // 1. Raspršene sekundarne plohe gase se i nestaju
    fragmentElements.forEach((el, index) => {
      const frag = config.fragments[index];
      tl.to(el, {
        scale: 0.2,
        opacity: 0,
        duration: 0.95,
        ease: 'power2.inOut'
      }, frag ? frag.dissolveDelay : (1.85 + (index * 0.025)));
    });

    // 2. Tri plohe vodenog žiga konvergiraju u točni službeni oblik (Zero Gap)
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

    // 3. Arhitektonski reveal jubileja: broj 55 i raspon 1971. – 2026.
    // Pojavljuju se točno ~0,5 s nakon što se vodeni žig u pozadini potpuno stabilizira (3,36s).
    // Prvo iz horizonta autoritativno izranja monumentalni broj 55 (3,86s),
    // a odmah s ritmičkim pomakom od 0,20 s sljubljuje se raspon 1971. – 2026. (4,06s).
    tl.to(DOM.jubileeNum, {
      yPercent: 0,
      opacity: 1,
      duration: 0.80,
      ease: 'power3.out'
    }, 3.86);

    tl.to(DOM.jubileeYears, {
      yPercent: 0,
      opacity: 1,
      duration: 0.70,
      ease: 'power3.out'
    }, 4.06);

    // 4. Tekst čestitke (4.25s)
    tl.to(DOM.greetingMsg, {
      y: 0,
      opacity: 1,
      duration: 0.55,
      ease: 'power3.out'
    }, 4.25);

    // 5. Horizontalne crte (4.60s)
    // "Sada se pojavljuju horizontalne crte"
    tl.to([DOM.rule1, DOM.rule2], {
      scaleX: 1,
      opacity: 0.95,
      duration: 0.45,
      stagger: 0.08,
      ease: 'power3.out'
    }, 4.60);

    // 6. Službeni znak sa tekstom u crnoj boji (4.85s)
    // "a odmah nakon toga i službeni znak sa tekstom u crnoj boji. Znak mora biti poravnat identično kao na draft cestitke 1.png."
    tl.to(DOM.officialLogo, {
      opacity: 1,
      y: 0,
      duration: 0.50,
      ease: 'power3.out'
    }, 4.85);

    // 7. Slogan (5.20s)
    // "Zatim se pojavljuje slogan (pazi na poravnjanje)"
    const sloganSpans = DOM.slogan.querySelectorAll('span');
    tl.to(sloganSpans, {
      yPercent: 0,
      opacity: 1,
      duration: 0.45,
      stagger: 0.12,
      ease: 'power3.out'
    }, 5.20);

    // 8. Dekan potpis (5.55s)
    // "i na kraju Dekan"
    tl.to([DOM.dekanTitle, DOM.dekanName], {
      y: 0,
      opacity: 1,
      duration: 0.45,
      stagger: 0.08,
      ease: 'power3.out'
    }, 5.55);

    // 9. Završetak točno u 6.00s – potpuna stabilnost i dostojanstven mir
    tl.set({}, {}, 6.00);

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
    DOM.seedBadge.textContent = formatUtcDisplay(now, activeConfig.palette.name, activeConfig.mode.name, seed);
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

  // Pouzdano pokretanje
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initializeAndPlay(false));
  } else {
    initializeAndPlay(false);
  }

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
