/* NARA Product Experience — lightweight, dependency-free interactions. */
(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  if (!body || !body.classList.contains('product-experience-page')) return;

  // Scroll progress indicator.
  const progress = document.createElement('div');
  progress.className = 'px-scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';
  body.appendChild(progress);
  const progressBar = progress.firstElementChild;
  let scrollTicking = false;
  const updateProgress = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progressValue = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
    progressBar.style.transform = `scaleX(${progressValue})`;
    scrollTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollTicking) { window.requestAnimationFrame(updateProgress); scrollTicking = true; }
  }, { passive: true });
  updateProgress();

  // Progressive reveal; content remains visible if IntersectionObserver isn't supported.
  const revealTargets = [...document.querySelectorAll('[data-px-reveal], [data-px-card]')];
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('px-in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
    revealTargets.forEach(target => {
      target.classList.add('px-pending');
      revealObserver.observe(target);
    });
  } else {
    revealTargets.forEach(target => target.classList.add('px-in-view'));
  }

  // Hover and pointer tilt are subtle on large screens; no pointer-tracking on touch devices.
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reducedMotion) {
    document.querySelectorAll('[data-px-parallax], [data-px-card], .px-stage-product').forEach(el => {
      el.addEventListener('pointermove', event => {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        if (el.hasAttribute('data-px-parallax')) {
          el.style.setProperty('--px-pointer-x', `${(x - 0.5) * 13}px`);
          el.style.setProperty('--px-pointer-y', `${(y - 0.5) * 13}px`);
        } else if (el.hasAttribute('data-px-card')) {
          el.style.transform = `perspective(950px) rotateX(${(0.5 - y) * 3}deg) rotateY(${(x - 0.5) * 3}deg) translateY(-3px)`;
        } else {
          el.style.setProperty('--px-card-rx', `${(0.5 - y) * 3}deg`);
          el.style.setProperty('--px-card-ry', `${(x - 0.5) * 3}deg`);
        }
      });
      el.addEventListener('pointerleave', () => {
        el.style.removeProperty('--px-pointer-x');
        el.style.removeProperty('--px-pointer-y');
        if (el.hasAttribute('data-px-card')) el.style.transform = '';
        el.style.removeProperty('--px-card-rx');
        el.style.removeProperty('--px-card-ry');
      });
    });

    document.querySelectorAll('.product-detail-image').forEach(visual => {
      visual.addEventListener('pointermove', event => {
        const rect = visual.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        visual.style.setProperty('--px-image-x', `${x * 12}px`);
        visual.style.setProperty('--px-image-y', `${y * 12}px`);
      });
      visual.addEventListener('pointerleave', () => {
        visual.style.setProperty('--px-image-x', '0px');
        visual.style.setProperty('--px-image-y', '0px');
      });
    });
  }

  // Gentle hero drift while scrolling. Disabled on touch screens and when reduced motion is preferred.
  const catalogStage = document.querySelector('.px-catalog-stage');
  if (catalogStage && !reducedMotion) {
    let stageTicking = false;
    const updateStage = () => {
      const rect = catalogStage.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) / Math.max(window.innerHeight, 1);
      catalogStage.style.setProperty('--px-scroll-drift', `${Math.max(-14, Math.min(14, offset * -18))}px`);
      stageTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (!stageTicking) { window.requestAnimationFrame(updateStage); stageTicking = true; }
    }, { passive: true });
    updateStage();
  }

  // Add focus visibility and ensure all internal product anchor interactions stay native/accessibile.
  document.querySelectorAll('.px-product-card a, .px-button, .px-card-link').forEach(link => {
    link.addEventListener('focus', () => link.closest('.px-product-card')?.classList.add('px-keyboard-focus'));
    link.addEventListener('blur', () => link.closest('.px-product-card')?.classList.remove('px-keyboard-focus'));
  });
})();
