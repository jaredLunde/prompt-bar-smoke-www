/* Types the prompt, then reveals the run output line by line. No deps. */
(function () {
  var TEXT = "add a pricing page with three tiers to the marketing site";
  var typed = document.getElementById("typed");
  var caret = document.getElementById("type-caret");
  var badge = document.getElementById("term-badge");
  var steps = Array.prototype.slice.call(
    document.querySelectorAll("#term-body .step"),
  );
  if (!typed || !steps.length) return;

  var reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function finish() {
    typed.textContent = TEXT;
    steps.forEach(function (s) {
      s.classList.add("on");
    });
    if (caret) caret.style.display = "none";
    if (badge) {
      badge.textContent = "pr #412 open";
      badge.setAttribute("data-state", "done");
    }
  }

  if (reduced) {
    finish();
    return;
  }

  var i = 0;
  var timers = [];

  function type() {
    typed.textContent = TEXT.slice(0, ++i);
    if (i < TEXT.length) {
      timers.push(setTimeout(type, 26 + Math.random() * 46));
    } else {
      timers.push(setTimeout(run, 520));
    }
  }

  function run() {
    if (badge) {
      badge.textContent = "running";
      badge.setAttribute("data-state", "run");
    }
    if (caret) caret.style.display = "none";
    var delay = 0;
    steps.forEach(function (step, n) {
      // diff lines land fast, milestones pause
      delay += step.classList.contains("diffline") ? 130 : 420;
      timers.push(
        setTimeout(function () {
          step.classList.add("on");
          if (n === steps.length - 1 && badge) {
            badge.textContent = "pr #412 open";
            badge.setAttribute("data-state", "done");
          }
        }, delay),
      );
    });
    // loop so a late arrival still sees it
    timers.push(
      setTimeout(function () {
        reset();
      }, delay + 9000),
    );
  }

  function reset() {
    steps.forEach(function (s) {
      s.classList.remove("on");
    });
    typed.textContent = "";
    i = 0;
    if (caret) caret.style.display = "";
    if (badge) {
      badge.textContent = "idle";
      badge.removeAttribute("data-state");
    }
    timers.push(setTimeout(type, 900));
  }

  // only animate while visible
  var started = false;
  function start() {
    if (started) return;
    started = true;
    timers.push(setTimeout(type, 600));
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) start();
        });
      },
      { threshold: 0.25 },
    );
    io.observe(document.getElementById("term"));
  } else {
    start();
  }
})();
