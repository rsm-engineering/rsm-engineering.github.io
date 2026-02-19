/* ═══════════════════════════════════════════════════════
   SAGE Platform — Standalone JavaScript
   Particle canvas, scroll reveals, stat counters,
   dataflow SVGs, MCP connections, node icon styling
   ═══════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ─── Particle Canvas ─── */
  const canvas = document.getElementById("particle-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let w, h, particles = [], gridLines = [];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight * 3;
    }
    resize();
    window.addEventListener("resize", resize);

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * 2000,
        y: Math.random() * 6000,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.3 + 0.1,
      });
    }

    // Create grid lines
    for (let i = 0; i < 20; i++) {
      gridLines.push({
        x: Math.random() * 2000,
        y: Math.random() * 6000,
        len: Math.random() * 200 + 50,
        horizontal: Math.random() > 0.5,
        alpha: Math.random() * 0.04 + 0.01,
      });
    }

    function drawParticles() {
      ctx.clearRect(0, 0, w, h);

      // Grid lines
      gridLines.forEach(function (g) {
        ctx.strokeStyle = "rgba(59, 130, 246, " + g.alpha + ")";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        if (g.horizontal) {
          ctx.moveTo(g.x, g.y);
          ctx.lineTo(g.x + g.len, g.y);
        } else {
          ctx.moveTo(g.x, g.y);
          ctx.lineTo(g.x, g.y + g.len);
        }
        ctx.stroke();
      });

      // Particles
      particles.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(59, 130, 246, " + p.alpha + ")";
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });

      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  /* ─── Scroll Reveal ─── */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1, rootMargin: "-50px" }
  );
  revealEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ─── Stat Counter Animation ─── */
  const statEls = document.querySelectorAll(".stat-value[data-target]");
  const statObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = "true";
          const target = parseInt(entry.target.dataset.target);
          const suffix = entry.target.dataset.suffix || "";
          const duration = 2000;
          const start = performance.now();
          function animate(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            entry.target.textContent = current.toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
        }
      });
    },
    { threshold: 0.5 }
  );
  statEls.forEach(function (el) {
    statObserver.observe(el);
  });

  /* ─── DataFlow SVGs ─── */
  const dataflowContainers = document.querySelectorAll(".dataflow-svg");
  const pathOffsets = [
    { startOff: -20, endOff: 10, midOff: -30 },
    { startOff: 0, endOff: -15, midOff: 20 },
    { startOff: 15, endOff: 5, midOff: -10 },
    { startOff: -10, endOff: -20, midOff: 15 },
    { startOff: 25, endOff: 15, midOff: -25 },
  ];

  dataflowContainers.forEach(function (container) {
    var color = container.dataset.color || "#3B82F6";
    var svgWidth = 1000;
    var svgHeight = 50;
    var numPaths = 5;

    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + svgWidth + " " + svgHeight);
    svg.setAttribute("fill", "none");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.overflow = "visible";

    // Glow filter
    var defs = document.createElementNS(svgNS, "defs");
    var filter = document.createElementNS(svgNS, "filter");
    var filterId = "glow-" + Math.random().toString(36).substr(2, 6);
    filter.setAttribute("id", filterId);
    filter.setAttribute("x", "-100%");
    filter.setAttribute("y", "-100%");
    filter.setAttribute("width", "300%");
    filter.setAttribute("height", "300%");
    var feBlur = document.createElementNS(svgNS, "feGaussianBlur");
    feBlur.setAttribute("stdDeviation", "4");
    feBlur.setAttribute("result", "blur");
    filter.appendChild(feBlur);
    var feMerge = document.createElementNS(svgNS, "feMerge");
    var feMergeNode1 = document.createElementNS(svgNS, "feMergeNode");
    feMergeNode1.setAttribute("in", "blur");
    feMerge.appendChild(feMergeNode1);
    var feMergeNode2 = document.createElementNS(svgNS, "feMergeNode");
    feMergeNode2.setAttribute("in", "SourceGraphic");
    feMerge.appendChild(feMergeNode2);
    filter.appendChild(feMerge);
    defs.appendChild(filter);
    svg.appendChild(defs);

    for (var i = 0; i < numPaths; i++) {
      var offsets = pathOffsets[i];
      var baseX = (svgWidth / (numPaths + 1)) * (i + 1);
      var startX = baseX + offsets.startOff;
      var endX = baseX + offsets.endOff;
      var midX = (startX + endX) / 2 + offsets.midOff;
      var pathD = "M" + startX + ",0 Q" + midX + "," + (svgHeight / 2) + " " + endX + "," + svgHeight;
      var duration = 1.8 + i * 0.4;
      var delay = i * 0.5;

      var g = document.createElementNS(svgNS, "g");

      // Dashed line
      var path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", pathD);
      path.setAttribute("stroke", color);
      path.setAttribute("stroke-width", "1.5");
      path.setAttribute("stroke-dasharray", "6 6");
      path.setAttribute("stroke-opacity", "0.35");
      path.setAttribute("fill", "none");
      var animDash = document.createElementNS(svgNS, "animate");
      animDash.setAttribute("attributeName", "stroke-dashoffset");
      animDash.setAttribute("from", "0");
      animDash.setAttribute("to", "-24");
      animDash.setAttribute("dur", "1.5s");
      animDash.setAttribute("repeatCount", "indefinite");
      path.appendChild(animDash);
      g.appendChild(path);

      // Traveling dot
      var circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("r", "3.5");
      circle.setAttribute("fill", color);
      circle.setAttribute("filter", "url(#" + filterId + ")");
      circle.setAttribute("opacity", "0");
      var animMotion = document.createElementNS(svgNS, "animateMotion");
      animMotion.setAttribute("dur", duration + "s");
      animMotion.setAttribute("repeatCount", "indefinite");
      animMotion.setAttribute("begin", delay + "s");
      animMotion.setAttribute("path", pathD);
      circle.appendChild(animMotion);
      var animOpacity = document.createElementNS(svgNS, "animate");
      animOpacity.setAttribute("attributeName", "opacity");
      animOpacity.setAttribute("values", "0;1;1;0");
      animOpacity.setAttribute("dur", duration + "s");
      animOpacity.setAttribute("repeatCount", "indefinite");
      animOpacity.setAttribute("begin", delay + "s");
      circle.appendChild(animOpacity);
      g.appendChild(circle);

      svg.appendChild(g);
    }

    container.appendChild(svg);
  });

  /* ─── MCP Connection SVG ─── */
  var mcpSvg = document.getElementById("mcp-svg");
  if (mcpSvg) {
    var svgNS = "http://www.w3.org/2000/svg";
    var colors = ["#3B82F6", "#8B5CF6", "#14B8A6", "#F59E0B", "#EF4444", "#10B981"];
    var numServers = 6;
    for (var i = 0; i < numServers; i++) {
      var startX = 400;
      var endX = (800 / (numServers + 1)) * (i + 1);
      var midY = 30;
      var pathD = "M" + startX + ",0 Q" + ((startX + endX) / 2) + "," + midY + " " + endX + ",60";
      var color = colors[i];

      var g = document.createElementNS(svgNS, "g");

      var path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", pathD);
      path.setAttribute("stroke", color);
      path.setAttribute("stroke-width", "1");
      path.setAttribute("stroke-dasharray", "4 6");
      path.setAttribute("stroke-opacity", "0.3");
      path.setAttribute("fill", "none");
      var animDash = document.createElementNS(svgNS, "animate");
      animDash.setAttribute("attributeName", "stroke-dashoffset");
      animDash.setAttribute("from", "0");
      animDash.setAttribute("to", "-20");
      animDash.setAttribute("dur", "2s");
      animDash.setAttribute("repeatCount", "indefinite");
      path.appendChild(animDash);
      g.appendChild(path);

      var circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("r", "2");
      circle.setAttribute("fill", color);
      var animMotion = document.createElementNS(svgNS, "animateMotion");
      animMotion.setAttribute("dur", (2 + i * 0.3) + "s");
      animMotion.setAttribute("repeatCount", "indefinite");
      animMotion.setAttribute("begin", (i * 0.4) + "s");
      animMotion.setAttribute("path", pathD);
      circle.appendChild(animMotion);
      var animOpacity = document.createElementNS(svgNS, "animate");
      animOpacity.setAttribute("attributeName", "opacity");
      animOpacity.setAttribute("values", "0;0.8;0.8;0");
      animOpacity.setAttribute("dur", (2 + i * 0.3) + "s");
      animOpacity.setAttribute("repeatCount", "indefinite");
      animOpacity.setAttribute("begin", (i * 0.4) + "s");
      circle.appendChild(animOpacity);
      g.appendChild(circle);

      mcpSvg.appendChild(g);
    }
  }

  /* ─── Node Icon Dynamic Styling ─── */
  document.querySelectorAll(".node-icon").forEach(function (node) {
    var color = node.dataset.color || "#3B82F6";
    var outer = node.querySelector(".node-outer");
    var inner = node.querySelector(".node-inner");
    var label = node.querySelector("span");

    if (outer) {
      outer.style.background = "radial-gradient(circle, " + color + "15 0%, transparent 70%)";
      outer.style.border = "1px solid " + color + "40";
      outer.style.boxShadow = "0 0 20px " + color + "20";
    }
    if (inner) {
      inner.style.background = "linear-gradient(135deg, " + color + "20, " + color + "05)";
      inner.style.border = "1px solid " + color + "30";
    }
    if (label) {
      label.style.color = color + "CC";
    }

    // Pulse ring for pulse nodes
    if (node.dataset.pulse === "true" && outer) {
      outer.style.position = "relative";
    }
  });

  /* ─── Step Card Hover Effects ─── */
  document.querySelectorAll(".step-card").forEach(function (card) {
    var color = card.dataset.color || "#3B82F6";
    card.addEventListener("mouseenter", function () {
      card.style.boxShadow = "0 0 30px " + color + "20";
    });
    card.addEventListener("mouseleave", function () {
      card.style.boxShadow = "none";
    });
  });

  /* ─── MCP Card Hover Effects ─── */
  document.querySelectorAll(".mcp-card").forEach(function (card) {
    var color = card.dataset.color || "#3B82F6";
    card.addEventListener("mouseenter", function () {
      card.style.borderColor = color + "50";
      card.style.boxShadow = "0 0 20px " + color + "15";
    });
    card.addEventListener("mouseleave", function () {
      card.style.borderColor = "rgba(255,255,255,0.08)";
      card.style.boxShadow = "none";
    });
  });

  /* ─── Hub Card Hover Effects ─── */
  document.querySelectorAll(".hub-card").forEach(function (card) {
    var color = card.dataset.color || "#3B82F6";
    card.addEventListener("mouseenter", function () {
      card.style.borderColor = color + "40";
      card.style.boxShadow = "0 0 20px " + color + "10";
    });
    card.addEventListener("mouseleave", function () {
      card.style.borderColor = "rgba(255,255,255,0.08)";
      card.style.boxShadow = "none";
    });
  });

  /* ─── Glow Card Hover ─── */
  document.querySelectorAll(".glow-card").forEach(function (card) {
    var glowColor = card.dataset.glow || "#3B82F6";
    card.style.setProperty("--glow", glowColor);
    var before = card.querySelector("::before");
    // Use CSS variable for glow
    card.addEventListener("mouseenter", function () {
      card.style.filter = "drop-shadow(0 0 20px " + glowColor + "20)";
    });
    card.addEventListener("mouseleave", function () {
      card.style.filter = "none";
    });
  });

  /* ─── Nav Scroll Effect ─── */
  var nav = document.getElementById("main-nav");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 100) {
      nav.style.background = "rgba(8, 9, 10, 0.95)";
    } else {
      nav.style.background = "rgba(14, 14, 30, 0.8)";
    }
  });

  /* ─── Smooth Scroll for Nav Links ─── */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

})();
