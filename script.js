const state = {
  gravityEnabled: false,
  engine: null,
  runner: null,
  render: null,
  bodies: [],
  bodyMap: new Map(),
  mouse: null,
  mouseConstraint: null,
  raf: null,
};

const loader = document.getElementById("loader");
const progressBar = document.getElementById("progressBar");
const cursorGlow = document.getElementById("cursorGlow");
const gravityToggle = document.getElementById("gravityToggle");
const backTop = document.getElementById("backTop");
const typingText = document.getElementById("typingText");
const physicsCanvas = document.getElementById("physicsCanvas");

const typingPhrases = [
  "Diploma Robotics & Automation Student",
  "Robotics builder with an automation mindset",
  "Designing future-ready machine systems",
];

const mobileQuery = window.matchMedia("(max-width: 768px), (pointer: coarse)");

function isMobileExperience() {
  return mobileQuery.matches;
}

window.addEventListener("load", () => {
  setTimeout(() => loader.classList.add("hidden"), 850);
  initLibraries();
  initTyping();
  initCursor();
  initScrollUi();
  initMagneticHover();
  if (!isMobileExperience()) {
    setTimeout(() => enableGravity(), 3600);
  }
});

gravityToggle.addEventListener("click", (event) => {
  event.stopPropagation();

  if (state.gravityEnabled) {
    disableGravity();
  } else {
    enableGravity();
  }
});

backTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("resize", () => {
  if (!state.gravityEnabled) return;
  disableGravity();
  if (!isMobileExperience()) {
    window.setTimeout(enableGravity, 220);
  }
});

function initLibraries() {
  if (window.AOS) {
    AOS.init({ duration: 850, easing: "ease-out-cubic", once: true, offset: 80 });
  }

  if (window.particlesJS) {
    const compactMotion = isMobileExperience();
    particlesJS("particles-js", {
      particles: {
        number: { value: compactMotion ? 38 : 85, density: { enable: true, value_area: 900 } },
        color: { value: ["#18e7ff", "#ff3df2", "#4dffb8"] },
        shape: { type: "circle" },
        opacity: { value: 0.38, random: true },
        size: { value: 3, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#18e7ff",
          opacity: 0.18,
          width: 1,
        },
        move: {
          enable: true,
          speed: compactMotion ? 0.9 : 1.8,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "grab" },
          onclick: { enable: true, mode: "push" },
          resize: true,
        },
        modes: {
          grab: { distance: 170, line_linked: { opacity: 0.55 } },
          push: { particles_nb: 4 },
        },
      },
      retina_detect: true,
    });
  }

  if (window.gsap) {
    gsap.from(".hero .physics-object", {
      y: 36,
      opacity: 0,
      stagger: 0.08,
      duration: 1.05,
      ease: "power3.out",
    });
  }
}

function initTyping() {
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const phrase = typingPhrases[phraseIndex];
    typingText.textContent = phrase.slice(0, charIndex);

    if (!deleting && charIndex < phrase.length) {
      charIndex += 1;
      setTimeout(tick, 54);
      return;
    }

    if (!deleting && charIndex === phrase.length) {
      deleting = true;
      setTimeout(tick, 1450);
      return;
    }

    if (deleting && charIndex > 0) {
      charIndex -= 1;
      setTimeout(tick, 28);
      return;
    }

    deleting = false;
    phraseIndex = (phraseIndex + 1) % typingPhrases.length;
    setTimeout(tick, 240);
  }

  tick();
}

function initCursor() {
  if (!cursorGlow || isMobileExperience()) return;

  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });

  document.querySelectorAll("a, button, .physics-object").forEach((item) => {
    item.addEventListener("pointerenter", () => {
      cursorGlow.style.width = "46px";
      cursorGlow.style.height = "46px";
    });
    item.addEventListener("pointerleave", () => {
      cursorGlow.style.width = "26px";
      cursorGlow.style.height = "26px";
    });
  });
}

function initScrollUi() {
  window.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = `${progress}%`;
    backTop.classList.toggle("visible", window.scrollY > 460);
  }, { passive: true });
}

function initMagneticHover() {
  if (isMobileExperience()) return;

  document.querySelectorAll(".skill-card, .competition-card, .neon-button").forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      if (state.gravityEnabled) return;
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate(${x * 0.035}px, ${y * 0.045}px) translateY(-6px)`;
    });

    item.addEventListener("pointerleave", () => {
      if (!state.gravityEnabled) item.style.transform = "";
    });
  });
}

function enableGravity() {
  if (state.gravityEnabled || !window.Matter) return;

  const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events, Body } = Matter;
  state.gravityEnabled = true;
  document.body.classList.add("gravity-active");
  gravityToggle.classList.add("active");
  gravityToggle.setAttribute("aria-pressed", "true");
  gravityToggle.querySelector("span").textContent = "Gravity On";

  state.engine = Engine.create();
  state.engine.gravity.y = 1.08;

  state.render = Render.create({
    canvas: physicsCanvas,
    engine: state.engine,
    options: {
      width: window.innerWidth,
      height: window.innerHeight,
      wireframes: false,
      background: "transparent",
      pixelRatio: window.devicePixelRatio || 1,
    },
  });

  state.runner = Runner.create();
  Render.run(state.render);
  Runner.run(state.runner, state.engine);

  const pageHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);
  const ground = Bodies.rectangle(window.innerWidth / 2, pageHeight + 45, window.innerWidth + 180, 90, { isStatic: true });
  const leftWall = Bodies.rectangle(-45, pageHeight / 2, 90, pageHeight * 2, { isStatic: true });
  const rightWall = Bodies.rectangle(window.innerWidth + 45, pageHeight / 2, 90, pageHeight * 2, { isStatic: true });
  Composite.add(state.engine.world, [ground, leftWall, rightWall]);

  document.querySelectorAll(".physics-object").forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.width < 4 || rect.height < 4) return;

    element.dataset.originalTransform = element.style.transform || "";
    const originX = rect.left + rect.width / 2 + window.scrollX;
    const originY = rect.top + rect.height / 2 + window.scrollY;
    element.dataset.originX = `${originX}`;
    element.dataset.originY = `${originY}`;

    const body = Bodies.rectangle(originX, originY, rect.width, rect.height, {
      restitution: 0.72,
      friction: 0.24,
      frictionAir: 0.012,
      density: 0.0014,
      chamfer: { radius: Math.min(10, rect.height / 4) },
      render: { visible: false },
    });

    Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 9,
      y: Math.random() * -7,
    });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.12);
    Composite.add(state.engine.world, body);
    state.bodies.push(body);
    state.bodyMap.set(body.id, { element, rect });
  });

  if (!isMobileExperience()) {
    state.mouse = Mouse.create(document.body);
    state.mouse.pixelRatio = window.devicePixelRatio || 1;
    state.mouseConstraint = MouseConstraint.create(state.engine, {
      mouse: state.mouse,
      constraint: {
        stiffness: 0.22,
        damping: 0.08,
        render: { visible: false },
      },
    });
    Composite.add(state.engine.world, state.mouseConstraint);

    Events.on(state.mouseConstraint, "startdrag", (event) => {
      const mapped = state.bodyMap.get(event.body.id);
      if (mapped) mapped.element.classList.add("dragging");
    });

    Events.on(state.mouseConstraint, "enddrag", (event) => {
      const mapped = state.bodyMap.get(event.body.id);
      if (mapped) mapped.element.classList.remove("dragging");
    });
  }

  syncPhysics();
}

function syncPhysics() {
  if (!state.gravityEnabled) return;

  state.bodies.forEach((body) => {
    const mapped = state.bodyMap.get(body.id);
    if (!mapped) return;
    const { element } = mapped;
    const x = body.position.x - Number(element.dataset.originX);
    const y = body.position.y - Number(element.dataset.originY);
    element.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${body.angle}rad)`;
  });

  state.raf = requestAnimationFrame(syncPhysics);
}

function disableGravity() {
  if (!state.gravityEnabled || !window.Matter) return;

  const { Render, Runner, Composite, Mouse } = Matter;
  state.gravityEnabled = false;
  document.body.classList.remove("gravity-active");
  gravityToggle.classList.remove("active");
  gravityToggle.setAttribute("aria-pressed", "false");
  gravityToggle.querySelector("span").textContent = "Gravity Off";

  cancelAnimationFrame(state.raf);
  state.bodyMap.forEach(({ element }) => {
    element.classList.remove("dragging");
    element.style.transform = element.dataset.originalTransform || "";
  });

  if (state.render) Render.stop(state.render);
  if (state.runner) Runner.stop(state.runner);
  if (state.mouse) Mouse.clearSourceEvents(state.mouse);
  if (state.engine) Composite.clear(state.engine.world, false);

  state.bodies = [];
  state.bodyMap.clear();
  state.engine = null;
  state.runner = null;
  state.render = null;
  state.mouse = null;
  state.mouseConstraint = null;
}
