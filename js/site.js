/* Al Mannai Gym — site.js
   Implements the behaviour of "Al Mannai Gym Website.dc.html":
   active nav, mobile menu, reveal-on-scroll, join-page plan summary,
   and form hand-off to WhatsApp (no backend required).
   The -ar pages reuse this file: AR below switches every user-facing
   string the script produces, keyed off <html lang="ar">. */
(function () {
  'use strict';

  var WA = 'https://wa.me/97333335681';
  var AR = (document.documentElement.lang || '').toLowerCase().indexOf('ar') === 0;

  /* ── Active nav ── */
  var page = document.body.getAttribute('data-page') || '';
  Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'), function (a) {
    if (a.getAttribute('data-nav') === page) a.classList.add('active');
  });

  /* ── Mobile menu ── */
  var header = document.querySelector('.site-header');
  var burger = document.querySelector('.nav-burger');
  if (header && burger) {
    burger.addEventListener('click', function () {
      var open = header.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900) header.classList.remove('menu-open');
    });
  }

  /* ── Reveal on scroll ──
     Opt-in: elements stay visible unless we can animate them. A hidden
     document gets no animation clock — leave everything visible there. */
  function show(el) {
    el.style.opacity = '';
    el.style.transform = '';
  }
  function showAll() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), show);
  }
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduced && document.visibilityState === 'visible') {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    var armed = [];
    els.forEach(function (el) {
      // Already in view at load: never hide it, just let it be.
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) {
        return c.hasAttribute('data-reveal');
      });
      el.style.transitionDelay = (Math.max(0, sibs.indexOf(el)) * 90) + 'ms';
      el.style.opacity = '0';
      el.style.transform = 'translateY(22px)';
      armed.push(el);
    });
    if (armed.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          show(e.target);
          io.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      armed.forEach(function (el) { io.observe(el); });
      // Safety net: nothing stays hidden.
      setTimeout(showAll, 2600);
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState !== 'visible') showAll();
      });
    }
  }

  /* ── WhatsApp hand-off helper ── */
  function toWhatsApp(lines) {
    var text = lines.filter(function (l) { return l; }).join('\n');
    window.open(WA + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }
  function val(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el && el.value ? el.value.trim() : '';
  }

  /* ── Join page: plan summary from ?plan= ── */
  var PLANS = {
    '1m':   { name: '1 month',           ar: 'شهر واحد',
              price: '38.5',
              note: 'Rolling membership. Cancel any time.',
              arNote: 'اشتراك لمدة شهر واحد، يجدد بناء على طلبك.' },
    '3m':   { name: '3 months',          ar: '3 أشهر',
              price: '99',
              note: 'Renew on time and your next 3 months are 77 BHD.',
              arNote: 'سعر التجديد في الموعد: 77 د.ب.' },
    '6m':   { name: '6 months',          ar: '6 أشهر',
              price: '154',
              note: 'Renew on time and your next 6 months are 132 BHD.',
              arNote: 'سعر التجديد في الموعد: 132 د.ب.' },
    '1y':   { name: '1 year',            ar: 'سنة كاملة',
              price: '220',
              note: 'Renew on time and your next year is 192.5 BHD.',
              arNote: 'سعر التجديد في الموعد: 192.5 د.ب.' },
    'easy': { name: 'Easy Pay · 1 year', ar: 'الدفع الميسر',
              price: '264',
              note: 'Four monthly instalments of 66 BHD, 264 BHD in total.',
              arNote: 'أربعة أقساط شهرية بقيمة 66 د.ب لكل قسط، بإجمالي 264 د.ب.' },
    'plat': { name: 'Platinum · 1 year', ar: 'بلاتينيوم',
              price: '330',
              note: 'A free guest on every visit, plus two 1-month memberships to gift.',
              arNote: 'ضيف مجاني في كل زيارة طوال العام، واشتراكان شهريان كهدية للأعضاء الجدد.' },
    'grp':  { name: 'Group · 1 year',    ar: 'المجموعات',
              price: '176',
              note: 'Per person, for ten people or more on annual memberships.',
              arNote: 'للفرد الواحد، لعشرة أشخاص فأكثر في اشتراكات سنوية.' }
  };
  var planNameEl = document.getElementById('plan-name');
  if (planNameEl) {
    var planSelect = document.getElementById('plan-select');
    var key = new URLSearchParams(window.location.search).get('plan');
    // ?plan= only PRESELECTS now; the member can change it on the page.
    var current = PLANS[key] ? key : '1y';

    function renderPlan() {
      var plan = PLANS[current];
      planNameEl.textContent = AR ? plan.ar : plan.name;
      document.getElementById('plan-price').textContent = plan.price;
      document.getElementById('plan-note').textContent = AR ? plan.arNote : plan.note;
      if (planSelect && planSelect.value !== current) planSelect.value = current;
    }
    renderPlan();

    if (planSelect) {
      planSelect.addEventListener('change', function () {
        if (PLANS[planSelect.value]) { current = planSelect.value; renderPlan(); }
      });
    }

    var joinForm = document.getElementById('join-form');
    document.getElementById('reserve-btn').addEventListener('click', function () {
      // Reservation goes to reception on WhatsApp. Card details are never sent.
      // Read the plan at CLICK time — it used to be captured once at page
      // load, so a changed selection would have sent the wrong plan.
      var plan = PLANS[current];
      if (AR) {
        toWhatsApp([
          'السلام عليكم، أرغب في الاشتراك بباقة ' + plan.ar + ' (' + plan.price + ' د.ب).',
          val(joinForm, 'name')  && 'الاسم: '            + val(joinForm, 'name'),
          val(joinForm, 'phone') && 'رقم الجوال: '       + val(joinForm, 'phone'),
          val(joinForm, 'email') && 'البريد الإلكتروني: ' + val(joinForm, 'email'),
          val(joinForm, 'start') && 'تاريخ بدء الاشتراك: ' + val(joinForm, 'start')
        ]);
      } else {
        toWhatsApp([
          'Hello, I’d like to reserve the ' + plan.name + ' membership (' + plan.price + ' BHD).',
          val(joinForm, 'name')  && 'Name: '   + val(joinForm, 'name'),
          val(joinForm, 'phone') && 'Mobile: ' + val(joinForm, 'phone'),
          val(joinForm, 'email') && 'Email: '  + val(joinForm, 'email'),
          val(joinForm, 'start') && 'Start date: ' + val(joinForm, 'start')
        ]);
      }
    });
  }

  /* ── Free-trial form ── */
  var trialForm = document.getElementById('trial-form');
  if (trialForm) {
    trialForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (AR) {
        toWhatsApp([
          'السلام عليكم، أرغب في حجز جلسة تجربة مجانية.',
          val(trialForm, 'name')  && 'الاسم: '           + val(trialForm, 'name'),
          val(trialForm, 'phone') && 'رقم الجوال: '      + val(trialForm, 'phone'),
          val(trialForm, 'day')   && 'اليوم: '           + val(trialForm, 'day'),
          val(trialForm, 'time')  && 'الوقت التقريبي: '  + val(trialForm, 'time'),
          val(trialForm, 'notes') && 'ملاحظات إضافية: '  + val(trialForm, 'notes')
        ]);
      } else {
        toWhatsApp([
          'Hello, I’d like to book a free trial session.',
          val(trialForm, 'name')  && 'Name: '   + val(trialForm, 'name'),
          val(trialForm, 'phone') && 'Mobile: ' + val(trialForm, 'phone'),
          val(trialForm, 'day')   && 'Day: '    + val(trialForm, 'day'),
          val(trialForm, 'time')  && 'Time: '   + val(trialForm, 'time'),
          val(trialForm, 'notes') && 'Notes: '  + val(trialForm, 'notes')
        ]);
      }
    });
  }

  /* ── Corporate enquiry form ── */
  var corpForm = document.getElementById('corporate-form');
  if (corpForm) {
    corpForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (AR) {
        toWhatsApp([
          'السلام عليكم، أرغب في الاستفسار عن اشتراك الشركات والمجموعات.',
          val(corpForm, 'company') && 'اسم الشركة أو المجموعة: ' + val(corpForm, 'company'),
          val(corpForm, 'contact') && 'اسم المسؤول: '            + val(corpForm, 'contact'),
          val(corpForm, 'phone')   && 'رقم الجوال: '             + val(corpForm, 'phone'),
          val(corpForm, 'size')    && 'عدد الأشخاص: '            + val(corpForm, 'size'),
          val(corpForm, 'email')   && 'بريد العمل: '             + val(corpForm, 'email'),
          val(corpForm, 'notes')   && 'تفاصيل إضافية: '          + val(corpForm, 'notes')
        ]);
      } else {
        toWhatsApp([
          'Hello, I’d like to enquire about a corporate / group membership.',
          val(corpForm, 'company') && 'Company or group: ' + val(corpForm, 'company'),
          val(corpForm, 'contact') && 'Contact: ' + val(corpForm, 'contact'),
          val(corpForm, 'phone')   && 'Mobile: '  + val(corpForm, 'phone'),
          val(corpForm, 'size')    && 'Group size: ' + val(corpForm, 'size'),
          val(corpForm, 'email')   && 'Work email: ' + val(corpForm, 'email'),
          val(corpForm, 'notes')   && 'Notes: '   + val(corpForm, 'notes')
        ]);
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     Interactive layer
     ═══════════════════════════════════════════════════════════ */

  /* ── Scroll progress bar ── */
  var progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  var ticking = false;
  function paintProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    progress.style.width = (max > 0 ? (doc.scrollTop / max) * 100 : 0) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(paintProgress); }
  }, { passive: true });
  paintProgress();

  /* ── WhatsApp floating button (all pages) ── */
  var fab = document.createElement('a');
  fab.className = 'wa-fab';
  fab.href = WA;
  fab.target = '_blank';
  fab.rel = 'noopener';
  fab.setAttribute('aria-label', AR ? 'واتساب نادي المناعي الرياضي' : 'WhatsApp Al Mannai Gym');
  fab.innerHTML = '<svg viewBox="0 0 448 512" aria-hidden="true"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>';
  document.body.appendChild(fab);

  /* ── Live Bahrain clock chips ── */
  function bahrainTime() {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Bahrain', hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date());
  }
  function bahrainHour() {
    return parseInt(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Bahrain', hour: '2-digit', hour12: false
    }).format(new Date()), 10);
  }
  var clocks = document.querySelectorAll('[data-clock]');
  if (clocks.length) {
    var tickClock = function () {
      var t = bahrainTime();
      Array.prototype.forEach.call(clocks, function (el) { el.textContent = t; });
    };
    tickClock();
    setInterval(tickClock, 20000);
  }

  /* ── Count-up numbers ── */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var dur = 1100;
    var t0 = null;
    var done = false;
    function frame(t) {
      if (done) return;
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(frame);
      else done = true;
    }
    requestAnimationFrame(frame);
    // rAF never fires in a hidden document — guarantee the final value regardless
    setTimeout(function () { done = true; el.textContent = target.toFixed(decimals); }, dur + 150);
  }
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduced) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        animateCount(e.target);
        cio.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(counters, function (el) { cio.observe(el); });
  }

  /* ── Cursor glare position on cards ── */
  if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-card]'), function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ── "Pick an hour" widget (home) ── */
  var hourSlider = document.getElementById('hour-slider');
  if (hourSlider) {
    var HOURS = AR ? [
      { from: 0,  to: 4,  label: 'بعد منتصف الليل',
        copy: 'النادي مفتوح بالكامل في هذه الساعات، مع أجواء هادئة تتيح لك التدريب براحة واستخدام الأجهزة من دون انتظار.' },
      { from: 5,  to: 7,  label: 'الصباح الباكر',
        copy: 'بداية مبكرة قبل مواعيد العمل، مع أجواء هادئة وجميع المرافق متاحة، بما في ذلك جناح الاستشفاء.' },
      { from: 8,  to: 11, label: 'الصباح',
        copy: 'وقت مناسب لرواد الصباح، والطلاب، وأصحاب الورديات الليلية. كما يتواجد المدربون خلال ساعات الإشراف المحددة لمساعدتك عند الحاجة.' },
      { from: 12, to: 15, label: 'منتصف اليوم',
        copy: 'فترة أهدأ تناسب التدريب خلال استراحة العمل، مع توفر الأجهزة وجناح الاستشفاء من دون ازدحام.' },
      { from: 16, to: 19, label: 'وقت الذروة',
        copy: 'أكثر أوقات اليوم حيوية، مع حضور واسع للأعضاء وتواجد المدربين في الصالة.' },
      { from: 20, to: 23, label: 'المساء المتأخر',
        copy: 'تدريب في وقت متأخر، مع إمكانية استخدام الساونا وغرفة البخار والجاكوزي قبل مغادرة النادي.' }
    ] : [
      { from: 0,  to: 4,  label: 'The night shift',  copy: 'Quiet floor, every rack free, the whole cardio centre to yourself. Night-shift workers and night owls train here — and reception is still staffed.' },
      { from: 5,  to: 7,  label: 'First light',      copy: 'In before sunrise, out before work. The sauna is already hot and the floor is calm.' },
      { from: 8,  to: 11, label: 'Morning',          copy: 'Students, shift workers coming off nights, and the early crowd. Trainers are on the floor if you want a form check.' },
      { from: 12, to: 15, label: 'Midday',           copy: 'A quieter window — lunch-break sessions, no queue for the racks, recovery suite to yourself.' },
      { from: 16, to: 19, label: 'Prime time',       copy: 'The busiest hours — full energy, trainers on the floor, every machine humming. Come for the atmosphere.' },
      { from: 20, to: 23, label: 'The late session', copy: 'Train late, then sauna, steam and jacuzzi before home. There is no closing bell here.' }
    ];
    var hourTime  = document.getElementById('hour-time');
    var hourLabel = document.getElementById('hour-label');
    var hourCopy  = document.getElementById('hour-copy');
    var trainerChip = document.getElementById('hour-trainer');

    /* Published trainer supervision hours, by Bahrain weekday. The gym itself
       is open 24/7 — these are supervision windows only, so the "trainer on the
       floor" chip must not claim cover outside them. Ranges are [from, to).
       Ahmed, 17 Aug 2026: trainers are on the floor at ANY hour Saturday
       through Thursday; only Friday has set windows. This also reconciles the
       EN/AR split noted below — both decks now describe the same cover. */
    var SUPERVISION = {
      0: [[0, 24]], 1: [[0, 24]], 2: [[0, 24]],
      3: [[0, 24]], 4: [[0, 24]],
      5: [[7, 11], [16, 22]],            // Friday
      6: [[0, 24]]                       // Saturday
    };
    var WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    function bahrainWeekday() {
      var name = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Bahrain', weekday: 'short'
      }).format(new Date());
      var i = WEEKDAY_INDEX[name];
      return typeof i === 'number' ? i : 0;
    }
    function trainerOnFloor(h) {
      var windows = SUPERVISION[bahrainWeekday()] || [];
      for (var i = 0; i < windows.length; i++) {
        if (h >= windows[i][0] && h < windows[i][1]) return true;
      }
      return false;
    }

    function setHour(h) {
      h = Math.max(0, Math.min(23, h | 0));
      var slot = HOURS.filter(function (s) { return h >= s.from && h <= s.to; })[0] || HOURS[0];
      hourTime.textContent = (h < 10 ? '0' + h : h) + ':00';
      hourLabel.textContent = slot.label;
      hourCopy.textContent = slot.copy;
      // Arabic copy deck (Aug 2026) requires the trainer chip to show only
      // during the published supervision hours, while the gym stays open 24h.
      // English still claims trainers around the clock (4 Aug 2026 ruling), so
      // it keeps the always-on chip until the two positions are reconciled.
      if (trainerChip) {
        trainerChip.style.display = (!AR || trainerOnFloor(h)) ? '' : 'none';
      }
      hourSlider.value = h;
      hourSlider.style.setProperty('--fill', (h / 23) * 100 + '%');
    }
    hourSlider.addEventListener('input', function () { setHour(parseInt(hourSlider.value, 10)); });
    var nowBtn = document.getElementById('hour-now');
    if (nowBtn) nowBtn.addEventListener('click', function () { setHour(bahrainHour()); });
    setHour(bahrainHour());
  }

  /* ── Per-day price widget (memberships) ── */
  var pdNum = document.getElementById('pd-num');
  if (pdNum) {
    var PD = {
      '1m': { days: 30,  std: 38.5, loyal: null },
      '3m': { days: 91,  std: 99,   loyal: 77 },
      '6m': { days: 182, std: 154,  loyal: 132 },
      '1y': { days: 365, std: 220,  loyal: 192.5 }
    };
    var pdState = { plan: '1y', rate: 'std' };
    var pdNote = document.getElementById('pd-note');
    var pdShown = 0;
    function pdRender(animate) {
      var p = PD[pdState.plan];
      var price = (pdState.rate === 'loyal' && p.loyal !== null) ? p.loyal : p.std;
      var perDay = price / p.days;
      Array.prototype.forEach.call(document.querySelectorAll('[data-pd-plan]'), function (b) {
        b.classList.toggle('active', b.getAttribute('data-pd-plan') === pdState.plan);
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-pd-rate]'), function (b) {
        b.classList.toggle('active', b.getAttribute('data-pd-rate') === pdState.rate);
      });
      if (pdNote) {
        if (pdState.rate === 'loyal' && p.loyal === null) {
          pdNote.textContent = AR
            ? 'سعر التجديد المخفض متاح للباقات من ثلاثة أشهر فأكثر — المعروض هو السعر القياسي.'
            : 'The loyalty rate starts from 3-month plans — showing the standard rate.';
        } else if (pdState.rate === 'loyal') {
          pdNote.textContent = AR
            ? 'سعر التجديد المخفض: ' + price + ' د.ب عند التجديد في الموعد.'
            : 'Loyalty rate: ' + price + ' BHD when you renew on time.';
        } else {
          pdNote.textContent = AR
            ? 'السعر القياسي: ' + price + ' د.ب للباقة كاملة.'
            : 'Standard rate: ' + price + ' BHD for the full plan.';
        }
      }
      if (!animate || reduced) { pdNum.textContent = perDay.toFixed(2); pdShown = perDay; return; }
      var from = pdShown, t0 = null, dur = 500, done = false;
      function frame(t) {
        if (done) return;
        if (t0 === null) t0 = t;
        var pr = Math.min(1, (t - t0) / dur);
        var eased = 1 - Math.pow(1 - pr, 3);
        pdNum.textContent = (from + (perDay - from) * eased).toFixed(2);
        if (pr < 1) requestAnimationFrame(frame);
        else { done = true; pdShown = perDay; }
      }
      requestAnimationFrame(frame);
      // rAF never fires in a hidden document — guarantee the final value regardless
      clearTimeout(pdRender._t);
      pdRender._t = setTimeout(function () { done = true; pdNum.textContent = perDay.toFixed(2); pdShown = perDay; }, dur + 120);
    }
    Array.prototype.forEach.call(document.querySelectorAll('[data-pd-plan]'), function (b) {
      b.addEventListener('click', function () { pdState.plan = b.getAttribute('data-pd-plan'); pdRender(true); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-pd-rate]'), function (b) {
      b.addEventListener('click', function () { pdState.rate = b.getAttribute('data-pd-rate'); pdRender(true); });
    });
    pdRender(false);
  }
})();
