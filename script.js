// ── Hero — aurora blob animation ─────────────────────────
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Each blob: position, radius, color, orbit speed & radius
  const blobs = [
    { x: 0.25, y: 0.35, r: 0.52, color: 'rgba(252,199,23,',   t: 0, speed: 0.00028, ox: 0.12, oy: 0.10, peak: 0.10 },
    { x: 0.75, y: 0.60, r: 0.48, color: 'rgba(30, 60,120,',   t: 2,  speed: 0.00022, ox: 0.14, oy: 0.12, peak: 0.09 },
    { x: 0.55, y: 0.20, r: 0.40, color: 'rgba(252,199,23,',   t: 4,  speed: 0.00034, ox: 0.10, oy: 0.16, peak: 0.07 },
    { x: 0.15, y: 0.75, r: 0.38, color: 'rgba(40, 80,160,',   t: 1,  speed: 0.00018, ox: 0.16, oy: 0.08, peak: 0.07 },
  ];

  let last = performance.now();

  function draw(now) {
    const dt = now - last;
    last = now;

    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    blobs.forEach(b => {
      b.t += dt * b.speed;
      const cx = (b.x + Math.sin(b.t)         * b.ox) * W;
      const cy = (b.y + Math.cos(b.t * 1.3)   * b.oy) * H;
      const r  = b.r * Math.min(W, H);

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0,   b.color + b.peak + ')');
      g.addColorStop(0.5, b.color + (b.peak * 0.3) + ')');
      g.addColorStop(1,   b.color + '0)');

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();

// ── Fade-in ao rolar ──────────────────────────────────────
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

// ── Nav ativo conforme seção visível ──────────────────────
const secoes = document.querySelectorAll('section[id]');
const links  = document.querySelectorAll('.naveg a');
const NAV_H  = document.getElementById('header').offsetHeight;

secoes.forEach(s => {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(a => a.classList.remove('ativo'));
        const link = document.querySelector(`.naveg a[href="#${e.target.id}"]`);
        if (link) link.classList.add('ativo');
      }
    });
  }, { rootMargin: `-${NAV_H}px 0px -55% 0px`, threshold: 0 }).observe(s);
});

// ── Animação de entrada do hero ───────────────────────────
Array.from(document.querySelector('.apresentacao').children).forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = `opacity .65s ease ${i * .1}s, transform .65s ease ${i * .1}s`;
  setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none'; }, 100 + i * 80);
});

// ── Formulário de contato ─────────────────────────────────
// ── Formulário de contato ─────────────────────────────────
document.getElementById('btn-enviar').addEventListener('click', async function () {
  const nome    = document.querySelector('input[placeholder="Seu nome"]');
  const email   = document.querySelector('input[placeholder="seu@email.com"]');
  const assunto = document.querySelector('input[placeholder="Oportunidade, parceria, projeto..."]');
  const mensagem = document.querySelector('.form-textarea');
  const btn = this;

  // Validação básica
  if (!nome.value || !email.value || !mensagem.value) {
    btn.textContent = 'Preencha os campos obrigatórios';
    btn.style.background = '#e74c3c';
    btn.style.color = '#fff';
    setTimeout(() => {
      btn.textContent = 'Enviar mensagem →';
      btn.style.background = '';
      btn.style.color = '';
    }, 3000);
    return;
  }

  btn.textContent = 'Enviando...';
  btn.disabled = true;

  try {
    const res = await fetch('https://formspree.io/f/mvzwyppa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nome.value,
        email: email.value,
        assunto: assunto.value,
        mensagem: mensagem.value,
      }),
    });

    if (res.ok) {
      btn.textContent = 'Mensagem enviada ✓';
      btn.style.background = '#28c840';
      btn.style.color = '#fff';

      // Limpa os campos
      nome.value = '';
      email.value = '';
      assunto.value = '';
      mensagem.value = '';

      setTimeout(() => {
        btn.textContent = 'Enviar mensagem →';
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 3500);
    } else {
      throw new Error('Erro no envio');
    }
  } catch {
    btn.textContent = 'Erro ao enviar. Tente novamente.';
    btn.style.background = '#e74c3c';
    btn.style.color = '#fff';
    setTimeout(() => {
      btn.textContent = 'Enviar mensagem →';
      btn.style.background = '';
      btn.style.color = '';
      btn.disabled = false;
    }, 3500);
  }
});
