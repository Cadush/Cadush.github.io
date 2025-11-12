/**
 * script.js
 * Portfolio Cyberpunk - Carlos Santos
 * Funcionalidades: Matrix Rain, Typing, Terminal, Glitch, Scroll Animations
 * Compatível com index.html + style.css
 */

(() => {
  'use strict';

  // === CONFIGURAÇÕES GLOBAIS ===
  const CONFIG = {
    matrixChars: '01',
    fontSize: 14,
    frameInterval: 35, // ms (aprox 28 FPS)
    typingSpeed: 70,
    cursorBlink: 530,
    scanThreshold: 0.1
  };

  // === ELEMENTOS DOM ===
  const canvas = document.getElementById('matrix');
  const ctx = canvas.getContext('2d');
  const inputEl = document.getElementById('input');
  const cursor = document.getElementById('cursor');
  const outputContainer = document.getElementById('terminal-output') || createOutputContainer();
  const langSwitch = document.getElementById('langSwitch');
  const translatable = document.querySelectorAll('[data-text], [data-en]');

  let drops = [];
  let columns = 0;
  let input = '';
  let currentLang = 'pt';
  let lastFrameTime = 0;

  // === UTILS ===
  function createOutputContainer() {
    const div = document.createElement('div');
    div.id = 'terminal-output';
    document.querySelector('.terminal-input').before(div);
    return div;
  }

  function appendOutput(html, isResponse = false) {
    const el = document.createElement('div');
    el.innerHTML = html;
    if (isResponse) el.style.color = '#0f0';
    outputContainer.appendChild(el);
    outputContainer.scrollTop = outputContainer.scrollHeight;
  }

  // === MATRIX RAIN ===
  function initMatrix() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / CONFIG.fontSize);
    drops = Array(columns).fill(1);
  }

  function drawMatrix(timestamp) {
    if (timestamp - lastFrameTime < CONFIG.frameInterval) {
      requestAnimationFrame(drawMatrix);
      return;
    }
    lastFrameTime = timestamp;

    ctx.fillStyle = 'rgba(13, 17, 23, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f0';
    ctx.font = `${CONFIG.fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = CONFIG.matrixChars[Math.floor(Math.random() * CONFIG.matrixChars.length)];
      const x = i * CONFIG.fontSize;
      const y = drops[i] * CONFIG.fontSize;
      ctx.fillText(char, x, y);

      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }

    requestAnimationFrame(drawMatrix);
  }

  // === TYPING EFFECT (para título e listas) ===
  async function typeText(element, text, delay = CONFIG.typingSpeed) {
    if (element.classList.contains('typing-active')) return;
    element.classList.add('typing-active');
    element.textContent = '';
    for (const char of text) {
      element.textContent += char;
      await new Promise(r => setTimeout(r, delay + Math.random() * 30));
    }
  }

  function initTypingList() {
    const items = document.querySelectorAll('.typing-list li');
    items.forEach((item, i) => {
      setTimeout(() => {
        item.classList.add('active');
      }, 1500 + i * 300);
    });
  }

  // === SCROLL REVEAL ===
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: CONFIG.scanThreshold });

    document.querySelectorAll('.scan-section').forEach(sec => observer.observe(sec));
  }

  // === COMANDOS DO TERMINAL ===
  const COMMANDS = {
    help: () => currentLang === 'pt'
      ? 'Comandos: about, skills, projects, certs, thm, clear, hack'
      : 'Commands: about, skills, projects, certs, thm, clear, hack',

    about: () => currentLang === 'pt'
      ? 'Analista de Cyber Security | Pentest | OSINT | Linux'
      : 'Cyber Security Analyst | Pentest | OSINT | Linux',

    skills: () => 'Linux, Bash, Nmap, Metasploit, Suricata, Docker, Wazuh, Python, pfSense',

    projects: () => 'SCAN_REDE, imapsync_Migracao, Backup (GitHub)',

    certs: () => {
      window.open('https://www.linkedin.com/in/cadush/details/certifications/', '_blank');
      return currentLang === 'pt' ? 'Abrindo LinkedIn...' : 'Opening LinkedIn...';
    },

    thm: () => {
      window.open('https://tryhackme.com/p/c.sh', '_blank');
      return 'TryHackMe profile aberto!';
    },

    hack: () => currentLang === 'pt'
      ? 'Acessando mainframe... [OK]'
      : 'Accessing mainframe... [OK]',

    clear: () => {
      outputContainer.innerHTML = '';
      return null;
    },

    default: (cmd) => `comando não encontrado: <code>${cmd}</code>`
  };

  function handleCommand(cmd) {
    appendOutput(`<span style="color:#0f0">root@cadush:~$</span> ${cmd}`);

    const normalized = cmd.trim().toLowerCase();
    const handler = COMMANDS[normalized] || COMMANDS.default;
    const response = handler(normalized);

    if (response !== null) {
      appendOutput(response, true);
    }
  }

  // === INPUT DO TERMINAL ===
  document.addEventListener('keydown', (e) => {
    // Easter Egg: Ctrl + H
    if (e.ctrlKey && e.key === 'h') {
      document.body.style.filter = 'invert(1) hue-rotate(180deg)';
      setTimeout(() => document.body.style.filter = '', 1000);
      return;
    }

    // Apenas se o input estiver focado
    if (document.activeElement !== inputEl.parentElement) return;

    if (e.key === 'Enter') {
      handleCommand(input);
      input = '';
      inputEl.textContent = '';
    } else if (e.key === 'Backspace') {
      input = input.slice(0, -1);
      inputEl.textContent = input;
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      input += e.key;
      inputEl.textContent = input;
    }
  });

  // === TROCA DE IDIOMA ===
  function switchLanguage() {
    currentLang = currentLang === 'pt' ? 'en' : 'pt';
    langSwitch.textContent = currentLang === 'pt' ? 'EN' : 'PT';

    translatable.forEach(el => {
      const pt = el.getAttribute('data-text');
      const en = el.getAttribute('data-en');
      if (en) {
        const html = currentLang === 'en' ? en : pt;
        el.innerHTML = html
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
      }
    });

    // Atualiza footer
    const footerText = document.getElementById('footer-text');
    if (footerText) {
      footerText.innerHTML = `
        Carlos Eduardo © 2025 | 
        <span>${currentLang === 'pt' ? 'Digite &lt;code&gt;help&lt;/code&gt; para comandos' : 'Type &lt;code&gt;help&lt;/code&gt; for commands'}</span> | 
        <code>thm</code> 
        <span>${currentLang === 'pt' ? 'para ver stats' : 'to view stats'}</span>
      `.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }
  }

  if (langSwitch) {
    langSwitch.addEventListener('click', switchLanguage);
  }

  // === RESIZE ===
  window.addEventListener('resize', () => {
    initMatrix();
  });

  // === KONAMI CODE (Easter Egg) ===
  let konami = '';
  const konamiCode = '38384040373937396665'; // ↑↑↓↓←→←→BA
  document.addEventListener('keydown', (e) => {
    konami += e.keyCode;
    if (konami.length > konamiCode.length) konami = konami.slice(-konamiCode.length);
    if (konami === konamiCode) {
      document.body.style.animation = 'rainbow 3s infinite';
      setTimeout(() => document.body.style.animation = '', 6000);
      appendOutput('KONAMI CODE ATIVADO!', true);
    }
  });

  // === INICIALIZAÇÃO ===
  window.addEventListener('load', () => {
    initMatrix();
    requestAnimationFrame(drawMatrix);
    initTypingList();
    initScrollReveal();

    // Título com typing
    const title = document.getElementById('typed-title');
    if (title) {
      setTimeout(() => typeText(title, title.getAttribute('data-text') || "Carlos Santos"), 800);
    }

    // Foco no terminal
    const terminalInput = document.querySelector('.terminal-input');
    if (terminalInput) {
      terminalInput.setAttribute('tabindex', '0');
      terminalInput.focus();
    }
  });

  // === CSS DINÂMICO PARA RAINBOW (se não estiver no style.css) ===
  if (!document.getElementById('rainbow-style')) {
    const style = document.createElement('style');
    style.id = 'rainbow-style';
    style.textContent = `
      @keyframes rainbow {
        0% { filter: hue-rotate(0deg) saturate(2); }
        100% { filter: hue-rotate(360deg) saturate(2); }
      }
    `;
    document.head.appendChild(style);
  }
})();
