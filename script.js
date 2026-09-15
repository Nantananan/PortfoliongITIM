// 1. Manage Intro Sequence
  setTimeout(() => {
    document.body.classList.remove('intro-active');
  }, 2000);

  // 2. Modal Open/Close Logic
  document.querySelectorAll('.icon-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
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

  // 2b. Custom ink cursor
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

    const hoverTargets = 'a, button, .icon-btn, .social-icon, .close, .chat-msg, .chat-input, .chat-submit';
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

  // 2c. Crow caw — synthesized with the Web Audio API, no audio file needed
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

  // 3. Chat AI Logic (Guarded to prevent errors if elements are missing)
  const chatSubmit = document.getElementById('chat-submit');
  const chatInput = document.getElementById('chat-input');
  const chatHistory = document.getElementById('chat-history');

  if (chatSubmit && chatInput && chatHistory) {
    
    let isWaiting = false;
    let conversation = [];

    const handleChatSubmit = async () => {
      const text = chatInput.value.trim();
      if (!text || isWaiting) return;

      // Add user message to UI
      const userDiv = document.createElement('div');
      userDiv.className = 'chat-msg user-msg';
      userDiv.textContent = text;
      chatHistory.appendChild(userDiv);
      chatInput.value = '';
      chatHistory.scrollTop = chatHistory.scrollHeight;

      // Add loading state
      const loadDiv = document.createElement('div');
      loadDiv.className = 'chat-msg ai-msg';
      loadDiv.innerHTML = '<i>*ruffles feathers thinking...*</i>';
      chatHistory.appendChild(loadDiv);
      chatHistory.scrollTop = chatHistory.scrollHeight;

      isWaiting = true;

      try {
        const apiKey = ""; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
        
        conversation.push({ role: "user", parts: [{ text: text }] });

        const payload = {
          contents: conversation,
          systemInstruction: {
            parts: [{ text: "You are the Ink Crow, a mystical, poetic raven drawn in ink. You live on the portfolio website of Renan Clint. Renan is an IT student in Pasay City, JPCS Secretary, Dean's Lister, and creator of WellPath (an AI wellness app). Answer questions about him briefly and somewhat mysteriously, keeping your responses to 1 or 2 short sentences. Caw occasionally." }]
          },
        };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        const candidate = result.candidates?.[0];
        
        loadDiv.remove();

        if (candidate && candidate.content?.parts?.[0]?.text) {
          const aiText = candidate.content.parts[0].text;
          const aiDiv = document.createElement('div');
          aiDiv.className = 'chat-msg ai-msg';
          aiDiv.textContent = aiText;
          chatHistory.appendChild(aiDiv);
          conversation.push(candidate.content);
          if (typeof playCaw === 'function') playCaw();
        } else {
          throw new Error("Invalid response");
        }
      } catch (error) {
        loadDiv.remove();
        const errDiv = document.createElement('div');
        errDiv.className = 'chat-msg ai-msg';
        errDiv.innerHTML = '<i>*Croak* The magic ink is dry right now. (API Error)</i>';
        chatHistory.appendChild(errDiv);
      }

      isWaiting = false;
      chatHistory.scrollTop = chatHistory.scrollHeight;
    };

    chatSubmit.addEventListener('click', handleChatSubmit);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleChatSubmit();
    });
  }

  // 4. Easter Egg: Type "rise" to pan up from the ground
  let keystrokeBuffer = '';
  const secretWord = 'rise';
  
  document.addEventListener('keydown', (e) => {
    // Ignore typing if the user is actively using the chatbox or other inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    // Track only alphabetical keys
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