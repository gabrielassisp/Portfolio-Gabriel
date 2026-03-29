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
