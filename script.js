// hide the photo frame if the headshot is missing, so there's no broken image
(() => {
  const img = document.querySelector(".photo img");
  const drop = () => img.closest(".photo").remove();
  if (img.complete && !img.naturalWidth) drop(); else img.addEventListener("error", drop);
})();

// Crumb is flipped across her anti-diagonal, so screen x/y swap and invert in her own space
(() => {
  const cat = document.querySelector(".cat");
  const eye = cat.querySelector(".eye");
  const pupil = cat.querySelector(".pupil");
  const lid = cat.querySelector(".lid");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  addEventListener("pointermove", (e) => {
    const r = eye.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(d / 250, 1);
    const unit = r.width / 56;
    const ux = -Math.round((dy / d) * 3 * k), uy = -Math.round((dx / d) * 2 * k);
    pupil.style.transform = `translate(${ux * unit}px, ${uy * unit}px)`;
  }, { passive: true });

  const blink = () => {
    lid.classList.remove("shut"); void lid.offsetWidth; lid.classList.add("shut");
    setTimeout(blink, 2500 + Math.random() * 4500);
  };
  if (!still) { setTimeout(blink, 2000); }
})();

(() => {
  const here = document.getElementById("here");
  const links = [...document.querySelectorAll(".bar nav a")];
  const names = { home: "home", about: "about", work: "work-samples", materials: "materials", contact: "contact" };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const id = en.target.id;
      here.textContent = names[id];
      links.forEach((a) => a.hash === "#" + id ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  Object.keys(names).forEach((id) => io.observe(document.getElementById(id)));

  // scroll in-page ourselves so links work even where hash navigation is blocked (previews, embeds)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    const target = a && document.getElementById(a.getAttribute("href").slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    try { history.replaceState(null, "", "#" + target.id); } catch {}
  });
})();

(() => {
  const viewer = document.getElementById("viewer");
  const frame = document.getElementById("viewer-frame");
  const missing = document.getElementById("viewer-missing");
  const name = document.getElementById("viewer-name");
  const tab = document.getElementById("viewer-tab");
  const dl = document.getElementById("viewer-dl");
  let current;

  const close = () => {
    viewer.hidden = true;
    frame.src = "about:blank";
    if (current) current.removeAttribute("aria-current");
  };

  const show = async (link) => {
    const href = link.getAttribute("href");
    if (current) current.removeAttribute("aria-current");
    // highlight the row in the listing, even when the hero's resume button was clicked
    current = document.querySelector(`.ls a[href="${href}"]`);
    if (current) current.setAttribute("aria-current", "true");

    name.textContent = href.split("/").pop();
    tab.href = dl.href = href;
    viewer.hidden = false;

    let found = true;
    try { found = (await fetch(href, { method: "HEAD" })).ok; } catch {}
    missing.hidden = found;
    frame.hidden = !found;
    tab.hidden = dl.hidden = !found;
    frame.src = found ? href + "#view=FitH" : "about:blank";
    viewer.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };

  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href$=".pdf"]');
    // phones without a built-in pdf viewer (Android Chrome) just follow the link instead
    if (!link || viewer.contains(link) || navigator.pdfViewerEnabled === false) return;
    e.preventDefault();
    show(link);
  });
  document.getElementById("viewer-close").addEventListener("click", close);
})();

// photos open in a lightbox; without dialog support they stay plain links to the image
(() => {
  const box = document.getElementById("lightbox");
  if (!box.showModal) return;
  const img = box.querySelector("img");
  const caption = box.querySelector(".lightbox-caption");
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a.ph");
    if (!link) return;
    e.preventDefault();
    const thumb = link.querySelector("img");
    img.src = link.getAttribute("href");
    img.alt = caption.textContent = thumb.alt;
    box.showModal();
  });
  box.querySelector(".lightbox-close").addEventListener("click", () => box.close());
  box.addEventListener("click", (e) => { if (e.target === box) box.close(); }); // click outside the photo
})();

document.getElementById("yr").textContent = new Date().getFullYear();
const btn = document.getElementById("copy");
btn.addEventListener("click", () => {
  const el = document.getElementById("email");
  const done = () => { btn.textContent = "copied"; setTimeout(() => (btn.textContent = "copy email"), 1600); };
  const select = () => { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = "press ctrl+c"; };
  try { navigator.clipboard.writeText(el.textContent).then(done, select); } catch { select(); }
});
