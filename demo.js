/* Prompt Bar demo: a four-beat stage machine driving the hero mock and the
   stepper below it. No dependencies, no build step. */
(() => {
  const demo = document.getElementById("demo");
  const tabs = Array.from(document.querySelectorAll(".step[role='tab']"));
  const panels = Array.from(document.querySelectorAll(".step-panel"));
  if (!demo || !tabs.length) return;

  const STAGES = ["prompt", "preview", "pr", "merged"];
  const PROMPT = "add a pricing page with three tiers";
  const CHROME = {
    prompt: { url: "shop.example.com", badge: "idle" },
    preview: { url: "pr-482.preview.railway.app", badge: "rebuilding" },
    pr: { url: "pr-482.preview.railway.app", badge: "ready" },
    merged: { url: "shop.example.com", badge: "deployed" },
  };
  const MERGE_LABEL = { open: "Merge pull request", merged: "Merged" };
  const DWELL = { prompt: 4200, preview: 4200, pr: 5200, merged: 5200 };

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const typed = demo.querySelector(".typed");
  const urlStage = demo.querySelector(".url-stage");
  const badge = demo.querySelector(".badge.build");
  const mergeBtn = demo.querySelector("[data-merge]");
  const mergeLabel = demo.querySelector(".merge-label");

  let index = 0;
  let auto = !reduce.matches;
  let timer = null;
  let typeTimer = null;
  let visible = true;

  function stopTimers() {
    clearTimeout(timer);
    clearInterval(typeTimer);
    timer = typeTimer = null;
  }

  function typePrompt() {
    clearInterval(typeTimer);
    if (!typed) return;
    if (reduce.matches || !auto) {
      typed.textContent = PROMPT;
      return;
    }
    typed.textContent = "";
    let i = 0;
    typeTimer = setInterval(() => {
      typed.textContent = PROMPT.slice(0, ++i);
      if (i >= PROMPT.length) clearInterval(typeTimer);
    }, 42);
  }

  function render(stage) {
    demo.dataset.stage = stage;
    const chrome = CHROME[stage];
    if (urlStage) urlStage.textContent = chrome.url;
    if (badge) badge.textContent = chrome.badge;
    if (mergeBtn && mergeLabel) {
      const merged = stage === "merged";
      mergeLabel.textContent = merged ? MERGE_LABEL.merged : MERGE_LABEL.open;
      mergeBtn.disabled = merged;
    }

    tabs.forEach((tab) => {
      const on = tab.dataset.step === stage;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.step !== stage;
    });

    if (stage === "prompt") typePrompt();
    else if (typed) typed.textContent = PROMPT;
  }

  function schedule() {
    stopTimersOnlyAdvance();
    if (!auto || !visible) return;
    timer = setTimeout(() => {
      index = (index + 1) % STAGES.length;
      render(STAGES[index]);
      schedule();
    }, DWELL[STAGES[index]]);
  }

  function stopTimersOnlyAdvance() {
    clearTimeout(timer);
    timer = null;
  }

  function go(stage, { user = false } = {}) {
    index = Math.max(0, STAGES.indexOf(stage));
    if (user) {
      auto = false;
      document.body.classList.add("demo-paused");
      stopTimers();
    }
    render(STAGES[index]);
    if (auto) schedule();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => go(tab.dataset.step, { user: true }));
    tab.addEventListener("keydown", (e) => {
      const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!delta && e.key !== "Home" && e.key !== "End") return;
      e.preventDefault();
      const next =
        e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (i + delta + tabs.length) % tabs.length;
      tabs[next].focus();
      go(tabs[next].dataset.step, { user: true });
    });
  });

  if (mergeBtn) {
    mergeBtn.addEventListener("click", () => go("merged", { user: true }));
  }

  // Don't burn cycles (or attention) while the demo is off screen.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) schedule();
        else stopTimersOnlyAdvance();
      },
      { threshold: 0.15 },
    ).observe(demo);
  }

  reduce.addEventListener?.("change", () => {
    if (reduce.matches) {
      auto = false;
      stopTimers();
      if (typed) typed.textContent = PROMPT;
    }
  });

  render(STAGES[0]);
  if (auto) schedule();
  else document.body.classList.add("demo-paused");
})();
