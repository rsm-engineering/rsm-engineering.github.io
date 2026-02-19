/* ═══════════════════════════════════════════════════════
   SAGE Platform — Standalone JavaScript (Revised)
   Particle canvas, scroll reveals, stat counters,
   dataflow SVGs, MCP connections, node icon styling
   ═══════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ─── Particle Canvas ─── */
  var canvas = document.getElementById("particle-canvas");
  if (canvas) {
    var ctx = canvas.getContext("2d");
    var w, h;
    var particles = [];
    var gridLines = [];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Create particles
    for (var i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    // Create grid lines
    for (var j = 0; j < 25; j++) {
      gridLines.push({
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        len: Math.random() * 200 + 50,
        horizontal: Math.random() > 0.5,
        alpha: Math.random() * 0.05 + 0.01,
      });
    }

    function drawParticles() {
      ctx.clearRect(0, 0, w, h);

      // Grid lines
      for (var gi = 0; gi < gridLines.length; gi++) {
        var g = gridLines[gi];
        ctx.strokeStyle = "rgba(59, 130, 246, " + g.alpha + ")";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        if (g.horizontal) {
          ctx.moveTo(g.x % w, g.y % h);
          ctx.lineTo((g.x + g.len) % w, g.y % h);
        } else {
          ctx.moveTo(g.x % w, g.y % h);
          ctx.lineTo(g.x % w, (g.y + g.len) % h);
        }
        ctx.stroke();
      }

      // Particles
      for (var pi = 0; pi < particles.length; pi++) {
        var p = particles[pi];
        ctx.beginPath();
        ctx.arc(p.x % w, p.y % h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(59, 130, 246, " + p.alpha + ")";
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x += w;
        if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h;
        if (p.y > h) p.y -= h;
      }

      // Draw connection lines between nearby particles
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = (particles[a].x % w) - (particles[b].x % w);
          var dy = (particles[a].y % h) - (particles[b].y % h);
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = "rgba(59, 130, 246, " + (0.08 * (1 - dist / 120)) + ")";
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[a].x % w, particles[a].y % h);
            ctx.lineTo(particles[b].x % w, particles[b].y % h);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  /* ─── Scroll Reveal with Stagger ─── */
  var revealEls = document.querySelectorAll(".reveal");
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Add a small stagger based on data attribute or position
          var delay = entry.target.style.transitionDelay || "0s";
          entry.target.style.transitionDelay = delay;
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.08, rootMargin: "-30px" }
  );
  revealEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ─── Stat Counter Animation ─── */
  var statEls = document.querySelectorAll(".stat-value[data-target]");
  var statObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = "true";
          var target = parseInt(entry.target.dataset.target);
          var suffix = entry.target.dataset.suffix || "";
          var duration = 2000;
          var start = performance.now();
          function animate(now) {
            var elapsed = now - start;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.floor(eased * target);
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
  var dataflowContainers = document.querySelectorAll(".dataflow-svg");
  var pathVariants = [
    { startOff: -30, endOff: 15, midOff: -35 },
    { startOff: -10, endOff: -20, midOff: 25 },
    { startOff: 10, endOff: 5, midOff: -15 },
    { startOff: -15, endOff: -25, midOff: 20 },
    { startOff: 25, endOff: 10, midOff: -30 },
  ];

  dataflowContainers.forEach(function (container) {
    var color = container.dataset.color || "#3B82F6";
    var svgWidth = 1000;
    var svgHeight = 60;
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
    var filterId = "glow-" + Math.random().toString(36).substr(2, 8);
    filter.setAttribute("id", filterId);
    filter.setAttribute("x", "-100%");
    filter.setAttribute("y", "-100%");
    filter.setAttribute("width", "300%");
    filter.setAttribute("height", "300%");
    var feBlur = document.createElementNS(svgNS, "feGaussianBlur");
    feBlur.setAttribute("stdDeviation", "5");
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
      var offsets = pathVariants[i];
      var baseX = (svgWidth / (numPaths + 1)) * (i + 1);
      var startX = baseX + offsets.startOff;
      var endX = baseX + offsets.endOff;
      var midX = (startX + endX) / 2 + offsets.midOff;
      var pathD = "M" + startX + ",0 Q" + midX + "," + (svgHeight / 2) + " " + endX + "," + svgHeight;
      var duration = 1.5 + i * 0.35;
      var delay = i * 0.4;

      var g = document.createElementNS(svgNS, "g");

      // Dashed line
      var path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", pathD);
      path.setAttribute("stroke", color);
      path.setAttribute("stroke-width", "1.5");
      path.setAttribute("stroke-dasharray", "6 6");
      path.setAttribute("stroke-opacity", "0.4");
      path.setAttribute("fill", "none");
      var animDash = document.createElementNS(svgNS, "animate");
      animDash.setAttribute("attributeName", "stroke-dashoffset");
      animDash.setAttribute("from", "0");
      animDash.setAttribute("to", "-24");
      animDash.setAttribute("dur", "1.5s");
      animDash.setAttribute("repeatCount", "indefinite");
      path.appendChild(animDash);
      g.appendChild(path);

      // Traveling dot with glow
      var circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("r", "4");
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
      animOpacity.setAttribute("values", "0;0.9;0.9;0");
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
    var svgNS2 = "http://www.w3.org/2000/svg";
    var colors = ["#3B82F6", "#8B5CF6", "#14B8A6", "#F59E0B", "#EF4444", "#10B981"];
    var numServers = 6;

    // Glow filter for MCP
    var defs2 = document.createElementNS(svgNS2, "defs");
    var filter2 = document.createElementNS(svgNS2, "filter");
    filter2.setAttribute("id", "mcp-glow");
    filter2.setAttribute("x", "-100%");
    filter2.setAttribute("y", "-100%");
    filter2.setAttribute("width", "300%");
    filter2.setAttribute("height", "300%");
    var feBlur2 = document.createElementNS(svgNS2, "feGaussianBlur");
    feBlur2.setAttribute("stdDeviation", "3");
    feBlur2.setAttribute("result", "blur");
    filter2.appendChild(feBlur2);
    var feMerge2 = document.createElementNS(svgNS2, "feMerge");
    var fmn1 = document.createElementNS(svgNS2, "feMergeNode");
    fmn1.setAttribute("in", "blur");
    feMerge2.appendChild(fmn1);
    var fmn2 = document.createElementNS(svgNS2, "feMergeNode");
    fmn2.setAttribute("in", "SourceGraphic");
    feMerge2.appendChild(fmn2);
    filter2.appendChild(feMerge2);
    defs2.appendChild(filter2);
    mcpSvg.appendChild(defs2);

    for (var mi = 0; mi < numServers; mi++) {
      var startX = 400;
      var endX = (800 / (numServers + 1)) * (mi + 1);
      var midY = 40;
      var pathD = "M" + startX + ",0 Q" + ((startX + endX) / 2) + "," + midY + " " + endX + ",80";
      var color = colors[mi];

      var g = document.createElementNS(svgNS2, "g");

      var path = document.createElementNS(svgNS2, "path");
      path.setAttribute("d", pathD);
      path.setAttribute("stroke", color);
      path.setAttribute("stroke-width", "1.5");
      path.setAttribute("stroke-dasharray", "4 6");
      path.setAttribute("stroke-opacity", "0.35");
      path.setAttribute("fill", "none");
      var animDash = document.createElementNS(svgNS2, "animate");
      animDash.setAttribute("attributeName", "stroke-dashoffset");
      animDash.setAttribute("from", "0");
      animDash.setAttribute("to", "-20");
      animDash.setAttribute("dur", "2s");
      animDash.setAttribute("repeatCount", "indefinite");
      path.appendChild(animDash);
      g.appendChild(path);

      var circle = document.createElementNS(svgNS2, "circle");
      circle.setAttribute("r", "3");
      circle.setAttribute("fill", color);
      circle.setAttribute("filter", "url(#mcp-glow)");
      var animMotion = document.createElementNS(svgNS2, "animateMotion");
      animMotion.setAttribute("dur", (2 + mi * 0.3) + "s");
      animMotion.setAttribute("repeatCount", "indefinite");
      animMotion.setAttribute("begin", (mi * 0.35) + "s");
      animMotion.setAttribute("path", pathD);
      circle.appendChild(animMotion);
      var animOpacity = document.createElementNS(svgNS2, "animate");
      animOpacity.setAttribute("attributeName", "opacity");
      animOpacity.setAttribute("values", "0;0.9;0.9;0");
      animOpacity.setAttribute("dur", (2 + mi * 0.3) + "s");
      animOpacity.setAttribute("repeatCount", "indefinite");
      animOpacity.setAttribute("begin", (mi * 0.35) + "s");
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
      var ring = outer.querySelector("::before");
      // The CSS handles the ping animation, but we need to set the bg color
      outer.style.setProperty("--pulse-color", color);
      // Create a real element for the pulse since ::before needs bg
      var pulseRing = document.createElement("div");
      pulseRing.style.cssText = "position:absolute;inset:-4px;border-radius:50%;background:" + color + "20;animation:ping 2.5s cubic-bezier(0,0,0.2,1) infinite;pointer-events:none;";
      outer.style.position = "relative";
      outer.appendChild(pulseRing);
    }
  });

  /* ─── Step Card Hover Effects ─── */
  document.querySelectorAll(".step-card").forEach(function (card) {
    var color = card.dataset.color || "#3B82F6";
    card.addEventListener("mouseenter", function () {
      card.style.boxShadow = "0 0 30px " + color + "20";
      card.style.borderColor = color + "40";
    });
    card.addEventListener("mouseleave", function () {
      card.style.boxShadow = "none";
      card.style.borderColor = "rgba(255,255,255,0.08)";
    });
  });

  /* ─── MCP Card Hover Effects ─── */
  document.querySelectorAll(".mcp-card").forEach(function (card) {
    var color = card.dataset.color || "#3B82F6";
    card.addEventListener("mouseenter", function () {
      card.style.borderColor = color + "50";
      card.style.boxShadow = "0 0 25px " + color + "15";
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

  /* ─── Decision Card Hover ─── */
  document.querySelectorAll(".decision-card").forEach(function (card) {
    card.addEventListener("mouseenter", function () {
      var dot = card.querySelector(".decision-dot");
      if (dot) {
        var color = dot.style.backgroundColor;
        card.style.boxShadow = "0 0 20px " + color.replace("rgb", "rgba").replace(")", ", 0.1)");
      }
    });
    card.addEventListener("mouseleave", function () {
      card.style.boxShadow = "none";
    });
  });

  /* ─── Glow Card Hover ─── */
  document.querySelectorAll(".glow-card").forEach(function (card) {
    var glowColor = card.dataset.glow || "#3B82F6";
    card.addEventListener("mouseenter", function () {
      card.style.filter = "drop-shadow(0 0 20px " + glowColor + "20)";
    });
    card.addEventListener("mouseleave", function () {
      card.style.filter = "none";
    });
  });

  /* ─── Nav Scroll Effect ─── */
  var nav = document.getElementById("main-nav");
  var lastScroll = 0;
  window.addEventListener("scroll", function () {
    var currentScroll = window.scrollY;
    if (currentScroll > 100) {
      nav.style.background = "rgba(8, 9, 10, 0.95)";
    } else {
      nav.style.background = "rgba(14, 14, 30, 0.8)";
    }
    lastScroll = currentScroll;
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
