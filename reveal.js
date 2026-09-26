// Slow fade-and-rise as sections enter. Nothing moves if the reader asked for less.
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const targets = document.querySelectorAll(
    ".chapter, .pull, .opener .standfirst, .opener .byline",
  );

  if (reduce.matches || !("IntersectionObserver" in window)) return;

  targets.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${Math.min(i, 2) * 90}ms`;
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.06 },
  );

  targets.forEach((el) => io.observe(el));

  // Safety net: nothing stays invisible, whatever the browser does.
  const revealAll = () => targets.forEach((el) => el.classList.add("is-in"));
  setTimeout(revealAll, 4000);
  window.addEventListener("beforeprint", revealAll);
})();
