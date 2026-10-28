// ── Hero — aurora blob animation ─────────────────────────
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
    if (document.hidden) { last=now; requestAnimationFrame(draw); return; }
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
const NAV_H  = document.querySelector('.cabeca').offsetHeight;

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
Array.from(document.querySelector('.apresentacao').children).filter(() => !matchMedia('(prefers-reduced-motion: reduce)').matches).forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = `opacity .65s ease ${i * .1}s, transform .65s ease ${i * .1}s`;
  setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none'; }, 100 + i * 80);
});


// Accessible mobile navigation.
const menuButton=document.querySelector('.menu-toggle');
const navigation=document.querySelector('.naveg');
function closeMenu(){menuButton.setAttribute('aria-expanded','false');navigation.classList.remove('is-open');}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));navigation.classList.toggle('is-open',open);});
navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape' && menuButton.getAttribute('aria-expanded')==='true'){closeMenu();menuButton.focus();}});
window.addEventListener('resize',()=>{if(innerWidth>700)closeMenu();});
// Keep the existing delivery service; rely on native field validation.
const form=document.getElementById('contact-form');
form.addEventListener('submit',async event=>{event.preventDefault();const button=document.getElementById('btn-enviar');const status=document.getElementById('form-feedback');if(button.disabled)return;const data=Object.fromEntries(new FormData(form));button.disabled=true;button.textContent='Enviando…';status.textContent='';try{const response=await fetch('https://formspree.io/f/mvzwyppa',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)});if(!response.ok)throw Error('Falha no envio');form.reset();status.textContent='Mensagem enviada. Obrigado pelo contato!';status.dataset.state='success';}catch{status.textContent='Não foi possível enviar. Tente novamente ou use o e-mail ao lado.';status.dataset.state='error';}finally{button.disabled=false;button.textContent='Enviar mensagem →';}});
