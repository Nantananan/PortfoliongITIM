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

  // 3. Configurable Ink Crow chatbot
  const chatRoot = document.getElementById('ink-crow-chat');
  const chatSend = document.querySelector('[data-chat-send]');
  const chatInput = document.querySelector('[data-chat-input]');
  const chatHistory = document.querySelector('[data-chat-history]');

  const defaultChatConfig = {
    behavior: 'You are the Ink Crow. Be concise, warm, mysterious, and helpful. Stay focused on the portfolio owner and the knowledge below.',
    responses: 'Answer in one or two short sentences. If the answer is not in the knowledge base, say so honestly and invite the visitor to ask about skills, projects, or contact details.',
    knowledge: "Renan Clint is an Information Technology student in Pasay City.\nRenan is the Secretary of the Junior Philippine Computer Society and a Dean's Lister.\nRenan is building WellPath, an AI-powered wellness monitoring and chronic disease risk prediction capstone project.\nOther projects include an Interactive Lesson Reviewer and a Pixel-World Portfolio.\nVisitors can reach Renan through the social links on this page."
  };
  let chatConfig = defaultChatConfig;
  let conversation = [];
  let isWaiting = false;

  if (chatRoot && chatSend && chatInput && chatHistory) {
    try { chatConfig = { ...defaultChatConfig, ...JSON.parse(localStorage.getItem('ink-crow-chat-config') || '{}') }; } catch (_) {}

    const addMessage = (role, text) => {
      const message = document.createElement('div');
      message.className = `chat-msg ${role === 'assistant' ? 'ai-msg' : 'user-msg'}`;
      message.textContent = text;
      chatHistory.appendChild(message);
      chatHistory.scrollTop = chatHistory.scrollHeight;
    };
    addMessage('assistant', 'Caw. I am the Ink Crow. Ask me about Renan, his work, or the ideas in this portfolio.');

    const localReply = (question) => {
      const query = question.toLowerCase();
      const entries = chatConfig.knowledge.split(/\n+/).map(line => line.trim()).filter(Boolean);
      const words = query.match(/[a-z0-9']+/g) || [];
      const ranked = entries.map(entry => ({ entry, score: words.reduce((sum, word) => sum + (word.length > 2 && entry.toLowerCase().includes(word) ? 1 : 0), 0) })).sort((a, b) => b.score - a.score);
      if (ranked[0] && ranked[0].score > 0) return `${ranked[0].entry} Caw.`;
      if (/hello|hi|hey|caw/.test(query)) return 'Caw, visitor. The ink is listening. What would you like to know?';
      if (/skill|tech|study|school|about|who/.test(query)) return "Renan is an IT student, JPCS Secretary, and Dean's Lister. Ask me about a project for more detail.";
      if (/project|work|build|wellpath/.test(query)) return "WellPath is Renan's AI wellness monitoring and chronic disease risk prediction capstone project.";
      return 'The answer is not written in my current knowledge pages. Try asking about Renan, WellPath, projects, skills, or contact details.';
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        conversation.push({ role: 'user', parts: [{ text: question }] });
        const response = await fetch('/api/chat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ question, conversation: conversation.slice(-12), config: chatConfig })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || `Chat API returned HTTP ${response.status}`);
        const answer = result.answer;
        if (!answer) throw new Error('Empty Gemini response');
        conversation.push({ role: 'model', parts: [{ text: answer }] });
        thinking.remove();
        addMessage('assistant', answer);
        playCaw();
      } catch (error) {
        thinking.remove();
        const reason = error.name === 'AbortError' ? 'The chat request timed out.' : (error.message || 'The chat API is unavailable.');
        addMessage('assistant', `${localReply(question)} (Fallback: ${reason})`);
      } finally {
        clearTimeout(timeoutId);
        thinking.remove();
        isWaiting = false;
      }
    };
    chatSend.addEventListener('click', handleChatSubmit);
    chatInput.addEventListener('keydown', event => { if (event.key === 'Enter') handleChatSubmit(); });
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
