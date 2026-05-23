/* ══════════════════════════════════════════════════════════
   ANGKATAN 25 — EKONOMI PEMBANGUNAN FEB UNISBA
   script.js — Enhanced v2 (Particles, Multi-Album, Lightbox)
   ══════════════════════════════════════════════════════════ */

"use strict";

/* ═══════════════════════════════════════════════════════════
   PARTICLE SYSTEM — Elegant floating gold dots
   ═══════════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let W, H, particles = [], animFrame;
  const COUNT = 55;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function createParticle() {
    return {
      x:     rand(0, W),
      y:     rand(0, H),
      r:     rand(0.8, 2.2),
      alpha: rand(0.05, 0.35),
      vx:    rand(-0.18, 0.18),
      vy:    rand(-0.22, -0.08),
      life:  rand(0, Math.PI * 2),
      speed: rand(0.004, 0.012),
      glow:  Math.random() > 0.7    // some particles get a glow
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.life += p.speed;
      p.x += p.vx;
      p.y += p.vy;

      // Pulse opacity
      const pulse = 0.5 + 0.5 * Math.sin(p.life);
      const a = p.alpha * pulse;

      // Wrap around edges
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) { p.y = H + 10; p.x = rand(0, W); }

      ctx.save();

      if (p.glow) {
        // Gold glowing dot
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grad.addColorStop(0, `rgba(201,168,76,${a})`);
        grad.addColorStop(0.4, `rgba(201,168,76,${a * 0.4})`);
        grad.addColorStop(1, `rgba(201,168,76,0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core dot
      ctx.globalAlpha = a;
      ctx.fillStyle = `rgba(201,168,76,1)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // Draw subtle connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.save();
          ctx.globalAlpha = 0.04 * (1 - dist / 120);
          ctx.strokeStyle = "rgba(201,168,76,1)";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    animFrame = requestAnimationFrame(draw);
  }

  init();
  draw();

  const ro = new ResizeObserver(() => { resize(); });
  ro.observe(document.body);
})();


/* ═══════════════════════════════════════════════════════════
   INTRO ANIMATION → LOADER → MAIN CONTENT
   ═══════════════════════════════════════════════════════════ */
(function initIntroSequence() {
  const intro   = document.getElementById("introOverlay");
  const loader  = document.getElementById("loader");
  const bar     = document.getElementById("loaderBar");
  const percent = document.getElementById("loaderPercent");

  if (!intro || !loader) return;

  document.body.style.overflow = "hidden";

  const INTRO_DURATION = 1800;

  const introTimer = setTimeout(() => {
    intro.classList.add("hidden");
    loader.classList.add("active");
    runLoader();
  }, INTRO_DURATION);

  const introFallback = setTimeout(() => {
    clearTimeout(introTimer);
    intro.classList.add("hidden");
    loader.classList.add("active");
    runLoader();
  }, 3500);

  function runLoader() {
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        if (bar)     bar.style.width    = "100%";
        if (percent) percent.textContent = "100%";

        setTimeout(() => {
          loader.classList.remove("active");
          loader.classList.add("hidden");
          document.body.style.overflow = "";
          clearTimeout(introFallback);
          tryAutoplay();
        }, 420);

      } else {
        if (bar)     bar.style.width    = progress + "%";
        if (percent) percent.textContent = Math.round(progress) + "%";
      }
    }, 90);

    // Hard fallback
    setTimeout(() => {
      clearInterval(interval);
      loader.classList.remove("active");
      loader.classList.add("hidden");
      document.body.style.overflow = "";
    }, 5000);
  }

  function tryAutoplay() {
    const audio = document.getElementById("bgMusic");
    if (!audio) return;
    audio.volume = 0.5;
    audio.play().then(() => {
      const wave = document.getElementById("musicWave");
      const iconPlay = document.getElementById("iconPlay");
      const iconMute = document.getElementById("iconMute");
      if (wave) wave.classList.add("playing");
      if (iconPlay) iconPlay.style.display = "none";
      if (iconMute) iconMute.style.display = "block";
    }).catch(() => {
      // Autoplay blocked — user interaction required
    });
  }
})();


/* ═══════════════════════════════════════════════════════════
   NAVBAR — Scroll + Active Link + Mobile Menu
   ═══════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar    = document.getElementById("navbar");
  const navMenu   = document.getElementById("navMenu");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileLinks = document.querySelectorAll(".mobile-link");
  const navLinks  = document.querySelectorAll(".nav-links a");

  if (!navbar) return;

  // Scroll — add .scrolled class
  let lastScroll = 0;
  window.addEventListener("scroll", () => {
    const sy = window.scrollY;
    if (sy > 60) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
    lastScroll = sy;
  }, { passive: true });

  // Mobile toggle
  if (navMenu && mobileMenu) {
    navMenu.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("open");
      navMenu.classList.toggle("open", open);
      navMenu.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });

    mobileLinks.forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        navMenu.classList.remove("open");
        navMenu.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  // Active link on scroll
  const sections = document.querySelectorAll("section[id]");

  function updateActive() {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const h   = section.offsetHeight;
      const id  = section.getAttribute("id");
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (!link) return;

      if (scrollY >= top && scrollY < top + h) {
        navLinks.forEach(l => l.classList.remove("active-nav"));
        link.classList.add("active-nav");
      }
    });
  }

  window.addEventListener("scroll", updateActive, { passive: true });
  updateActive();
})();


/* ═══════════════════════════════════════════════════════════
   GLOBAL MUSIC PLAYER
   ═══════════════════════════════════════════════════════════ */
(function initGlobalMusic() {
  const btn      = document.getElementById("musicBtn");
  const audio    = document.getElementById("bgMusic");
  const iconPlay = document.getElementById("iconPlay");
  const iconMute = document.getElementById("iconMute");
  const wave     = document.getElementById("musicWave");

  if (!btn || !audio) return;

  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      if (wave) wave.classList.add("playing");
      if (iconPlay) iconPlay.style.display = "none";
      if (iconMute) iconMute.style.display = "block";
    } else {
      audio.pause();
      if (wave) wave.classList.remove("playing");
      if (iconPlay) iconPlay.style.display = "block";
      if (iconMute) iconMute.style.display = "none";
    }
  });
})();


/* ═══════════════════════════════════════════════════════════
   SCROLL ANIMATIONS — fade-in on scroll
   ═══════════════════════════════════════════════════════════ */
(function initScrollAnimations() {
  const els = document.querySelectorAll(".fade-in");
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });

  els.forEach(el => obs.observe(el));
})();


/* ═══════════════════════════════════════════════════════════
   STAT COUNTER ANIMATION
   ═══════════════════════════════════════════════════════════ */
(function initCounters() {
  const nums = document.querySelectorAll(".stat-num[data-target]");
  if (!nums.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.target;
      const duration = 1800;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(ease * target);
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  nums.forEach(el => obs.observe(el));
})();


/* ═══════════════════════════════════════════════════════════
   MEMBER FILTER
   ═══════════════════════════════════════════════════════════ */
(function initMemberFilter() {
  const btns  = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".member-card");

  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        if (filter === "all" || card.dataset.role === filter) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });
})();


/* ═══════════════════════════════════════════════════════════
   MULTI-ALBUM GALLERY SYSTEM
   ─────────────────────────────────────────────────────────
   Album data config. For each album:
   - title, badge, desc
   - music: path to audio file in assets/music/
   - photos: array of { src, caption, type: 'portrait'|'landscape'|'square' }

   HOW TO ADD PHOTOS:
   Tambahkan path gambar di array photos masing-masing album.
   Format: { src: "assets/images/namafile.jpg", caption: "Keterangan", type: "portrait" }
   type bisa: "portrait", "landscape", atau "square"

   SETIAP ALBUM BERISI 50 FOTO — Silakan ganti path src dengan file foto asli.
   Foto placeholder dibawah menggunakan file yang sudah ada.
   ═══════════════════════════════════════════════════════════ */

const ALBUM_DATA = [
  /* ─── Album 0: Kebersamaan Angkatan ─── */
  {
    badge:  "Album I",
    title:  "Kebersamaan Angkatan",
    count:  "50 Foto",
    music:  "assets/music/Semangat Ekonomi Pembangunan 25.mp3",   // GANTI: musik album 1
    photos: (function() {
      // 50 foto — sesuaikan src dengan file foto asli kamu
      // type: "portrait" | "landscape" | "square"
      const raw = [
        { src: "assets/images/ak4.jpeg",  caption: "Kebersamaan Angkatan",   type: "landscape" },
        { src: "assets/images/ak1.jpeg",  caption: "Foto PDH FEB",           type: "portrait"  },
        { src: "assets/images/ak2.jpeg",  caption: "Himpunan EP",            type: "portrait"  },
        { src: "assets/images/ak3.jpeg",  caption: "Angkatan 25 UNISBA",     type: "landscape" },
        { src: "assets/images/ak5.jpeg",  caption: "Angkatan Bersama",       type: "square"    },
        { src: "assets/images/ak6.jpeg",  caption: "Kebersamaan EP",         type: "portrait"  },
        { src: "assets/images/ak7.jpeg",  caption: "Barak FEB",              type: "portrait"  },
        { src: "assets/images/ak8.jpeg",  caption: "Momen Bersama",          type: "landscape" },
        { src: "assets/images/ak11.jpeg", caption: "Angkatan 25",            type: "landscape" },
        { src: "assets/images/ak12.jpeg", caption: "Diskusi Akademik",       type: "landscape" },
        { src: "assets/images/ak13.jpeg", caption: "Makrab EP",              type: "portrait"  },
        { src: "assets/images/ak3.jpeg",  caption: "Perjalanan Bersama",     type: "square"    },
        { src: "assets/images/ak4.jpeg",  caption: "Solid EP '25",           type: "landscape" },
        { src: "assets/images/ak5.jpeg",  caption: "Satu Tujuan",            type: "portrait"  },
        { src: "assets/images/ak1.jpeg",  caption: "FEB UNISBA",             type: "landscape" },
        { src: "assets/images/ak2.jpeg",  caption: "EP Bersatu",             type: "portrait"  },
        { src: "assets/images/ak6.jpeg",  caption: "Generasi Muda EP",       type: "square"    },
        { src: "assets/images/ak7.jpeg",  caption: "Kompak Selalu",          type: "portrait"  },
        { src: "assets/images/ak8.jpeg",  caption: "Angkatan Emas",          type: "landscape" },
        { src: "assets/images/ak11.jpeg", caption: "Momen Indah",            type: "portrait"  },
        { src: "assets/images/ak12.jpeg", caption: "Kegiatan EP",            type: "landscape" },
        { src: "assets/images/ak13.jpeg", caption: "Together EP",            type: "square"    },
        { src: "assets/images/ak3.jpeg",  caption: "EP '25 Solid",           type: "portrait"  },
        { src: "assets/images/ak4.jpeg",  caption: "Kenangan Indah",         type: "landscape" },
        { src: "assets/images/ak5.jpeg",  caption: "Sahabat Angkatan",       type: "portrait"  },
        { src: "assets/images/ak1.jpeg",  caption: "Satu Visi",              type: "square"    },
        { src: "assets/images/ak6.jpeg",  caption: "Kebersamaan",            type: "landscape" },
        { src: "assets/images/ak7.jpeg",  caption: "Pertemanan EP",          type: "portrait"  },
        { src: "assets/images/ak8.jpeg",  caption: "Angkatan 25 FEB",        type: "landscape" },
        { src: "assets/images/ak2.jpeg",  caption: "Momen Keluarga",         type: "portrait"  },
        { src: "assets/images/ak11.jpeg", caption: "Bersama Selamanya",      type: "square"    },
        { src: "assets/images/ak12.jpeg", caption: "EP Bangga",              type: "landscape" },
        { src: "assets/images/ak13.jpeg", caption: "Kegiatan Angkatan",      type: "portrait"  },
        { src: "assets/images/ak3.jpeg",  caption: "Foto Bersama",           type: "landscape" },
        { src: "assets/images/ak4.jpeg",  caption: "Senyum EP",              type: "square"    },
        { src: "assets/images/ak5.jpeg",  caption: "EP UNISBA",              type: "portrait"  },
        { src: "assets/images/ak6.jpeg",  caption: "Angkatan Terbaik",       type: "landscape" },
        { src: "assets/images/ak1.jpeg",  caption: "Mahasiswa FEB",          type: "portrait"  },
        { src: "assets/images/ak7.jpeg",  caption: "EP '25 Forever",         type: "square"    },
        { src: "assets/images/ak8.jpeg",  caption: "Solid & Kompak",         type: "landscape" },
        { src: "assets/images/ak2.jpeg",  caption: "Angkatan Berharga",      type: "portrait"  },
        { src: "assets/images/ak11.jpeg", caption: "Dua Lima",               type: "portrait"  },
        { src: "assets/images/ak12.jpeg", caption: "EP Berjaya",             type: "landscape" },
        { src: "assets/images/ak13.jpeg", caption: "Bahagia Bersama",        type: "square"    },
        { src: "assets/images/ak3.jpeg",  caption: "Satu Keluarga",          type: "portrait"  },
        { src: "assets/images/ak4.jpeg",  caption: "EP Berkarya",            type: "landscape" },
        { src: "assets/images/ak5.jpeg",  caption: "Generasi EP",            type: "portrait"  },
        { src: "assets/images/ak6.jpeg",  caption: "EP Berintegritas",       type: "square"    },
        { src: "assets/images/ak7.jpeg",  caption: "Kebersamaan Sejati",     type: "portrait"  },
        { src: "assets/images/ak8.jpeg",  caption: "Angkatan 25 UNISBA",     type: "landscape" },
      ];
      return raw;
    })()
  },

  /* ─── Album 1: Anomali Angkatan 25 Ekonomi Pembangunan ─── */
  {
    badge:  "Album II",
    title:  "Anomali Angkatan 25",
    count:  "50 Foto",
    music:  "assets/music/TheWinner.mp3",   // GANTI: musik album 2
    photos: (function() {
      const raw = [
        { src: "assets/images/ak15.jpeg", caption: "Faris Sering Tidur",            type: "portrait"  },
        { src: "assets/images/ak16.jpeg", caption: "Iyan Jumpsut",                  type: "portrait"  },
        { src: "assets/images/ak17.jpeg", caption: "Rangga Banten Komedy",          type: "portrait"  },
        { src: "assets/images/ak19.jpeg", caption: "Reza Kircon Humoris",           type: "portrait"  },
        { src: "assets/images/ak20.jpeg", caption: "Hamzah Plenger Finall Boss",    type: "portrait"  },
        { src: "assets/images/ak9.png",   caption: "Bung Zizan",                    type: "portrait"  },
        { src: "assets/images/ak10.jpeg", caption: "Kamil Ganteng",                 type: "portrait"  },
        { src: "assets/images/ak14.jpeg", caption: "Rizal Bendahara",               type: "portrait"  },
        { src: "assets/images/ak15.jpeg", caption: "Anomali EP '25",                type: "square"    },
        { src: "assets/images/ak16.jpeg", caption: "Karakter Unik",                 type: "landscape" },
        { src: "assets/images/ak17.jpeg", caption: "Cerita di Balik Layar",         type: "portrait"  },
        { src: "assets/images/ak19.jpeg", caption: "Momen Lucu",                    type: "square"    },
        { src: "assets/images/ak20.jpeg", caption: "Anomali Sejati",                type: "landscape" },
        { src: "assets/images/ak9.png",   caption: "Ekspresi Ketua",                type: "portrait"  },
        { src: "assets/images/ak10.jpeg", caption: "Gaya Khas EP",                  type: "portrait"  },
        { src: "assets/images/ak14.jpeg", caption: "Anomali Angkatan",              type: "square"    },
        { src: "assets/images/ak15.jpeg", caption: "Santai EP",                     type: "landscape" },
        { src: "assets/images/ak16.jpeg", caption: "Canda Tawa",                    type: "portrait"  },
        { src: "assets/images/ak17.jpeg", caption: "Keunikan Angkatan",             type: "portrait"  },
        { src: "assets/images/ak19.jpeg", caption: "Kejutan EP",                    type: "landscape" },
        { src: "assets/images/ak20.jpeg", caption: "Personality EP",                type: "portrait"  },
        { src: "assets/images/ak9.png",   caption: "Karakter Kuat",                 type: "square"    },
        { src: "assets/images/ak10.jpeg", caption: "Anomali but Solid",             type: "portrait"  },
        { src: "assets/images/ak14.jpeg", caption: "Beda tapi Satu",                type: "landscape" },
        { src: "assets/images/ak15.jpeg", caption: "Unik Itu Kita",                 type: "portrait"  },
        { src: "assets/images/ak16.jpeg", caption: "EP Anomali Pride",              type: "portrait"  },
        { src: "assets/images/ak17.jpeg", caption: "Gila Tapi Kece",                type: "square"    },
        { src: "assets/images/ak19.jpeg", caption: "Wajah EP",                      type: "landscape" },
        { src: "assets/images/ak20.jpeg", caption: "Boss Finall EP",                type: "portrait"  },
        { src: "assets/images/ak9.png",   caption: "Leader Angkatan",               type: "portrait"  },
        { src: "assets/images/ak10.jpeg", caption: "Ketua Kelas Style",             type: "landscape" },
        { src: "assets/images/ak14.jpeg", caption: "Duit Aman",                     type: "square"    },
        { src: "assets/images/ak15.jpeg", caption: "Zzz Mode",                      type: "portrait"  },
        { src: "assets/images/ak16.jpeg", caption: "Jumpsut Vibes",                 type: "portrait"  },
        { src: "assets/images/ak17.jpeg", caption: "Humor Banten",                  type: "landscape" },
        { src: "assets/images/ak19.jpeg", caption: "Kircon Moment",                 type: "portrait"  },
        { src: "assets/images/ak20.jpeg", caption: "Plenger Mode On",               type: "square"    },
        { src: "assets/images/ak9.png",   caption: "Zizan Leadership",              type: "portrait"  },
        { src: "assets/images/ak10.jpeg", caption: "Kamil In Action",               type: "landscape" },
        { src: "assets/images/ak14.jpeg", caption: "Rizal Counting",                type: "portrait"  },
        { src: "assets/images/ak15.jpeg", caption: "Nap Time EP",                   type: "square"    },
        { src: "assets/images/ak16.jpeg", caption: "Fashion EP",                    type: "portrait"  },
        { src: "assets/images/ak17.jpeg", caption: "Komik Alami",                   type: "landscape" },
        { src: "assets/images/ak19.jpeg", caption: "Humoris Natural",               type: "portrait"  },
        { src: "assets/images/ak20.jpeg", caption: "Final Boss EP",                 type: "portrait"  },
        { src: "assets/images/ak9.png",   caption: "Pemimpin Muda",                 type: "square"    },
        { src: "assets/images/ak10.jpeg", caption: "Wajah Ketua Kelas",             type: "landscape" },
        { src: "assets/images/ak14.jpeg", caption: "Bendahara On Duty",             type: "portrait"  },
        { src: "assets/images/ak15.jpeg", caption: "Anomali Terindah",              type: "portrait"  },
        { src: "assets/images/ak16.jpeg", caption: "EP Beda Itu Indah",             type: "landscape" },
      ];
      return raw;
    })()
  },

  /* ─── Album 2: Prestasi ─── */
  {
    badge:  "Album III",
    title:  "Prestasi",
    count:  "50 Foto",
    music:  "assets/music/TheWinner.mp3",   // GANTI: musik album 3
    photos: (function() {
      const raw = [
        { src: "assets/images/ak1.jpeg",  caption: "Foto PDH FEB — Bangga",        type: "portrait"  },
        { src: "assets/images/ak12.jpeg", caption: "Diskusi Akademik Unggulan",     type: "landscape" },
        { src: "assets/images/ak13.jpeg", caption: "Makrab EP — Panitia",           type: "portrait"  },
        { src: "assets/images/ak4.jpeg",  caption: "Kebersamaan Panitia",           type: "landscape" },
        { src: "assets/images/ak5.jpeg",  caption: "Angkatan Berprestasi",          type: "square"    },
        { src: "assets/images/ak7.jpeg",  caption: "Lomba Ekonomi — Juara",         type: "portrait"  },
        { src: "assets/images/ak8.jpeg",  caption: "Kompetisi Nasional EP",         type: "landscape" },
        { src: "assets/images/ak11.jpeg", caption: "Penghargaan Akademik",          type: "portrait"  },
        { src: "assets/images/ak2.jpeg",  caption: "Himpunan EP Berprestasi",       type: "square"    },
        { src: "assets/images/ak6.jpeg",  caption: "Event Panitia EP",              type: "landscape" },
        { src: "assets/images/ak3.jpeg",  caption: "Prestasi Angkatan 25",          type: "portrait"  },
        { src: "assets/images/ak9.png",   caption: "Ketua Berprestasi",             type: "portrait"  },
        { src: "assets/images/ak1.jpeg",  caption: "Lomba Karya Tulis Ilmiah",      type: "landscape" },
        { src: "assets/images/ak12.jpeg", caption: "Seminar Akademik EP",           type: "portrait"  },
        { src: "assets/images/ak13.jpeg", caption: "Panitia Event Besar",           type: "square"    },
        { src: "assets/images/ak4.jpeg",  caption: "Kompetisi Mahasiswa",           type: "landscape" },
        { src: "assets/images/ak5.jpeg",  caption: "Juara Debat Ekonomi",           type: "portrait"  },
        { src: "assets/images/ak7.jpeg",  caption: "Olimpiade Ekonomi",             type: "portrait"  },
        { src: "assets/images/ak8.jpeg",  caption: "Penghargaan Terbaik",           type: "landscape" },
        { src: "assets/images/ak11.jpeg", caption: "Tim Lomba EP",                  type: "square"    },
        { src: "assets/images/ak2.jpeg",  caption: "Festival Ekonomi",              type: "portrait"  },
        { src: "assets/images/ak6.jpeg",  caption: "Workshop Nasional",             type: "landscape" },
        { src: "assets/images/ak3.jpeg",  caption: "Pengalaman Berharga",           type: "portrait"  },
        { src: "assets/images/ak10.jpeg", caption: "Ketua Kelas Berprestasi",       type: "portrait"  },
        { src: "assets/images/ak14.jpeg", caption: "Kelola Dana Lomba",             type: "square"    },
        { src: "assets/images/ak1.jpeg",  caption: "Penelitian Ekonomi",            type: "landscape" },
        { src: "assets/images/ak12.jpeg", caption: "Presentasi Karya",              type: "portrait"  },
        { src: "assets/images/ak13.jpeg", caption: "Koordinasi Panitia",            type: "landscape" },
        { src: "assets/images/ak4.jpeg",  caption: "Rapat Persiapan",               type: "portrait"  },
        { src: "assets/images/ak5.jpeg",  caption: "Pelaksanaan Event",             type: "square"    },
        { src: "assets/images/ak7.jpeg",  caption: "Sukses Event EP",               type: "landscape" },
        { src: "assets/images/ak8.jpeg",  caption: "Evaluasi Kegiatan",             type: "portrait"  },
        { src: "assets/images/ak11.jpeg", caption: "Piala Lomba EP",                type: "portrait"  },
        { src: "assets/images/ak2.jpeg",  caption: "Sertifikat Penghargaan",        type: "landscape" },
        { src: "assets/images/ak6.jpeg",  caption: "Bangga Berprestasi",            type: "square"    },
        { src: "assets/images/ak3.jpeg",  caption: "Angkatan Terbaik",              type: "portrait"  },
        { src: "assets/images/ak9.png",   caption: "Pemimpin Berprestasi",          type: "portrait"  },
        { src: "assets/images/ak1.jpeg",  caption: "Karya Nyata EP",                type: "landscape" },
        { src: "assets/images/ak12.jpeg", caption: "Inovasi Ekonomi",               type: "portrait"  },
        { src: "assets/images/ak13.jpeg", caption: "Kontribusi Nyata",              type: "square"    },
        { src: "assets/images/ak4.jpeg",  caption: "Juara Bersama",                 type: "landscape" },
        { src: "assets/images/ak5.jpeg",  caption: "Meraih Puncak",                 type: "portrait"  },
        { src: "assets/images/ak7.jpeg",  caption: "EP Kompetitif",                 type: "portrait"  },
        { src: "assets/images/ak8.jpeg",  caption: "Langkah Menuju Sukses",         type: "landscape" },
        { src: "assets/images/ak11.jpeg", caption: "Bersama Meraih Prestasi",       type: "square"    },
        { src: "assets/images/ak2.jpeg",  caption: "Dedikasi EP",                   type: "portrait"  },
        { src: "assets/images/ak6.jpeg",  caption: "Semangat Juara",                type: "landscape" },
        { src: "assets/images/ak3.jpeg",  caption: "Mahasiswa Berprestasi",         type: "portrait"  },
        { src: "assets/images/ak10.jpeg", caption: "EP Goes to Competition",        type: "square"    },
        { src: "assets/images/ak14.jpeg", caption: "Angkatan 25 Juara",             type: "landscape" },
      ];
      return raw;
    })()
  }
];


/* ═══════════════════════════════════════════════════════════
   ALBUM VIEWER — FIXED v3
   Semua album bisa play/pause, Now Playing indicator,
   animasi tombol aktif, auto-pause antar album, fallback autoplay
   ═══════════════════════════════════════════════════════════ */
(function initAlbumViewer() {
  const viewer        = document.getElementById("albumViewer");
  const closeBtn      = document.getElementById("albumCloseBtn");
  const masonry       = document.getElementById("albumMasonry");
  const badgeEl       = document.getElementById("albumViewerBadge");
  const titleEl       = document.getElementById("albumViewerTitle");
  const countEl       = document.getElementById("albumViewerCount");
  const albumMusic    = document.getElementById("albumMusic");
  const albumMusicBtn = document.getElementById("albumMusicBtn");
  const albumIconPlay = document.getElementById("albumIconPlay");
  const albumIconMute = document.getElementById("albumIconMute");
  const albumMusicLabel = document.getElementById("albumMusicLabel");
  const globalMusic   = document.getElementById("bgMusic");
  const musicPlayer   = document.getElementById("musicPlayer");

  // Guard: semua elemen wajib ada
  if (!viewer || !masonry) return;

  let currentAlbum = null;
  let albumPlaying  = false;

  /* ── Now Playing indicator (inject ke header) ── */
  const nowPlayingEl = document.createElement("div");
  nowPlayingEl.className = "now-playing-indicator";
  nowPlayingEl.innerHTML = `
    <span class="now-playing-dot"></span>
    <span class="now-playing-text">Now Playing</span>
  `;
  nowPlayingEl.style.display = "none";

  const controlsEl = document.querySelector(".album-viewer-controls");
  if (controlsEl && albumMusicBtn) {
    controlsEl.insertBefore(nowPlayingEl, albumMusicBtn);
  }

  /* ── Update semua UI musik ── */
  function updateMusicUI(playing) {
    albumPlaying = playing;

    // Icon play/mute
    if (albumIconPlay) albumIconPlay.style.display = playing ? "none"  : "block";
    if (albumIconMute) albumIconMute.style.display = playing ? "block" : "none";

    // Label tombol
    if (albumMusicLabel) albumMusicLabel.textContent = playing ? "Pause" : "Musik";

    // Animasi tombol aktif
    if (albumMusicBtn) {
      if (playing) {
        albumMusicBtn.classList.add("music-btn--playing");
      } else {
        albumMusicBtn.classList.remove("music-btn--playing");
      }
    }

    // Now Playing indicator
    if (nowPlayingEl) {
      nowPlayingEl.style.display = playing ? "flex" : "none";
    }
  }

  /* ── Start album music dengan retry autoplay ── */
  function startAlbumMusic(src) {
    if (!albumMusic) return;
    if (!src) { updateMusicUI(false); return; }

    // Reset dulu
    albumMusic.pause();
    albumMusic.currentTime = 0;
    albumMusic.src   = src;
    albumMusic.loop  = true;
    albumMusic.volume = 0.55;

    albumMusic.load(); // force browser load ulang

    const tryPlay = () => {
      const p = albumMusic.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          updateMusicUI(true);
        }).catch(() => {
          // Autoplay diblokir browser — tunggu user interaction
          updateMusicUI(false);
          const unlock = () => {
            albumMusic.play().then(() => updateMusicUI(true)).catch(() => {});
            document.removeEventListener("click", unlock);
            document.removeEventListener("touchstart", unlock);
          };
          document.addEventListener("click", unlock, { once: true });
          document.addEventListener("touchstart", unlock, { once: true, passive: true });
        });
      }
    };

    // Jika belum bisa diplay langsung, tunggu canplay event
    if (albumMusic.readyState >= 2) {
      tryPlay();
    } else {
      albumMusic.addEventListener("canplay", tryPlay, { once: true });
    }
  }

  /* ── Open album ── */
  function openAlbum(idx) {
    const album = ALBUM_DATA[idx];
    if (!album) {
      console.warn("[AlbumViewer] Album index tidak ditemukan:", idx, "| Total album:", ALBUM_DATA.length);
      return;
    }
    currentAlbum = idx;

    // Update header info
    if (badgeEl) badgeEl.textContent = album.badge || ("Album " + (idx + 1));
    if (titleEl) titleEl.textContent = album.title || "";
    if (countEl) countEl.textContent = album.count || "";

    // Bangun grid foto
    buildMasonry(album.photos || []);

    // Tampilkan viewer
    viewer.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => viewer.classList.add("open"));
    });

    // Pause global music & sembunyikan player global
    if (globalMusic && !globalMusic.paused) {
      globalMusic.pause();
    }
    if (musicPlayer) musicPlayer.classList.add("hidden-player");

    // Reset UI dulu sebelum mulai musik baru
    updateMusicUI(false);

    // Start musik album setelah viewer visible (beri delay sedikit)
    setTimeout(() => startAlbumMusic(album.music), 300);
  }

  /* ── Close album ── */
  function closeAlbum() {
    viewer.classList.remove("open");
    setTimeout(() => {
      viewer.hidden = true;
      document.body.style.overflow = "";
    }, 500);

    // Stop musik album
    if (albumMusic) {
      albumMusic.pause();
      albumMusic.src = "";
    }
    updateMusicUI(false);
    currentAlbum = null;

    // Tampilkan kembali global music player
    if (musicPlayer) musicPlayer.classList.remove("hidden-player");
  }

  /* ── Toggle play/pause tombol musik ── */
  if (albumMusicBtn) {
    albumMusicBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!albumMusic) return;

      if (albumPlaying) {
        albumMusic.pause();
        updateMusicUI(false);
      } else {
        albumMusic.play()
          .then(() => updateMusicUI(true))
          .catch(() => updateMusicUI(false));
      }
    });
  }

  /* ── Sync state jika audio berhenti/resume dari luar ── */
  if (albumMusic) {
    albumMusic.addEventListener("play",  () => updateMusicUI(true));
    albumMusic.addEventListener("pause", () => updateMusicUI(false));
    albumMusic.addEventListener("ended", () => updateMusicUI(false));
    albumMusic.addEventListener("error", () => {
      console.warn("[AlbumMusic] Gagal load audio:", albumMusic.src);
      updateMusicUI(false);
    });
  }

  /* ── Event: tombol "Buka Album" ── */
  document.querySelectorAll(".album-open-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.album, 10);
      if (!isNaN(idx)) openAlbum(idx);
    });
  });

  /* ── Event: klik card album ── */
  document.querySelectorAll(".album-card").forEach(card => {
    card.addEventListener("click", (e) => {
      // Jangan trigger kalau klik tombol di dalam card
      if (e.target.closest(".album-open-btn")) return;
      const idx = parseInt(card.dataset.album, 10);
      if (!isNaN(idx)) openAlbum(idx);
    });
  });

  /* ── Tutup dengan tombol close ── */
  if (closeBtn) closeBtn.addEventListener("click", closeAlbum);

  /* ── Tutup dengan ESC ── */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !viewer.hidden) closeAlbum();
  });

  /* ── Build masonry grid foto ── */
  function buildMasonry(photos) {
    masonry.innerHTML = "";
    if (!photos || !photos.length) return;

    photos.forEach((photo, i) => {
      const item = document.createElement("div");
      item.className = "album-photo-item";
      item.dataset.type  = photo.type  || "square";
      item.dataset.index = i;

      const img = document.createElement("img");
      img.alt     = photo.caption || "";
      img.loading = "lazy";
      img.src     = photo.src || "";

      img.addEventListener("load",  () => item.classList.add("loaded"));
      img.addEventListener("error", () => item.classList.add("loaded"));

      const hover = document.createElement("div");
      hover.className = "album-photo-hover";
      hover.innerHTML = `<svg viewBox="0 0 24 24" fill="none"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

      const numEl = document.createElement("span");
      numEl.className = "album-photo-num";
      numEl.textContent = String(i + 1).padStart(2, "0");

      item.appendChild(img);
      item.appendChild(hover);
      item.appendChild(numEl);
      item.addEventListener("click", () => openLightbox(i));
      masonry.appendChild(item);

      setTimeout(() => {
        if (img.complete) item.classList.add("loaded");
      }, i * 30);
    });
  }

  /* ── Expose untuk lightbox ── */
  window._albumGetPhotos = () => (currentAlbum !== null && ALBUM_DATA[currentAlbum])
    ? ALBUM_DATA[currentAlbum].photos
    : [];
})();

/* ═══════════════════════════════════════════════════════════
   LIGHTBOX — Full-screen photo preview with prev/next
   ═══════════════════════════════════════════════════════════ */
(function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const img      = document.getElementById("lightboxImg");
  const caption  = document.getElementById("lightboxCaption");
  const counter  = document.getElementById("lightboxCounter");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn  = document.getElementById("lightboxPrev");
  const nextBtn  = document.getElementById("lightboxNext");
  const bg       = document.getElementById("lightboxBg");

  if (!lightbox || !img) return;

  let photos  = [];
  let current = 0;

  window.openLightbox = function(index) {
    photos = (window._albumGetPhotos && window._albumGetPhotos()) || [];
    if (!photos.length) return;

    current = index;
    show(current);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => lightbox.classList.add("open"));
  };

  function show(i) {
    const photo = photos[i];
    if (!photo) return;
    img.src     = photo.src;
    img.alt     = photo.caption || "";
    if (caption) caption.textContent = photo.caption || "";
    if (counter) counter.textContent = `${i + 1} / ${photos.length}`;
  }

  function close() {
    lightbox.classList.remove("open");
    setTimeout(() => {
      lightbox.hidden = true;
      document.body.style.overflow = "hidden"; // album still open
      img.src = "";
    }, 400);
  }

  function prev() {
    current = (current - 1 + photos.length) % photos.length;
    img.style.opacity = "0";
    setTimeout(() => {
      show(current);
      img.style.opacity = "1";
    }, 150);
  }

  function next() {
    current = (current + 1) % photos.length;
    img.style.opacity = "0";
    setTimeout(() => {
      show(current);
      img.style.opacity = "1";
    }, 150);
  }

  if (closeBtn) closeBtn.addEventListener("click", close);
  if (prevBtn)  prevBtn.addEventListener("click",  prev);
  if (nextBtn)  nextBtn.addEventListener("click",  next);
  if (bg)       bg.addEventListener("click",       close);

  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "ArrowLeft")  prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape")     close();
  });

  // Touch swipe support
  let touchStartX = 0;
  lightbox.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend",   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
  }, { passive: true });
})();


/* ═══════════════════════════════════════════════════════════
   SMOOTH SCROLL — Internal anchor links
   ═══════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});


/* ═══════════════════════════════════════════════════════════
   HERO VIDEO — Fallback + performance
   ═══════════════════════════════════════════════════════════ */
(function initHeroVideo() {
  const video = document.getElementById("heroVideo");
  if (!video) return;

  // Pause video when out of viewport to save resources
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.1 });

  obs.observe(video);
})();
