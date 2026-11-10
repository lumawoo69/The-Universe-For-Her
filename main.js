
import * as THREE from "three";

const container = document.getElementById("universe");

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color("#080713");
scene.fog = new THREE.FogExp2("#080713", 0.008);

const camera = new THREE.PerspectiveCamera(
  65, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 1, 23);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

// LIGHTS
scene.add(new THREE.AmbientLight(0x9e8cc9, 1.5));

const mainLight = new THREE.PointLight(0xe7b4ff, 60, 100);
mainLight.position.set(0, 4, 5);
scene.add(mainLight);

const pinkLight = new THREE.PointLight(0xff8bcf, 40, 80);
pinkLight.position.set(-10, -3, -8);
scene.add(pinkLight);

// BACKGROUND STARS
const starGeometry = new THREE.BufferGeometry();
const starPositions = [];

for (let i = 0; i < 3200; i++) {
  starPositions.push(
    (Math.random() - 0.5) * 180,
    (Math.random() - 0.5) * 110,
    (Math.random() - 0.5) * 130
  );
}

starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starPositions, 3)
);

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.13,
  transparent: true,
  opacity: 0.9
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// DISTANT GALAXY
const galaxy = new THREE.Group();
scene.add(galaxy);

const galaxyColors = [0xc69bff, 0xf6a9d8, 0x9cbbff, 0xffffff];

for (let i = 0; i < 1400; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 12;

  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(Math.random() * 0.045 + 0.015, 6, 6),
    new THREE.MeshBasicMaterial({
      color: galaxyColors[Math.floor(Math.random() * galaxyColors.length)]
    })
  );

  dot.position.set(
    Math.cos(angle) * radius,
    (Math.random() - 0.5) * 2,
    Math.sin(angle) * radius - 24
  );

  galaxy.add(dot);
}

// CENTRAL HEART
const heartShape = new THREE.Shape();
heartShape.moveTo(0, -0.7);
heartShape.bezierCurveTo(-1.8, 0.5, -1.5, 1.8, -0.3, 1.5);
heartShape.bezierCurveTo(0, 1.45, 0.15, 1.1, 0, 0.9);
heartShape.bezierCurveTo(-0.15, 1.1, 0, 1.45, 0.3, 1.5);
heartShape.bezierCurveTo(1.5, 1.8, 1.8, 0.5, 0, -0.7);

const heart = new THREE.Mesh(
  new THREE.ExtrudeGeometry(heartShape, {
    depth: 0.3,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 2,
    bevelSize: 0.12,
    bevelThickness: 0.12
  }),
  new THREE.MeshPhysicalMaterial({
    color: 0xf1a6dc,
    emissive: 0x7b286b,
    emissiveIntensity: 1.2,
    metalness: 0.25,
    roughness: 0.22
  })
);

heart.position.set(0, 0, -4);
heart.scale.set(1.15, 1.15, 1.15);
scene.add(heart);

// ORBIT RINGS
const rings = [];

for (let i = 0; i < 3; i++) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.2 + i * 0.45, 0.012, 8, 160),
    new THREE.MeshBasicMaterial({
      color: i === 1 ? 0xffaadd : 0xbba4ff,
      transparent: true,
      opacity: 0.6
    })
  );

  ring.position.set(0, 0, -4);
  ring.rotation.x = Math.PI / 2.4 + i * 0.3;
  ring.rotation.y = i * 0.5;

  scene.add(ring);
  rings.push(ring);
}

// PARTICLE EXPLOSIONS
const explosionParticles = [];

function createExplosion(position, color = 0xffb9e8, amount = 150) {
  for (let i = 0; i < amount; i++) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(Math.random() * 0.055 + 0.018, 6, 6),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1
      })
    );

    particle.position.copy(position);

    const direction = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    ).normalize();

    scene.add(particle);

    explosionParticles.push({
      mesh: particle,
      velocity: direction.multiplyScalar(Math.random() * 0.2 + 0.035),
      life: 1,
      decay: Math.random() * 0.012 + 0.009
    });
  }
}

function updateExplosions() {
  for (let i = explosionParticles.length - 1; i >= 0; i--) {
    const p = explosionParticles[i];

    p.mesh.position.add(p.velocity);
    p.velocity.multiplyScalar(0.985);
    p.life -= p.decay;

    p.mesh.material.opacity = Math.max(0, p.life);
    p.mesh.scale.setScalar(Math.max(0.01, p.life));

    if (p.life <= 0) {
      scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
      explosionParticles.splice(i, 1);
    }
  }
}

// PORTAL WORLDS
const worldData = [
  ["Secret Portal", "A hidden entrance to a place filled with little surprises. Find two stars to unlock it."],
  ["Living Heart", "A little heart that represents the warmth and happiness you bring into my world."],
  ["Eternal Rose", "Some flowers bloom for a moment. Some feelings stay beautiful for a lifetime."],
  ["Butterfly Dimension", "Follow the butterflies through a world where every little wing carries a message."],
  ["Infinite Tunnel", "Imagine travelling through endless galaxies, with every light reminding me of you."],
  ["Time Machine", "A place for the moments we have shared and all the memories still waiting for us."],
  ["Wish Chamber", "Close your eyes, make a wish, and imagine the universe listening carefully."],
  ["Moon Garden", "A quiet little garden where glowing flowers and fireflies dance under the moon."],
  ["Heart Spell", "A place where even the smallest touch can turn into something magical."],
  ["Universe Explosion", "Thousands of tiny lights come together to create one beautiful moment."],
  ["Secret Library", "Some stories are written in books. Others are written in the hearts of people."],
  ["Final Universe", "You made it to the end. But the best part of this universe was never the stars."]
];

const portalColors = [
  0xc7a5ff, 0xff9dce, 0xf5b6d4, 0x9ee8ff,
  0xb6a1ff, 0xf3d5a8, 0xffc5e6, 0x9fffd8,
  0xff9db5, 0xd9b5ff, 0xc5c8ff, 0xffd5ef
];

const portalGroup = new THREE.Group();
scene.add(portalGroup);

const portals = [];
const portalMeshes = [];

for (let i = 0; i < worldData.length; i++) {
  const angle = (i / worldData.length) * Math.PI * 2;
  const portal = new THREE.Group();

  portal.position.set(
    Math.cos(angle) * 10.5,
    Math.sin(angle) * 4.2,
    -7 - Math.sin(angle * 2) * 2
  );

  const color = portalColors[i];

  const outer = new THREE.Mesh(
    new THREE.TorusGeometry(1.05, 0.055, 12, 80),
    new THREE.MeshBasicMaterial({ color })
  );

  const inner = new THREE.Mesh(
    new THREE.CircleGeometry(0.92, 48),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide
    })
  );

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );

  core.position.z = 0.08;

  const light = new THREE.PointLight(color, 6, 5);

  portal.add(outer, inner, core, light);
  portalGroup.add(portal);

  portals.push(portal);
  portalMeshes.push(outer, inner, core);
}

// COLLECTIBLE STARS
const collectibles = [];
const collectiblePositions = [
  [-5.5, 2.8, -3],
  [5.7, -2.5, -5]
];

for (let i = 0; i < collectiblePositions.length; i++) {
  const star = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.38, 1),
    new THREE.MeshBasicMaterial({ color: 0xffe6a6 })
  );

  star.position.set(...collectiblePositions[i]);
  scene.add(star);
  collectibles.push(star);

  const glow = new THREE.PointLight(0xffdba1, 5, 4);
  glow.position.copy(star.position);
  scene.add(glow);
}

// HIDDEN STAR
const secretStar = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.28, 1),
  new THREE.MeshBasicMaterial({ color: 0xffaadd })
);
secretStar.position.set(0, -6, -5);
scene.add(secretStar);

// FINAL HEART MADE OF STARS
const finaleCount = 1800;
const finaleGeometry = new THREE.BufferGeometry();

const finalePositions = new Float32Array(finaleCount * 3);
const finaleColors = new Float32Array(finaleCount * 3);
const startPositions = [];
const heartPositions = [];
const explosionDirections = [];

const particlePalette = [
  new THREE.Color("#ffd5f0"),
  new THREE.Color("#d9c5ff"),
  new THREE.Color("#ffffff"),
  new THREE.Color("#ffb9d7"),
  new THREE.Color("#f9d99d")
];

for (let i = 0; i < finaleCount; i++) {
  const start = new THREE.Vector3(
    (Math.random() - 0.5) * 2.5,
    (Math.random() - 0.5) * 2.5,
    (Math.random() - 0.5) * 2.5
  );

  startPositions.push(start);

  // HEART SHAPE MATHEMATICS
  const t = Math.random() * Math.PI * 2;

  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);

  const heartPoint = new THREE.Vector3(
    x * 0.23,
    y * 0.23,
    (Math.random() - 0.5) * 1.5
  );

  heartPositions.push(heartPoint);

  const direction = new THREE.Vector3(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1
  ).normalize();

  explosionDirections.push(direction);

  const color = particlePalette[
    Math.floor(Math.random() * particlePalette.length)
  ];

  finaleColors[i * 3] = color.r;
  finaleColors[i * 3 + 1] = color.g;
  finaleColors[i * 3 + 2] = color.b;

  finalePositions[i * 3] = start.x;
  finalePositions[i * 3 + 1] = start.y;
  finalePositions[i * 3 + 2] = start.z;
}

finaleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(finalePositions, 3)
);

finaleGeometry.setAttribute(
  "color",
  new THREE.BufferAttribute(finaleColors, 3)
);

const finaleMaterial = new THREE.PointsMaterial({
  size: 0.105,
  vertexColors: true,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});

const finaleParticles = new THREE.Points(finaleGeometry, finaleMaterial);
finaleParticles.position.set(0, 0, -4);
finaleParticles.visible = false;
scene.add(finaleParticles);

// INTERACTION VARIABLES
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let collected = 0;
let entered = false;
let selectedWorld = 0;
let nightMode = false;
let secretFound = false;
let starClickCount = 0;
let finaleStarted = false;
let finaleStartTime = 0;
let toastTimer;

const intro = document.getElementById("intro");
const interfaceUI = document.getElementById("interface");
const worldModal = document.getElementById("worldModal");
const letterModal = document.getElementById("letterModal");
const ending = document.getElementById("ending");
const endingContent = document.getElementById("endingContent");
const caption = document.getElementById("cinematicCaption");

// TOAST
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

// LETTERS
const starLetters = [
  "Sometimes I wonder how something as beautiful as you could exist in a universe this enormous. There are billions of stars, endless galaxies and countless worlds, but somehow my attention always finds its way back to you. I hope you never forget how special you are to me. Even on ordinary days, you have a way of making everything feel a little brighter. If I could give you every star in the sky, I would still feel like it was not enough.",

  "If I could travel through every galaxy, visit every planet and count every star, I would still choose to return to you. You make ordinary days feel extraordinary, and even the smallest moments become memories I want to keep. I do not know what every tomorrow will look like, but I hope there are many more beautiful moments waiting for us. Wherever life takes us, I hope you always remember that you deserve kindness, happiness and all the beautiful things this world can offer."
];

function showLetter(title, message) {
  document.getElementById("letterTitle").textContent = title;
  document.getElementById("letterText").textContent = message;
  letterModal.classList.remove("hidden");
}

function updateProgress() {
  document.getElementById("starCount").textContent = `${collected} / 2`;
  document.getElementById("progressFill").style.width =
    `${(collected / 2) * 100}%`;

  document.getElementById("progressNote").textContent =
    collected >= 2
      ? "The secret entrance is open. Your surprise awaits. ✨"
      : `Find ${2 - collected} more glowing star${collected === 1 ? "" : "s"}.`;
}

// PORTALS
function openWorld(index) {
  selectedWorld = index;

  document.getElementById("worldNumber").textContent =
    `WORLD ${String(index + 1).padStart(2, "0")}`;

  document.getElementById("worldTitle").textContent = worldData[index][0];
  document.getElementById("worldDescription").textContent = worldData[index][1];

  const status = document.getElementById("worldStatus");
  const action = document.getElementById("worldAction");

  if ((index === 0 || index === 11) && collected < 2) {
    status.textContent = `LOCKED · ${collected}/2 STARS`;
    action.textContent = "FIND THE STARS FIRST";
    action.disabled = true;
    action.style.opacity = "0.5";
  } else {
    status.textContent = index === 11
      ? "THE FINAL WORLD"
      : "A LITTLE WORLD FOR YOU";

    action.textContent = index === 11
      ? "BEGIN THE FINAL SURPRISE"
      : "ENTER THIS WORLD";

    action.disabled = false;
    action.style.opacity = "1";
  }

  worldModal.classList.remove("hidden");
}

// CLICK THE GALAXY
function onPointerDown(event) {
  if (!entered || finaleStarted ||
      !worldModal.classList.contains("hidden") ||
      !letterModal.classList.contains("hidden") ||
      !ending.classList.contains("hidden")) return;

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const starHits = raycaster.intersectObjects(collectibles);

  if (starHits.length > 0) {
    const found = starHits[0].object;

    if (found.visible) {
      const position = found.position.clone();
      found.visible = false;
      collected++;

      createExplosion(position, 0xffd9a8, 200);
      updateProgress();

      showLetter(
        collected === 1 ? "A little piece of my heart." : "Another little truth.",
        starLetters[collected - 1]
      );

      if (collected === 2) {
        setTimeout(() => {
          createExplosion(new THREE.Vector3(0, 0, -4), 0xffb9e8, 250);
          showToast("✨ THE FINAL PORTAL IS UNLOCKED!");
        }, 700);
      }
    }
    return;
  }

  const secretHit = raycaster.intersectObject(secretStar);

  if (secretHit.length > 0) {
    starClickCount++;

    if (starClickCount >= 5 && !secretFound) {
      secretFound = true;
      secretStar.visible = false;

      createExplosion(secretStar.position.clone(), 0xffaadd, 220);

      showLetter(
        "You found my hidden secret.",
        "Out of all the unexpected things that could happen in this enormous universe, meeting you is one of the things I am grateful for. I cannot promise every day will be perfect, but I hope you never doubt that you are someone worth celebrating. This little star was hidden just for you."
      );
    } else {
      showToast(`A mysterious star... ${5 - starClickCount} more clicks.`);
    }
    return;
  }

  const portalHits = raycaster.intersectObjects(portalMeshes);

  if (portalHits.length > 0) {
    let selected = portalHits[0].object;

    while (selected.parent && selected.parent !== portalGroup) {
      selected = selected.parent;
    }

    const index = portals.indexOf(selected);

    if (index !== -1) {
      createExplosion(portals[index].position.clone(), portalColors[index], 100);
      openWorld(index);
    }
  }
}

renderer.domElement.addEventListener("pointerdown", onPointerDown);

// START THE CINEMATIC ENDING
function startFinale() {
  if (finaleStarted) return;

  finaleStarted = true;
  entered = false;

  worldModal.classList.add("hidden");
  interfaceUI.classList.add("hidden");
  letterModal.classList.add("hidden");

  finaleParticles.visible = true;
  finaleMaterial.opacity = 0;

  finaleStartTime = clock.getElapsedTime();

  caption.textContent = "Every star has a story...";
  caption.classList.add("visible");

  // Hide normal galaxy elements during the cinematic
  heart.visible = false;
  rings.forEach(ring => ring.visible = false);
  portalGroup.visible = false;
  collectibles.forEach(star => star.visible = false);
  secretStar.visible = false;

  showToast("Look at the stars... ✨");
}

// UPDATE CINEMATIC HEART
function updateFinale(time) {
  if (!finaleStarted) return;

  const elapsed = time - finaleStartTime;
  const positions = finaleGeometry.attributes.position.array;

  // PHASE 1: THE UNIVERSE EXPLODES OUTWARD
  if (elapsed < 1.8) {
    const progress = elapsed / 1.8;
    const eased = progress * progress;

    finaleMaterial.opacity = Math.min(1, progress * 2);

    for (let i = 0; i < finaleCount; i++) {
      const start = startPositions[i];
      const direction = explosionDirections[i];

      positions[i * 3] =
        start.x + direction.x * eased * 10;

      positions[i * 3 + 1] =
        start.y + direction.y * eased * 10;

      positions[i * 3 + 2] =
        start.z + direction.z * eased * 5;
    }

    caption.textContent = "A universe of endless stars...";
  }

  // PHASE 2: STARS GATHER INTO A HEART
  else if (elapsed < 4.5) {
    const progress = (elapsed - 1.8) / 2.7;
    const eased = 1 - Math.pow(1 - progress, 3);

    for (let i = 0; i < finaleCount; i++) {
      const start = startPositions[i];
      const direction = explosionDirections[i];
      const target = heartPositions[i];

      const explodedX = start.x + direction.x * 10;
      const explodedY = start.y + direction.y * 10;
      const explodedZ = start.z + direction.z * 5;

      positions[i * 3] =
        THREE.MathUtils.lerp(explodedX, target.x, eased);

      positions[i * 3 + 1] =
        THREE.MathUtils.lerp(explodedY, target.y, eased);

      positions[i * 3 + 2] =
        THREE.MathUtils.lerp(explodedZ, target.z, eased);
    }

    caption.textContent = "And somehow... it becomes a heart.";
  }

  // PHASE 3: THE HEART GLOWS AND PULSES
  else if (elapsed < 6.5) {
    const pulse = 1 + Math.sin(elapsed * 5) * 0.045;

    for (let i = 0; i < finaleCount; i++) {
      const target = heartPositions[i];

      positions[i * 3] = target.x * pulse;
      positions[i * 3 + 1] = target.y * pulse;
      positions[i * 3 + 2] = target.z * pulse;
    }

    finaleMaterial.opacity = 1;
    finaleMaterial.size = 0.13 + Math.sin(elapsed * 5) * 0.025;

    caption.textContent = "Because my heart always finds you.";
  }

  // PHASE 4: THE HEART EXPLODES INTO THE UNIVERSE
  else if (elapsed < 8.5) {
    const progress = (elapsed - 6.5) / 2;
    const eased = progress * progress;

    for (let i = 0; i < finaleCount; i++) {
      const target = heartPositions[i];
      const direction = explosionDirections[i];

      positions[i * 3] =
        target.x + direction.x * eased * 14;

      positions[i * 3 + 1] =
        target.y + direction.y * eased * 14;

      positions[i * 3 + 2] =
        target.z + direction.z * eased * 9;
    }

    finaleMaterial.opacity = 1 - progress;
    caption.textContent = "You are my favourite universe.";
  }

  // PHASE 5: REVEAL THE LETTER
  else {
    finaleParticles.visible = false;
    caption.classList.remove("visible");

    if (ending.classList.contains("hidden")) {
      ending.classList.remove("hidden");

      setTimeout(() => {
        endingContent.classList.add("show-letter");
      }, 250);
    }
  }

  finaleGeometry.attributes.position.needsUpdate = true;
}

// BUTTONS
document.getElementById("enterBtn").addEventListener("click", () => {
  entered = true;
  intro.classList.add("hidden");
  interfaceUI.classList.remove("hidden");

  createExplosion(new THREE.Vector3(0, 0, -4), 0xffb9e8, 180);
  showToast("Welcome to your universe, Ohmmar. ✨");
});

document.getElementById("closeModal").addEventListener("click", () => {
  worldModal.classList.add("hidden");
});

document.getElementById("letterClose").addEventListener("click", () => {
  letterModal.classList.add("hidden");
});

document.getElementById("worldAction").addEventListener("click", () => {
  if ((selectedWorld === 0 || selectedWorld === 11) && collected < 2) return;

  worldModal.classList.add("hidden");

  if (selectedWorld === 11) {
    startFinale();
  } else {
    showLetter(
      worldData[selectedWorld][0],
      worldData[selectedWorld][1] +
      "\n\nThis little world is a reminder that there are still so many beautiful moments and surprises waiting to be discovered."
    );
  }
});

document.getElementById("backBtn").addEventListener("click", () => {
  ending.classList.add("hidden");
  endingContent.classList.remove("show-letter");

  // Reset the cinematic so the ending can be replayed
  finaleStarted = false;
  finaleParticles.visible = false;

  heart.visible = true;
  rings.forEach(ring => ring.visible = true);
  portalGroup.visible = true;

  collectibles.forEach((star, i) => {
    star.visible = false;
  });

  secretStar.visible = false;

  entered = true;
  interfaceUI.classList.remove("hidden");

  showToast("Your universe is still here. ✨");
});

// NIGHT MODE
document.getElementById("nightBtn").addEventListener("click", () => {
  nightMode = !nightMode;

  if (nightMode) {
    scene.background.set("#02020b");
    scene.fog.color.set("#02020b");
    starMaterial.color.set("#b7c9ff");
    document.getElementById("nightBtn").textContent = "☀ Day mode";
    showToast("The universe is now in night mode.");
  } else {
    scene.background.set("#080713");
    scene.fog.color.set("#080713");
    starMaterial.color.set("#ffffff");
    document.getElementById("nightBtn").textContent = "☾ Night mode";
    showToast("The universe is glowing again.");
  }
});

// HELP
document.getElementById("helpBtn").addEventListener("click", () => {
  showLetter(
    "How to explore your universe",
    "Drag your mouse to look around. Find the two golden stars to unlock the final world. Click the floating rings to discover all twelve worlds. There is also a tiny pink hidden star near the bottom of your view. Click it five times to reveal a secret letter. Take your time. There is no rush."
  );
});

// DRAG CAMERA
let dragging = false;
let previousX = 0;
let previousY = 0;
let targetRotationY = 0;
let targetRotationX = 0;

renderer.domElement.addEventListener("pointerdown", event => {
  if (!entered || finaleStarted) return;

  dragging = true;
  previousX = event.clientX;
  previousY = event.clientY;
});

window.addEventListener("pointerup", () => {
  dragging = false;
});

window.addEventListener("pointermove", event => {
  if (!dragging || !entered || finaleStarted) return;

  const dx = event.clientX - previousX;
  const dy = event.clientY - previousY;

  targetRotationY += dx * 0.003;
  targetRotationX += dy * 0.002;

  targetRotationX = Math.max(-0.5, Math.min(0.5, targetRotationX));

  previousX = event.clientX;
  previousY = event.clientY;
});

// ANIMATION LOOP
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  updateExplosions();

  if (!finaleStarted) {
    heart.scale.setScalar(1.15 + Math.sin(time * 2) * 0.045);
    heart.rotation.y = Math.sin(time * 0.4) * 0.2;
    heart.rotation.z = Math.sin(time * 0.7) * 0.04;

    rings.forEach((ring, i) => {
      ring.rotation.z += 0.0015 * (i + 1);
      ring.rotation.x += 0.0005;
    });

    portals.forEach((portal, i) => {
      portal.rotation.z = Math.sin(time * 0.5 + i) * 0.12;
      portal.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.035);
    });

    collectibles.forEach((star, i) => {
      star.rotation.y += 0.025;
      star.rotation.x += 0.012;
      star.position.y = collectiblePositions[i][1] +
        Math.sin(time * 1.5 + i) * 0.16;
    });

    secretStar.rotation.y += 0.025;
    secretStar.rotation.x += 0.01;
    secretStar.position.y = -6 + Math.sin(time * 1.7) * 0.25;

    galaxy.rotation.z += 0.0003;
    stars.rotation.y += 0.00008;

    if (entered) {
      portalGroup.rotation.y += 0.0008;
      portalGroup.rotation.x += 0.0001;
    }

    camera.rotation.y += (targetRotationY - camera.rotation.y) * 0.04;
    camera.rotation.x += (-targetRotationX - camera.rotation.x) * 0.04;
  } else {
    updateFinale(time);
  }

  renderer.render(scene, camera);
}

animate();

// RESIZE
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

updateProgress();
