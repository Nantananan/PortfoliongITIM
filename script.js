// 1. Manage Pre-UI to Intro Sequence
  const body = document.body;
  const preUiLayer = document.getElementById('pre-ui-layer');
  const flashBang = document.getElementById('flash-bang');

  function spawnRipple(delay) {
    setTimeout(() => {
      const ripple = document.createElement('div');
      ripple.className = 'flash-ripple';
      document.body.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    }, delay);
  }

  preUiLayer.addEventListener('click', () => {
    // Disable clicks during transition
    preUiLayer.style.pointerEvents = 'none';
    
    // Hide "Click to Awaken" text immediately
    const textLayer = document.querySelector('.pre-ui-text');
    if(textLayer) textLayer.style.opacity = '0';
    
    // Trigger the sun's explosive scale and white-out effect
    const sunWrapper = document.getElementById('btn-sun-wrapper');
    sunWrapper.classList.add('flash-explode');
    
    // Wait for the sun to swell and blind the camera (~600ms)
    setTimeout(() => {
      // Trigger solid white overlay just as sun peaks, hiding the layout swap
      flashBang.classList.add('flash-active');

      // Two staggered ink ripples pulse outward from center right as everything goes white
      spawnRipple(0);
      spawnRipple(90);

      setTimeout(() => {
        // Swap core UI classes while screen is entirely white
        body.classList.remove('pre-ui-active');
        body.classList.add('intro-active');
        
        // Snap the sun instantly to its final position behind the flashbang
        sunWrapper.style.transition = 'none';
        sunWrapper.classList.remove('flash-explode');
        
        // Force the browser to apply the snap immediately
        void sunWrapper.offsetWidth;
        
        // Restore standard transitions for future hover effects
        sunWrapper.style.transition = '';
        
        // Begin the fade down of the flashbang overlay directly to the landing page
        flashBang.classList.remove('flash-active'); 
        preUiLayer.style.opacity = '0'; 
        
        // Cleanup intro classes after the fade is complete
        setTimeout(() => {
          body.classList.remove('intro-active');
          preUiLayer.remove(); 
          flashBang.remove();
        }, 1500);
      }, 50); // Keep flash solid for 50ms to ensure clean swap
    }, 550); // Fire slightly before the 650ms explosion ends to seamlessly blend
  });

  // 2a. Projects — themed cards rendered into the Projects modal, each
  //     opening a shared detail modal that re-skins itself per project.
  const projectData = [
    {
      id: 'slotty',
      theme: 'slotty',
      glyph: '\u{1F3B0}',
      tag: 'GAME · UI ANIMATION',
      title: 'Slotty',
      blurb: 'A slot-machine mini-game — reel spin physics and a casino-neon feel just for leisures.',
      desc: 'Slotty is an interactive slot-machine game built to explore reel-spin animation and satisfying win/lose feedback loops. It leans into a high-contrast, casino aesthetic with tactile spin and win animations.',
      code: 'https://github.com/Nantananan/Slotty',
      view: 'https://nantananan.github.io/Slotty/'
    },
    {
      id: 'littleprince',
      theme: 'littleprince',
      glyph: '\u{1F30C}',
      tag: 'STORYTELLING · WEB',
      title: 'Little Prince',
      blurb: 'An immersive, scroll-driven web experience reimagining The Little Prince under the stars, featuring delicate illustrations by <a href="https://erika-dc.github.io/Erika_Portfolio/#contact" target="_blank" rel="noopener" class="inline-link">Erika Abigail "Malupet" Cuarteron De Castro</a> ',
      desc: 'A scroll-driven interactive retelling inspired by The Little Prince, built around soft illustration, gentle parallax, and pacing that mirrors the book\u2019s reflective tone. The night-sky palette and starlit motion carry the mood scene to scene.',
      code: 'https://github.com/Nantananan/SKIES',
      view: 'https://nantananan.github.io/SKIES/'
    },
    {
      id: 'halikha',
      theme: 'halikha',
      glyph: '\u{2728}',
      tag: 'CULTURE · WEB APP',
      title: 'Halikha',
      blurb: 'A warm, community-rooted web experience with a hand-woven, terracotta visual identity. ',
      desc: 'Halikha is a web app built around a warm, terracotta-and-linen visual identity inspired by local craft and community. The interface favors soft textures and inviting typography over sharp, corporate UI patterns.',
      status: 'in-progress',
      code: '#',
      view: '#'
    },
    {
      id: 'woord',
      theme: 'woord',
      glyph: '\u{1F4D6}',
      tag: 'WORD GAME · LOGIC',
      title: 'Woord',
      blurb: 'A minimalist word-guessing game with clean typography and a Crucible to discover new words. Collaborative Work with <a href="https://cozyportfolio.vercel.app" target="_blank" rel="noopener" class="inline-link">Tyrone Olbes</a>, <a href="https://drimport-ruddy.vercel.app/#services" target="_blank" rel="noopener" class="inline-link">Josh Velasco</a>, and <a href="https://rzantua022.github.io/My-Portfolio/#top" target="_blank" rel="noopener" class="inline-link">Ranel Zantua</a> ',
      desc: 'Woord is a minimalist word-guessing game focused on clean typographic feedback and a Witch themed interface. The emphasis is on fast round-trip logic and a distraction-free board.',
      status: 'in-progress',
      code: '#',
      view: '#'
    },
    {
      id: 'kuyawell',
      theme: 'kuyawell',
      glyph: '\u{1FA7A}',
      tag: 'HEALTH TECH · AI',
      title: 'KuyaWell',
      blurb: 'A friendly wellness companion app with a calm clinical-teal interface,.',
      desc: 'KuyaWell is a wellness-companion app with a calm, clinical-teal interface designed to feel approachable rather than sterile \u2014 built alongside the WellPath capstone\u2019s wellness monitoring and risk-prediction work.',
      status: 'in-progress',
      code: '#',
      view: '#'
    }
  ];

  const projectGrid = document.getElementById('project-grid');
  if (projectGrid) {
    projectData.forEach(p => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.dataset.theme = p.theme;
      card.dataset.glyph = p.glyph;
      card.dataset.hoverLabel = 'VIEW PROJECT &raquo;';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'View project: ' + p.title);
      card.innerHTML = `
        <div>
          <div class="pc-tag mono">${p.tag}</div>
          ${p.status === 'in-progress' ? '<span class="pc-status-badge mono">IN PROGRESS</span>' : ''}
          <div class="pc-title">${p.title}</div>
          <div class="pc-blurb">${p.blurb}</div>
        </div>
        <div class="pc-cta">Open
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </div>`;
      projectGrid.appendChild(card);
    });
  }

  const projectDetailOverlay = document.getElementById('overlay-project-detail');
  const projectDetailModal = document.getElementById('project-detail-modal');
  const pdTag = document.getElementById('pd-tag');
  const pdTitle = document.getElementById('pd-title');
  const pdDesc = document.getElementById('pd-desc');
  const pdGlyph = document.getElementById('pd-glyph');
  const pdCode = document.getElementById('pd-code');
  const pdView = document.getElementById('pd-view');
  const pdStatus = document.getElementById('pd-status');

  function openProjectDetail(project) {
    if (!projectDetailOverlay || !projectDetailModal) return;
    projectDetailModal.className = 'modal project-detail-modal theme-' + project.theme;
    pdTag.textContent = project.tag;
    pdTitle.textContent = project.title;
    pdDesc.innerHTML = project.desc;
    pdGlyph.textContent = project.glyph;
    pdCode.href = project.code || '#';
    pdView.href = project.view || '#';
    if (pdStatus) {
      pdStatus.hidden = project.status !== 'in-progress';
    }
    projectDetailOverlay.classList.add('open');
  }

  if (projectGrid) {
    projectGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.project-card');
      if (!card) return;
      const project = projectData.find(p => p.theme === card.dataset.theme);
      if (project) openProjectDetail(project);
    });
    projectGrid.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.project-card');
      if (!card) return;
      e.preventDefault();
      const project = projectData.find(p => p.theme === card.dataset.theme);
      if (project) openProjectDetail(project);
    });
  }

  // 2. Modal Open/Close Logic
  document.querySelectorAll('.icon-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Prevent opening modals if Pre-UI is active
      if (body.classList.contains('pre-ui-active')) return;
      e.preventDefault();
      const id = 'overlay-' + btn.dataset.modal;
      const modal = document.getElementById(id);
      if(modal) modal.classList.add('open');
    });
  });

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.overlay').classList.remove('open');
    });
  });

  // 2b. Certificate viewer — clicking a card preview shows the full image
  const certViewer = document.getElementById('overlay-cert-viewer');
  const certViewerImg = document.getElementById('cert-viewer-img');
  const certViewerCaption = document.getElementById('cert-viewer-caption');
  document.querySelectorAll('[data-cert-view]').forEach(btn => {
    const openCert = () => {
      const src = btn.dataset.certView;
      if (!src || !certViewer || !certViewerImg) return;
      certViewerImg.src = src;
      if (certViewerCaption) {
        certViewerCaption.textContent = btn.dataset.certTitle || '';
      }
      certViewer.classList.add('open');
    };
    btn.addEventListener('click', openCert);
    // These are plain divs now (not <button>), so wire up keyboard activation manually
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCert();
      }
    });
  });

  document.querySelectorAll('.overlay').forEach(ov => {
    ov.addEventListener('click', (e) => {
      if (e.target === ov) ov.classList.remove('open');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    }
  });

  // 3. Custom ink cursor
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
    let ringX = window.innerWidth / 2, ringY = window.innerHeight / 2;
    let mouseX = ringX, mouseY = ringY;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const hoverTargets = 'a, button, .icon-btn, .social-icon, .close, #pre-ui-layer, .cert-card, .project-card, .pd-btn';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
    });

    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '0.6';
    });

    // Ink splatter burst on click — a small cluster of irregular blots
    document.addEventListener('mousedown', (e) => {
      if (body.classList.contains('pre-ui-active')) return; // don't splatter over the awaken screen
      spawnInkSplat(e.clientX, e.clientY);
    });
  }

  function spawnInkSplat(x, y) {
    const splat = document.createElement('div');
    splat.className = 'ink-splat';
    splat.style.left = x + 'px';
    splat.style.top = y + 'px';

    const blotCount = 5 + Math.floor(Math.random() * 3); // 5–7 blots per burst
    for (let i = 0; i < blotCount; i++) {
      const blot = document.createElement('div');
      blot.className = 'blot';

      const size = 4 + Math.random() * 14;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 22;
      const offsetX = Math.cos(angle) * dist;
      const offsetY = Math.sin(angle) * dist;
      const delay = Math.random() * 0.06;
      const rotate = Math.floor(Math.random() * 360);

      blot.style.width = size + 'px';
      blot.style.height = size + 'px';
      blot.style.left = offsetX + 'px';
      blot.style.top = offsetY + 'px';
      blot.style.animationDelay = delay + 's';
      blot.style.transform = `translate(-50%, -50%) rotate(${rotate}deg)`;

      splat.appendChild(blot);
    }

    document.body.appendChild(splat);
    setTimeout(() => splat.remove(), 750);
  }

  const projectsOverlay = document.getElementById('overlay-projects');

  // 3b. Cursor-following hover label (speech-bubble style)
  const hoverLabel = document.createElement('div');
  hoverLabel.id = 'hover-label';
  hoverLabel.innerHTML = '<span class="hover-label-text"></span>';
  document.body.appendChild(hoverLabel);
  const hoverLabelText = hoverLabel.querySelector('.hover-label-text');

  let hoverLabelX = 0, hoverLabelY = 0;
  let hoverLabelTargetX = 0, hoverLabelTargetY = 0;
  let hoverLabelActive = false;
  let hoverLabelRafStarted = false;

  document.addEventListener('mousemove', (e) => {
    hoverLabelTargetX = e.clientX;
    hoverLabelTargetY = e.clientY;
  });

  function animateHoverLabel() {
    hoverLabelX += (hoverLabelTargetX - hoverLabelX) * 0.25;
    hoverLabelY += (hoverLabelTargetY - hoverLabelY) * 0.25;
    hoverLabel.style.transform = `translate(${hoverLabelX + 22}px, ${hoverLabelY - 18}px)`;
    if (hoverLabelActive || Math.abs(hoverLabelTargetX - hoverLabelX) > 0.5 || Math.abs(hoverLabelTargetY - hoverLabelY) > 0.5) {
      requestAnimationFrame(animateHoverLabel);
    } else {
      hoverLabelRafStarted = false;
    }
  }

  document.querySelectorAll('[data-hover-label]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (body.classList.contains('pre-ui-active')) return;
      hoverLabelText.innerHTML = el.dataset.hoverLabel;
      hoverLabelX = hoverLabelTargetX;
      hoverLabelY = hoverLabelTargetY;
      hoverLabel.style.transform = `translate(${hoverLabelX + 22}px, ${hoverLabelY - 18}px)`;
      hoverLabel.classList.add('hover-label-show');
      hoverLabelActive = true;
      if (!hoverLabelRafStarted) {
        hoverLabelRafStarted = true;
        requestAnimationFrame(animateHoverLabel);
      }
    });
    el.addEventListener('mouseleave', () => {
      hoverLabel.classList.remove('hover-label-show');
      hoverLabelActive = false;
    });
  });


  // 3c. Cursor-reactive background glow
  const bgGlow = document.getElementById('bg-glow');
  if (bgGlow && window.matchMedia('(pointer: fine)').matches) {
    let glowTargetX = 50, glowTargetY = 50;
    let glowRafPending = false;

    document.addEventListener('mousemove', (e) => {
      glowTargetX = (e.clientX / window.innerWidth) * 100;
      glowTargetY = (e.clientY / window.innerHeight) * 100;
      if (!glowRafPending) {
        glowRafPending = true;
        requestAnimationFrame(() => {
          bgGlow.style.setProperty('--mx', glowTargetX + '%');
          bgGlow.style.setProperty('--my', glowTargetY + '%');
          glowRafPending = false;
        });
      }
    });
  }

  // 4. Crow caw — plays an imported audio file
  const cawAudio = new Audio('crow/CawCaw.mp3');
  cawAudio.volume = 0.7;
  cawAudio.preload = 'auto';

  function playCaw() {
    try {
      // Clone the node so rapid/overlapping triggers (hover + click) don't cut each other off
      const sound = cawAudio.cloneNode();
      sound.volume = cawAudio.volume;
      sound.play().catch(() => {
        // Autoplay can be blocked before the user has interacted with the page — fail silently
      });
    } catch (err) {
      // Audio not available — fail silently
    }
  }

  const wowAudio = new Audio('crow/wowow.mp3');
  wowAudio.volume = 0.7;
  wowAudio.preload = 'auto';

  function playWow() {
    try {
      // Clone the node so rapid/overlapping triggers (hover + click) don't cut each other off
      const sound = wowAudio.cloneNode();
      sound.volume = wowAudio.volume;
      sound.play().catch(() => {
        // Autoplay can be blocked before the user has interacted with the page — fail silently
      });
    } catch (err) {
      // Audio not available — fail silently
    }
  }

  const crowBtn = document.getElementById('btn-bird');
  if (crowBtn) {
    crowBtn.addEventListener('click', playCaw);
    crowBtn.addEventListener('mouseenter', playCaw);
  }

  // 6. Easter Eggs: type a secret word to trigger something
  let keystrokeBuffer = '';
  const secretWords = ['rise', 'halemaw', 'wally', 'spider'];
  const maxSecretLength = Math.max(...secretWords.map(w => w.length));

  // Popup element for the "halemaw" easter egg
  const halemawPopup = document.createElement('div');
  halemawPopup.id = 'halemaw-popup';
  halemawPopup.innerHTML = '<img src="assets/halmw.png" alt="Secret" class="halemaw-img" onerror="this.src=\'https://placehold.co/160x160/transparent/black?text=%3F%3F%3F\'" />';
  document.body.appendChild(halemawPopup);
  let halemawVisible = false;

  function triggerHalemaw() {
    halemawVisible = !halemawVisible;
    halemawPopup.classList.toggle('halemaw-show', halemawVisible);
    halemawPopup.classList.toggle('halemaw-hide', !halemawVisible);
    playWow();
  }

  // Popup element for the "wally" easter egg — peeks in from the side,
  // like a game of hide-and-seek
  const wallyPopup = document.createElement('div');
  wallyPopup.id = 'wally-popup';
  wallyPopup.innerHTML = '<img src="assets/wally.png" alt="Secret" class="wally-img" onerror="this.src=\'https://placehold.co/160x220/transparent/black?text=Wally\'" />';
  document.body.appendChild(wallyPopup);
  let wallyVisible = false;

  function triggerWally() {
    wallyVisible = !wallyVisible;
    wallyPopup.classList.toggle('wally-show', wallyVisible);
    wallyPopup.classList.toggle('wally-hide', !wallyVisible);
    playWow();
  }

  // Popup element for the "spider" easter egg — crawls up from below and
  // settles over on the left, panning diagonally like it's climbing into frame
  const spiderPopup = document.createElement('div');
  spiderPopup.id = 'spider-popup';
  spiderPopup.innerHTML = '<img src="assets/spidah.png" alt="Secret" class="spider-img" onerror="this.src=\'https://placehold.co/200x200/transparent/black?text=Spider\'" />';
  document.body.appendChild(spiderPopup);
  let spiderVisible = false;

  function triggerSpider() {
    spiderVisible = !spiderVisible;
    spiderPopup.classList.toggle('spider-show', spiderVisible);
    spiderPopup.classList.toggle('spider-hide', !spiderVisible);
  }

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
      keystrokeBuffer += e.key.toLowerCase();

      if (keystrokeBuffer.length > maxSecretLength) {
        keystrokeBuffer = keystrokeBuffer.slice(-maxSecretLength);
      }

      if (keystrokeBuffer.endsWith('rise')) {
        document.body.classList.toggle('rise-active');
        keystrokeBuffer = '';
      } else if (keystrokeBuffer.endsWith('halemaw')) {
        triggerHalemaw();
        keystrokeBuffer = '';
      } else if (keystrokeBuffer.endsWith('wally')) {
        triggerWally();
        keystrokeBuffer = '';
      } else if (keystrokeBuffer.endsWith('spider')) {
        triggerSpider();
        keystrokeBuffer = '';
      }
    }
  });


  // 7. Crow chatbot — chat logic for #overlay-crow
  // Replies are scripted below. To hook up a real AI backend later, replace
  // getCrowReply() with an async fetch() to your own server endpoint.
  (function initCrowChat() {
    const overlay = document.getElementById('overlay-crow');
    const messages = document.getElementById('crow-messages');
    const input = document.getElementById('crow-input');
    const sendBtn = document.getElementById('crow-send');
    const chips = document.getElementById('crow-suggestions');
    if (!overlay || !messages || !input || !sendBtn) return;

    const replies = [
      { keys: ['project', 'built', 'portfolio'],
        text: 'Renan has built Slotty (a slot-machine game), a scroll-driven Little Prince retelling, and more. Click the lantern on the main page to see them all. Caw!' },
      { keys: ['skill', 'tech', 'stack', 'language'],
        text: 'JavaScript, React, TypeScript, Java, C++, SQL, Figma, Canva and illustration. Design and code, both in ink.' },
      { keys: ['contact', 'email', 'reach', 'hire', 'phone', 'call'],
        text: 'Email: renanclint@gmail.com. He is also on GitHub and LinkedIn (links in the corner of the page).' },
      { keys: ['cert', 'credential', 'course'],
        text: 'Python, Ethical Hacking, Figma, Canva, Java & C++, Web Design, JavaScript and more. Tap the mushroom to view them.' },
      { keys: ['cv', 'resume'],
        text: 'You can download his CV from the About Me section (tap the sun).' },
      { keys: ['who', 'about', 'renan', 'student'],
        text: 'Renan Clint Edis is an IT student from Pasay City who loves crafting intuitive, engaging digital experiences. Tap the sun for his full story.' },
      { keys: ['hello', 'hi', 'hey', 'caw'],
        text: 'Caw caw! Ask me about Renan\u2019s projects, skills, certificates or how to reach him.' }
    ];
    const fallbacks = [
      'Hmm, the ink has not dried on that one. Try asking about projects, skills, certificates or contact.',
      'Caw? I only know about Renan and his work. Ask me about those!'
    ];

    function getCrowReply(text) {
      const q = text.toLowerCase();
      const hit = replies.find(r => r.keys.some(k => q.includes(k)));
      return hit ? hit.text : fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    function addMessage(text, who) {
      const el = document.createElement('div');
      el.className = 'crow-msg ' + who;
      el.textContent = text; // textContent, never innerHTML, so user input can't inject markup
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
      return el;
    }

    let busy = false;
    function send(text) {
      text = text.trim();
      if (!text || busy) return;
      busy = true;
      addMessage(text, 'user');
      input.value = '';
      if (chips) chips.classList.add('hidden');

      const typing = document.createElement('div');
      typing.className = 'crow-msg bot typing';
      typing.innerHTML = '<span></span><span></span><span></span>';
      messages.appendChild(typing);
      messages.scrollTop = messages.scrollHeight;

      setTimeout(() => {
        typing.remove();
        addMessage(getCrowReply(text), 'bot');
        busy = false;
        input.focus();
      }, 600 + Math.random() * 500);
    }

    sendBtn.addEventListener('click', () => send(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); send(input.value); }
    });
    if (chips) {
      chips.querySelectorAll('.crow-chip').forEach(chip => {
        chip.addEventListener('click', () => send(chip.dataset.q));
      });
    }

    // Greeting + autofocus the first time the modal opens
    let greeted = false;
    new MutationObserver(() => {
      if (!overlay.classList.contains('open')) return;
      if (!greeted) {
        greeted = true;
        addMessage('Caw! I am the Ink Crow. What would you like to know about Renan?', 'bot');
      }
      setTimeout(() => input.focus(), 350);
    }).observe(overlay, { attributes: true, attributeFilter: ['class'] });
  })();