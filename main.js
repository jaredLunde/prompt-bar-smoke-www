// Demo-only form handling. Nothing is sent anywhere.
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".capture");
  if (!form) return;
  const input = form.querySelector("#email");
  const note = form.querySelector("#capture-note");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value.trim();
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    note.classList.remove("ok", "err");
    if (!looksLikeEmail) {
      note.textContent = "Enter an email address so we know where to send the invite.";
      note.classList.add("err");
      input.focus();
      return;
    }
    note.textContent = `Thanks — this is a demo page, so ${value} wasn't sent anywhere.`;
    note.classList.add("ok");
  });
});
