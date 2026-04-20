/* ═══════════════════════════════════════════════════════════════
   Haven Home Wellness — Universal Page Script v3
   Drop this at the bottom of every page's <body> (before </body>)
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     1. NAV SCROLL STATE
     Adds .scrolled class to <nav> once user
     scrolls > 20px — triggers backdrop change
  ────────────────────────────────────────── */
  var nav = document.querySelector('nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run immediately in case page loads scrolled
  }

  /* ──────────────────────────────────────────
     2. MOBILE NAV (hamburger menu)
     Works with:
       #burgerBtn  — the toggle button
       #mobileNav  — the drawer
  ────────────────────────────────────────── */
  var burgerBtn = document.getElementById('burgerBtn');
  var mobileNav = document.getElementById('mobileNav');

  if (burgerBtn && mobileNav) {
    function openMenu() {
      burgerBtn.classList.add('open');
      mobileNav.classList.add('open');
      burgerBtn.setAttribute('aria-expanded', 'true');
      mobileNav.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      burgerBtn.classList.remove('open');
      mobileNav.classList.remove('open');
      burgerBtn.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Expose globally so modal buttons can call closeMenuGlobal()
    window.closeMenuGlobal = closeMenu;

    burgerBtn.addEventListener('click', function () {
      burgerBtn.classList.contains('open') ? closeMenu() : openMenu();
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860 && mobileNav.classList.contains('open')) closeMenu();
    });
  } else {
    window.closeMenuGlobal = function () {};
  }

  /* ──────────────────────────────────────────
     3. ACTIVE NAV LINK
     Highlights the <a> in .nav-links whose
     href matches the current page filename
  ────────────────────────────────────────── */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    var page = href.split('/').pop();
    if (page === currentPage || (currentPage === '' && page === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ──────────────────────────────────────────
     4. SCROLL REVEAL (.fade-up / .fade-in / .stagger)
     Adds .visible when element enters viewport
  ────────────────────────────────────────── */
  var revealSelectors = [
    '.fade-up', '.fade-in',
    '.eyebrow', '.section-title', '.section-desc',
    '.card', '.product-card', '.feature-card',
    '.hw-label', '.hw-img-container',
    '.quiz-progress', '#quizQuestion',
    '.hero-stat', '.tech-cta-link',
    '.tagline-banner', '.stat'
  ].join(',');

  var revealEls = document.querySelectorAll(revealSelectors);
  revealEls.forEach(function (el, i) {
    // Skip elements already inside the hero (they're instant)
    if (el.closest('.page-hero')) return;
    if (!el.classList.contains('fade-up') && !el.classList.contains('fade-in')) {
      el.classList.add('fade-up');
    }
    // Stagger sibling cards
    if (el.classList.contains('card') || el.classList.contains('hw-label')) {
      if (i % 3 === 1) el.classList.add('delay-1');
      else if (i % 3 === 2) el.classList.add('delay-2');
    }
  });

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-up, .fade-in').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback for old browsers
    document.querySelectorAll('.fade-up, .fade-in').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ──────────────────────────────────────────
     5. MODAL SYSTEM (WAITLIST + CONTACT)
     openModal(type) / closeModal(type)
     type: 'waitlist' | 'contact'
  ────────────────────────────────────────── */
  window.openModal = function (type) {
    var id = type === 'waitlist' ? 'modalWaitlist' : 'modalContact';
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add('visible');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function (type) {
    var id = type === 'waitlist' ? 'modalWaitlist' : 'modalContact';
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('visible');
    document.body.style.overflow = '';
  };

  // Close on overlay backdrop click
  ['modalWaitlist', 'modalContact'].forEach(function (id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        window.closeModal(id === 'modalWaitlist' ? 'waitlist' : 'contact');
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      window.closeModal('waitlist');
      window.closeModal('contact');
    }
  });

  /* ──────────────────────────────────────────
     6. MODAL SUBMIT HANDLER
     Composes a mailto: and shows success state
  ────────────────────────────────────────── */
  window.submitModal = function (type) {
    var TO = 'info@havenhomewellness.ai';
    var subject, body, valid;

    if (type === 'waitlist') {
      var first = (document.getElementById('wlFirst') || {}).value || '';
      var last  = (document.getElementById('wlLast')  || {}).value || '';
      var email = (document.getElementById('wlEmail') || {}).value || '';
      var role  = (document.getElementById('wlRole')  || {}).value || '';
      var note  = (document.getElementById('wlNote')  || {}).value || '';
      first = first.trim(); last = last.trim(); email = email.trim();
      valid = first && last && email;
      if (!valid) { alert('Please fill in your name and email.'); return; }
      subject = 'Waitlist: ' + first + ' ' + last;
      body = [
        'New waitlist signup from havenhomewellness.ai',
        '',
        'Name:  ' + first + ' ' + last,
        'Email: ' + email,
        'Role:  ' + (role || 'Not specified'),
        'Note:  ' + (note.trim() || '—')
      ].join('\n');
      var wlForm    = document.getElementById('wlForm');
      var wlSuccess = document.getElementById('wlSuccess');
      if (wlForm)    wlForm.style.display    = 'none';
      if (wlSuccess) wlSuccess.style.display = 'block';

    } else {
      var first   = (document.getElementById('ctFirst')   || {}).value || '';
      var last    = (document.getElementById('ctLast')    || {}).value || '';
      var email   = (document.getElementById('ctEmail')   || {}).value || '';
      var subj    = (document.getElementById('ctSubject') || {}).value || '';
      var msg     = (document.getElementById('ctMessage') || {}).value || '';
      first = first.trim(); last = last.trim(); email = email.trim(); msg = msg.trim();
      valid = first && last && email && msg;
      if (!valid) { alert('Please fill in your name, email, and message.'); return; }
      subject = 'Contact: ' + (subj || 'General Inquiry') + ' — ' + first + ' ' + last;
      body = [
        'New contact form submission from havenhomewellness.ai',
        '',
        'Name:    ' + first + ' ' + last,
        'Email:   ' + email,
        'Subject: ' + (subj || 'Not specified'),
        '',
        'Message:',
        msg
      ].join('\n');
      var ctForm    = document.getElementById('ctForm');
      var ctSuccess = document.getElementById('ctSuccess');
      if (ctForm)    ctForm.style.display    = 'none';
      if (ctSuccess) ctSuccess.style.display = 'block';
    }

    // Fire mailto
    window.location.href = 'mailto:' + TO
      + '?subject=' + encodeURIComponent(subject)
      + '&body='    + encodeURIComponent(body);

    // Auto-close + reset after 3.5s
    setTimeout(function () {
      window.closeModal(type);
      if (type === 'waitlist') {
        var wlForm    = document.getElementById('wlForm');
        var wlSuccess = document.getElementById('wlSuccess');
        if (wlForm)    wlForm.style.display    = 'block';
        if (wlSuccess) wlSuccess.style.display = 'none';
        ['wlFirst','wlLast','wlEmail','wlNote'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.value = '';
        });
        var wlRole = document.getElementById('wlRole');
        if (wlRole) wlRole.selectedIndex = 0;
      } else {
        var ctForm    = document.getElementById('ctForm');
        var ctSuccess = document.getElementById('ctSuccess');
        if (ctForm)    ctForm.style.display    = 'block';
        if (ctSuccess) ctSuccess.style.display = 'none';
        ['ctFirst','ctLast','ctEmail','ctMessage'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.value = '';
        });
        var ctSubject = document.getElementById('ctSubject');
        if (ctSubject) ctSubject.selectedIndex = 0;
      }
    }, 3500);
  };

  /* ──────────────────────────────────────────
     7. FALL COUNTER (homepage only)
     One fall every 8 seconds; starts when the
     counter section scrolls into view
  ────────────────────────────────────────── */
  var counter = document.getElementById('fallCounter');
  if (counter && 'IntersectionObserver' in window) {
    var count   = 0;
    var started = false;

    function tick() {
      count++;
      counter.textContent = count.toLocaleString();
      counter.style.animation = 'none';
      void counter.offsetHeight; // force reflow
      counter.style.animation = 'counterPop 0.25s ease';
    }

    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !started) {
          started = true;
          tick();
          setInterval(tick, 8000);
        }
      });
    }, { threshold: 0.3 });

    var section = counter.closest('section');
    if (section) counterObserver.observe(section);
  }

  /* ──────────────────────────────────────────
     8. QUESTIONNAIRE (homepage only)
     Self-contained quiz with score → result
  ────────────────────────────────────────── */
  var quizEl = document.getElementById('quiz');
  if (quizEl) {
    var questions = [
      {
        q: 'Has your parent had a fall — or a near-fall — in the past year?',
        opts: ['Yes, at least once', 'No, but I worry about it', "I'm not sure — I live far away"]
      },
      {
        q: 'Have you noticed changes in how they walk or move around?',
        opts: ['Yes — they seem slower or less steady', 'Occasionally, after a long day', "I haven't been able to observe them recently"]
      },
      {
        q: 'Does your parent live alone?',
        opts: ['Yes, completely on their own', 'With a spouse or partner', 'With a caregiver or family member']
      },
      {
        q: 'How would you describe their current fall prevention setup?',
        opts: ['They wear a medical alert pendant', 'Nothing — we just hope for the best', 'Basic modifications like grab bars']
      },
      {
        q: "How often do you check in on their safety?",
        opts: ["Multiple times a day — it's always on my mind", 'A few times a week', "Less than I'd like to"]
      }
    ];

    var results = [
      { min: 0,  max: 5,  icon: '🟢', title: 'Looking good — but don\'t get complacent.', text: 'Your parent seems relatively stable right now, but falls can happen without warning. Gait deterioration is invisible to the naked eye — by the time you notice something, the risk window may already be closing.' },
      { min: 6,  max: 10, icon: '🟡', title: 'There are warning signs. Don\'t ignore them.', text: 'The patterns you\'re describing — living alone, subtle changes in movement, distance — are exactly the conditions where a preventable fall turns into a life-changing event. Haven was built for families like yours.' },
      { min: 11, max: 15, icon: '🔴', title: 'Your parent is at elevated risk.', text: 'Everything you\'ve described points to a family that needs better visibility into what\'s happening at home. Haven\'s passive sensors and wearable gait intelligence can detect the subtle changes you can\'t see — weeks before they become emergencies.' }
    ];

    var scores = [[3,2,2],[3,2,2],[3,1,0],[1,3,1],[2,1,3]];
    var currentQ = 0;
    var totalScore = 0;
    var bars = quizEl.querySelectorAll('.qp-bar');

    function renderQuestion() {
      var q = questions[currentQ];
      var qText = document.getElementById('qText');
      var qOptions = document.getElementById('qOptions');
      if (!qText || !qOptions) return;
      qText.textContent = q.q;
      qOptions.innerHTML = '';
      q.opts.forEach(function (opt, i) {
        var btn = document.createElement('button');
        btn.className = 'quiz-opt';
        btn.textContent = opt;
        btn.addEventListener('click', function () {
          totalScore += scores[currentQ][i];
          currentQ++;
          if (currentQ < questions.length) {
            if (bars[currentQ]) bars[currentQ].style.background = 'var(--sage)';
            renderQuestion();
          } else {
            showResult();
          }
        });
        qOptions.appendChild(btn);
      });
    }

    function showResult() {
      var quizQuestion = document.getElementById('quizQuestion');
      var quizResult   = document.getElementById('quizResult');
      if (quizQuestion) quizQuestion.style.display = 'none';
      if (quizResult) quizResult.style.display = 'block';
      var result = results.find(function (r) { return totalScore >= r.min && totalScore <= r.max; }) || results[2];
      var ri = document.getElementById('resultIcon');
      var rt = document.getElementById('resultTitle');
      var rp = document.getElementById('resultText');
      if (ri) ri.textContent = result.icon;
      if (rt) rt.textContent = result.title;
      if (rp) rp.textContent = result.text;
    }

    renderQuestion();
  }

})(); // end IIFE
