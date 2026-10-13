/* Program Magang & PKL Digital — script utama.
   Navbar, accordion FAQ, dan modal ditangani Bootstrap (bootstrap.bundle.min.js). */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---------- Header: bayangan saat scroll + tombol "ke atas" ---------- */
  var header = document.querySelector(".site-header");
  var topBtn = document.getElementById("float-top");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (topBtn) topBtn.classList.toggle("is-visible", y > 300);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  if (topBtn) {
    topBtn.addEventListener("click", function () {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Filter (portofolio & galeri) ----------
     Tombol:  <button class="filter" data-filter="website">
     Item:    <div class="col-..." data-cat="website design"> ... </div> */
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var buttons = group.querySelectorAll(".filter");
    var items = document.querySelectorAll(group.getAttribute("data-filter-group"));
    var empty = document.querySelector(group.getAttribute("data-empty") || "#none");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter");
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        var shown = 0;
        items.forEach(function (it) {
          var ok = f === "all" || (it.getAttribute("data-cat") || "").split(" ").indexOf(f) > -1;
          it.hidden = !ok;
          if (ok) shown++;
        });
        if (empty) empty.hidden = shown > 0;
      });
    });
  });

  /* ---------- Lightbox galeri (Bootstrap modal) ---------- */
  var lb = document.getElementById("lightbox");
  if (lb && window.bootstrap) {
    var stage = lb.querySelector(".lb-stage");
    var title = lb.querySelector(".modal-title");
    var modal = window.bootstrap.Modal.getOrCreateInstance(lb);
    document.querySelectorAll(".g-item").forEach(function (item) {
      item.addEventListener("click", function () {
        var img = item.querySelector("img");
        stage.innerHTML = "";
        if (img) {
          var big = document.createElement("img");
          big.src = img.currentSrc || img.src; big.alt = img.alt;
          stage.appendChild(big);
        } else {
          stage.innerHTML = '<div class="lb-ph"><i class="bi bi-image" aria-hidden="true"></i>Foto dokumentasi untuk kegiatan ini belum diunggah.<br>Ganti placeholder di galeri.html dengan foto asli.</div>';
        }
        title.textContent = item.getAttribute("data-caption") || "Foto kegiatan";
        modal.show();
      });
    });
  }

  /* ---------- Form pendaftaran ----------
     Isi atribut data-endpoint pada <form> dengan URL layanan form
     (mis. Formspree/Google Apps Script/backend sendiri). Selama kosong,
     form hanya divalidasi dan TIDAK mengirim data ke mana pun.        */
  var form = document.getElementById("form-daftar");
  if (form) {
    /* Prefill dari tautan, mis. daftar-magang.html?bidang=rpl&program=pkl-siswa-smk */
    var q = new URLSearchParams(location.search);
    ["bidang", "program"].forEach(function (k) {
      var v = q.get(k), el = document.getElementById("f-" + k);
      if (v && el && el.querySelector('option[value="' + v + '"]')) el.value = v;
    });

    var status = form.querySelector(".form-status");
    var fields = form.querySelectorAll("[required]");

    function showStatus(kind, html) {
      status.className = "form-status alert alert-" + kind + " mb-0";
      status.innerHTML = html;
      status.focus();
    }
    function setErr(el, msg) {
      var err = document.getElementById(el.id + "-err");
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      el.classList.toggle("is-invalid", !!msg);
      if (err) err.textContent = msg || "";
    }
    function validate(el) {
      var msg = "";
      if (el.type === "checkbox") { if (!el.checked) msg = "Centang persetujuan ini untuk melanjutkan."; }
      else if (!el.value.trim()) msg = "Bagian ini wajib diisi.";
      else if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) msg = "Format email belum benar.";
      else if (el.type === "tel" && !/^(\+?62|0)8[0-9]{7,12}$/.test(el.value.replace(/[\s-]/g, ""))) msg = "Gunakan nomor WhatsApp Indonesia, mis. 08123456789.";
      setErr(el, msg);
      return !msg;
    }
    fields.forEach(function (el) {
      el.addEventListener("blur", function () { validate(el); });
      el.addEventListener("input", function () { if (el.getAttribute("aria-invalid") === "true") validate(el); });
      el.addEventListener("change", function () { if (el.getAttribute("aria-invalid") === "true") validate(el); });
    });

    function summary() {
      var d = new FormData(form);
      var rows = [
        ["Nama lengkap", "nama"], ["Asal sekolah/kampus", "asal"], ["Kelas/semester", "kelas"], ["WhatsApp", "wa"],
        ["Email", "email"], ["Jurusan", "jurusan"], ["Bidang diminati", "bidang"], ["Jenis program", "program"],
        ["Periode", "periode"], ["Pesan tambahan", "pesan"]
      ];
      return "Pendaftaran Magang/PKL\n" + rows.map(function (r) { return r[0] + ": " + (d.get(r[1]) || "-"); }).join("\n");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (el) { if (!validate(el) && !firstBad) firstBad = el; });
      if (firstBad) { firstBad.focus(); showStatus("danger", "Masih ada isian yang perlu diperbaiki. Periksa kolom yang ditandai merah."); return; }
      if (form.querySelector('[name="website"]').value) return; /* honeypot */

      var endpoint = (form.getAttribute("data-endpoint") || "").trim();
      if (!endpoint) {
        showStatus("warning", "<strong>Data sudah lengkap, tetapi belum terkirim.</strong> Form ini belum terhubung ke server pendaftaran, jadi tidak ada data yang tersimpan. Salin ringkasan di bawah lalu kirim melalui kontak resmi penyelenggara.<br><button type=\"button\" class=\"btn btn-outline-dark btn-sm mt-2\" id=\"copy-summary\">Salin data pendaftaran</button>");
        var cb = document.getElementById("copy-summary");
        cb.addEventListener("click", function () {
          var text = summary();
          (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () { cb.textContent = "Tersalin ✓"; }, function () { window.prompt("Salin teks berikut:", text); });
        });
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = "Mengirim…";
      fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); showStatus("success", "<strong>Terima kasih!</strong> Pendaftaranmu sudah kami terima."); })
        .catch(function () { showStatus("danger", "Maaf, pengiriman gagal. Coba lagi beberapa saat lagi."); })
        .finally(function () { btn.disabled = false; btn.innerHTML = 'Kirim Pendaftaran <i class="bi bi-send" aria-hidden="true"></i>'; });
    });
  }

  /* ---------- Navigasi dropdown: desktop click navigasi ke href ---------- */
  document.querySelectorAll('.navbar-nav .nav-item.dropdown > a.dropdown-toggle').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (window.innerWidth >= 1200) {
        var href = this.getAttribute('href');
        if (href && href !== '#' && href !== 'javascript:void(0)') {
          window.location.href = href;
        }
      }
    });
  });

  /* ---------- TOC Scrollspy & Smooth Scroll ---------- */
  var tocLinks = document.querySelectorAll('#tocCollapseDesktop a[href^="#"], #tocCollapseMobile a[href^="#"]');
  if (tocLinks.length) {
    tocLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        var targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          var offset = (header ? header.offsetHeight : 70) + 20;
          var topPos = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: topPos, behavior: 'smooth' });
          history.replaceState(null, null, targetId);
        }
      });
    });

    var articleHeadings = document.querySelectorAll('.article-body h2[id]');
    if ('IntersectionObserver' in window && articleHeadings.length) {
      var headingObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            tocLinks.forEach(function (l) {
              var matches = l.getAttribute('href') === '#' + id;
              l.classList.toggle('active', matches);
            });
          }
        });
      }, { rootMargin: '0px 0px -60% 0px', threshold: 0 });
      articleHeadings.forEach(function (h) { headingObserver.observe(h); });
    }
  }
})();
