// ---- the cat (mirrored, so horizontal pupil movement is flipped) ----
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
    const ux = -Math.round((dx / d) * 3 * k), uy = Math.round((dy / d) * 2 * k);
    pupil.style.transform = `translate(${ux * unit}px, ${uy * unit}px)`;
  }, { passive: true });

  const blink = () => {
    lid.classList.remove("shut"); void lid.offsetWidth; lid.classList.add("shut");
    setTimeout(blink, 2500 + Math.random() * 4500);
  };
  if (!still) { setTimeout(blink, 2000); }
})();

// ---- path bar follows the section you're reading ----
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

document.getElementById("yr").textContent = new Date().getFullYear();
const btn = document.getElementById("copy");
btn.addEventListener("click", () => {
  const el = document.getElementById("email");
  const done = () => { btn.textContent = "copied"; setTimeout(() => (btn.textContent = "copy email"), 1600); };
  const select = () => { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = "press ctrl+c"; };
  try { navigator.clipboard.writeText(el.textContent).then(done, select); } catch { select(); }
});
