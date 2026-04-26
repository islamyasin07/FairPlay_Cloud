export function launchRpg(e: React.MouseEvent) {
  // Prevent map interaction on click
  e.stopPropagation();
  e.preventDefault();

  // Play mechanical button press sound
  const clickSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3");
  clickSound.volume = 0.8;
  clickSound.play().catch(err => console.warn("Audio play blocked", err));

  // Play missile launch/whoosh sound
  const launchSound = new Audio("https://assets.mixkit.co/active_storage/sfx/1460/1460-preview.mp3");
  launchSound.volume = 0.7;
  launchSound.play().catch(err => console.warn("Audio play blocked", err));

  const targetX = e.clientX;
  const targetY = e.clientY;

  const rocket = document.createElement("div");
  rocket.innerText = "🚀";
  rocket.style.position = "fixed";
  rocket.style.left = "50vw";
  rocket.style.bottom = "-50px";
  rocket.style.fontSize = "3rem";
  rocket.style.zIndex = "99999";
  rocket.style.pointerEvents = "none";

  // The rocket emoji points top-right (45 deg) by default.
  // We calculate angle from (center-bottom) to (targetX, targetY).
  const startX = window.innerWidth / 2;
  const startY = window.innerHeight;
  const deltaX = targetX - startX;
  const deltaY = targetY - startY; // negative since target is above
  
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  // Math.atan2 gives angle where 0 is right, -90 is up.
  // 🚀 points at -45 deg (up-right). So we adjust.
  rocket.style.transform = `translate(-50%, 50%) rotate(${angle + 45}deg)`;
  rocket.style.transition = "all 0.6s cubic-bezier(0.5, 0, 1, 1)";
  
  document.body.appendChild(rocket);

  // force reflow to make the transition work
  rocket.getBoundingClientRect();

  rocket.style.left = `${targetX}px`;
  rocket.style.bottom = `${window.innerHeight - targetY}px`;

  // Explode after animation ends
  setTimeout(() => {
    // Play explosion sound effect
    const explosionSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2180/2180-preview.mp3");
    explosionSound.volume = 0.5;
    explosionSound.play().catch(e => console.warn("Audio play blocked by browser:", e));

    rocket.innerText = "💥";
    rocket.style.transform = "translate(-50%, 50%) scale(4)";
    rocket.style.transition = "all 0.2s ease-out";
    
    // Shake screen
    const app = document.getElementById("root");
    if (app) {
      app.classList.add("rpg-shake");
      setTimeout(() => app.classList.remove("rpg-shake"), 500);
    }

    // Shrink & Fade
    setTimeout(() => {
      rocket.style.opacity = "0";
      setTimeout(() => rocket.remove(), 200);
    }, 400);

  }, 600);
}