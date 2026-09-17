// 1. Manage Pre-UI to Intro Sequence
  const body = document.body;
  const preUiLayer = document.getElementById('pre-ui-layer');
  const flashBang = document.getElementById('flash-bang');

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

  // 2b. Certificate viewer — clicking a card's "Certificate" link shows the image
  const certViewer = document.getElementById('overlay-cert-viewer');
  const certViewerImg = document.getElementById('cert-viewer-img');
  const certViewerCaption = document.getElementById('cert-viewer-caption');
  document.querySelectorAll('[data-cert-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.certView;
      if (!src || !certViewer || !certViewerImg) return;
      certViewerImg.src = src;
      if (certViewerCaption) {
        const card = btn.closest('.cert-card');
        const title = card ? card.querySelector('.cert-name')?.textContent : '';
        certViewerCaption.textContent = title || '';
      }
      certViewer.classList.add('open');
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

    const hoverTargets = 'a, button, .icon-btn, .social-icon, .close, .chat-msg, #chat-input, #chat-submit, #pre-ui-layer, .cert-card';
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
  }

  // 4. Crow caw — synthesized with Web Audio API
  let audioCtx;
  function playCaw() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      const duration = 0.28;

      const bufferSize = audioCtx.sampleRate * duration;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = audioCtx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1400, now);
      bandpass.frequency.exponentialRampToValueAtTime(500, now + duration);
      bandpass.Q.value = 2.2;

      const osc = audioCtx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + duration);

      const oscGain = audioCtx.createGain();
      oscGain.gain.setValueAtTime(0.15, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.5, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(oscGain).connect(audioCtx.destination);
      noise.connect(bandpass).connect(noiseGain).connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
      noise.start(now);
      noise.stop(now + duration);
    } catch (err) {
      // Web Audio not available — fail silently
    }
  }

  const crowBtn = document.getElementById('btn-bird');
  if (crowBtn) {
    crowBtn.addEventListener('click', playCaw);
    crowBtn.addEventListener('mouseenter', playCaw);
  }

  // 5. Ink Crow Chatbot Integration
  const chatRoot = document.getElementById('ink-crow-chat');
  const chatSend = document.querySelector('[data-chat-send]');
  const chatInput = document.querySelector('[data-chat-input]');
  const chatHistory = document.querySelector('[data-chat-history]');

  const chatKnowledge = "Renan Clint is an Information Technology student in Pasay City. Renan is the Secretary of the Junior Philippine Computer Society and a Dean's Lister. Renan is building WellPath, an AI-powered wellness monitoring and chronic disease risk prediction capstone project. Other projects include an Interactive Lesson Reviewer and a Pixel-World Portfolio. Visitors can reach Renan through the social links on this page.";
  let conversation = [];
  let isWaiting = false;

  if (chatRoot && chatSend && chatInput && chatHistory) {
    const addMessage = (role, text) => {
      const message = document.createElement('div');
      message.className = `chat-msg ${role === 'assistant' ? 'ai-msg' : 'user-msg'}`;
      message.textContent = text;
      chatHistory.appendChild(message);
      chatHistory.scrollTop = chatHistory.scrollHeight;
    };
    addMessage('assistant', 'Caw. I am the Ink Crow. Ask me about Renan, his work, or the ideas in this portfolio.');

    // Fallback response for missing API
    const localReply = (question) => {
      const query = question.toLowerCase();
      if (/hello|hi|hey|caw/.test(query)) return 'Caw, visitor. The ink is listening. What would you like to know?';
      if (/skill|tech|study|school|about|who/.test(query)) return "Renan is an IT student, JPCS Secretary, and Dean's Lister. Ask me about a project for more detail.";
      if (/project|work|build|wellpath/.test(query)) return "WellPath is Renan's AI wellness monitoring and chronic disease risk prediction capstone project.";
      return 'I cannot answer that right now. Try asking about Renan, WellPath, projects, skills, or contact details.';
    };

    const handleChatSubmit = async () => {
      const question = chatInput.value.trim();
      if (!question || isWaiting) return;
      
      addMessage('user', question);
      chatInput.value = '';
      isWaiting = true;
      
      const thinking = document.createElement('div');
      thinking.className = 'chat-msg ai-msg';
      thinking.textContent = '*ruffles feathers thinking...*';
      chatHistory.appendChild(thinking);

      try {
        const apiKey = ""; // Add Gemini API key if required for testing standalone
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
        
        conversation.push({ role: "user", parts: [{ text: question }] });

        const payload = {
          contents: conversation,
          systemInstruction: {
            parts: [{ text: `You are the Ink Crow. Be concise, warm, mysterious, and helpful. Use this knowledge: ${chatKnowledge}` }]
          },
        };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        const candidate = result.candidates?.[0];
        
        thinking.remove();

        if (candidate && candidate.content?.parts?.[0]?.text) {
          const aiText = candidate.content.parts[0].text;
          addMessage('assistant', aiText);
          conversation.push(candidate.content);
          playCaw();
        } else {
          throw new Error("Invalid response");
        }
      } catch (error) {
        thinking.remove();
        addMessage('assistant', `${localReply(question)} (API unavailable)`);
      }

      isWaiting = false;
    };
    
    chatSend.addEventListener('click', handleChatSubmit);
    chatInput.addEventListener('keydown', event => { if (event.key === 'Enter') handleChatSubmit(); });
  }

  // 6. Easter Egg: Type "rise" to pan up from the ground
  let keystrokeBuffer = '';
  const secretWord = 'rise';
  
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
      keystrokeBuffer += e.key.toLowerCase();
      
      if (keystrokeBuffer.length > secretWord.length) {
        keystrokeBuffer = keystrokeBuffer.slice(-secretWord.length);
      }
      
      if (keystrokeBuffer === secretWord) {
        document.body.classList.toggle('rise-active');
        keystrokeBuffer = ''; 
      }
    }
  });