import { useState, useEffect, useRef, useCallback } from "react";

// ─── Color Palette ───
const COLORS = {
  deepPurple: "#2d1b4e",
  warmPurple: "#5c3d7a",
  hotPink: "#e84393",
  coral: "#fd79a8",
  orange: "#fdcb6e",
  golden: "#f9ca24",
  softYellow: "#ffeaa7",
  skyBlue: "#74b9ff",
  deepBlue: "#0c2461",
  water: "#1a3c5e",
  waterLight: "#2d6187",
  mountainDark: "#1a0a2e",
  mountainMid: "#3d1f5c",
  mountainLight: "#6c3483",
  white: "#ffffff",
  textSoft: "rgba(255,255,255,0.85)",
  textDim: "rgba(255,255,255,0.5)",
};

// ─── Canvas Scene ───
function DreamScene({ opacity }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const particlesRef = useRef([]);
  const starsRef = useRef([]);

  useEffect(() => {
    const p = [];
    for (let i = 0; i < 60; i++) {
      p.push({
        x: Math.random() * 1200,
        y: Math.random() * 300 + 100,
        size: Math.random() * 2.5 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        alpha: Math.random() * 0.6 + 0.2,
        drift: Math.random() * 0.5 - 0.25,
      });
    }
    particlesRef.current = p;

    const s = [];
    for (let i = 0; i < 40; i++) {
      s.push({
        x: Math.random() * 1200,
        y: Math.random() * 200,
        size: Math.random() * 1.5 + 0.5,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01,
      });
    }
    starsRef.current = s;
  }, []);

  const draw = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    skyGrad.addColorStop(0, COLORS.deepPurple);
    skyGrad.addColorStop(0.25, COLORS.warmPurple);
    skyGrad.addColorStop(0.5, COLORS.hotPink);
    skyGrad.addColorStop(0.7, COLORS.coral);
    skyGrad.addColorStop(0.85, COLORS.orange);
    skyGrad.addColorStop(1, COLORS.golden);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.55);

    // Stars
    starsRef.current.forEach((star) => {
      star.twinkle += star.speed;
      const a = (Math.sin(star.twinkle) + 1) / 2 * 0.4 + 0.1;
      ctx.beginPath();
      ctx.arc(star.x * (w / 1200), star.y * (h / 800), star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,240,${a})`;
      ctx.fill();
    });

    // Sun glow
    const sunX = w * 0.5;
    const sunY = h * 0.38 + Math.sin(t * 0.2) * 3;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, w * 0.3);
    sunGlow.addColorStop(0, "rgba(253,203,110,0.8)");
    sunGlow.addColorStop(0.3, "rgba(253,121,168,0.3)");
    sunGlow.addColorStop(0.7, "rgba(232,67,147,0.1)");
    sunGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, w, h * 0.6);

    // Sun disc
    ctx.beginPath();
    ctx.arc(sunX, sunY, 35, 0, Math.PI * 2);
    const sunDisc = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 35);
    sunDisc.addColorStop(0, "rgba(255,255,220,1)");
    sunDisc.addColorStop(0.6, "rgba(253,203,110,0.9)");
    sunDisc.addColorStop(1, "rgba(253,121,168,0.6)");
    ctx.fillStyle = sunDisc;
    ctx.fill();

    // Mountains
    const horizonY = h * 0.48;
    drawMountainRange(ctx, w, horizonY, h * 0.12, COLORS.mountainDark, 0.6, t, 0.3);
    drawMountainRange(ctx, w, horizonY + h * 0.02, h * 0.1, COLORS.mountainMid, 0.7, t, 0.2);
    drawMountainRange(ctx, w, horizonY + h * 0.04, h * 0.08, COLORS.mountainLight, 0.5, t, 0.15);

    // Water
    const waterTop = h * 0.52;
    const waterGrad = ctx.createLinearGradient(0, waterTop, 0, h);
    waterGrad.addColorStop(0, "rgba(253,121,168,0.4)");
    waterGrad.addColorStop(0.15, "rgba(45,27,78,0.6)");
    waterGrad.addColorStop(0.4, COLORS.water);
    waterGrad.addColorStop(1, "#0a1628");
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, waterTop, w, h - waterTop);

    // Sun reflection
    const reflGrad = ctx.createLinearGradient(sunX, waterTop, sunX, h);
    reflGrad.addColorStop(0, "rgba(253,203,110,0.35)");
    reflGrad.addColorStop(0.3, "rgba(253,121,168,0.15)");
    reflGrad.addColorStop(0.6, "rgba(253,121,168,0.05)");
    reflGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = reflGrad;
    ctx.fillRect(sunX - 60, waterTop, 120, h - waterTop);

    // Water ripples
    for (let i = 0; i < 12; i++) {
      const ry = waterTop + 20 + i * ((h - waterTop - 20) / 12);
      const rOffset = Math.sin(t * 0.5 + i * 0.8) * 30;
      const rWidth = 40 + Math.sin(t * 0.3 + i) * 15;
      const rAlpha = 0.08 + Math.sin(t * 0.4 + i * 0.5) * 0.04;
      ctx.beginPath();
      ctx.moveTo(sunX - rWidth + rOffset, ry);
      ctx.quadraticCurveTo(sunX + rOffset, ry - 2, sunX + rWidth + rOffset, ry);
      ctx.strokeStyle = `rgba(255,230,180,${rAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Particles
    particlesRef.current.forEach((p) => {
      p.y -= p.speed;
      p.x += Math.sin(t + p.drift * 10) * p.drift;
      if (p.y < -10) {
        p.y = h * 0.55 + Math.random() * 100;
        p.x = Math.random() * w;
      }
      const pa = p.alpha * (0.5 + Math.sin(t * 2 + p.x) * 0.5);
      ctx.beginPath();
      ctx.arc(p.x * (w / 1200), p.y * (h / 800), p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(253,203,110,${pa})`;
      ctx.fill();
    });

    // Shore
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.88);
    ctx.quadraticCurveTo(w * 0.15, h * 0.84, w * 0.3, h * 0.87);
    ctx.quadraticCurveTo(w * 0.5, h * 0.92, w * 0.7, h * 0.86);
    ctx.quadraticCurveTo(w * 0.85, h * 0.83, w, h * 0.87);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = "#0a0a1a";
    ctx.fill();

    // Shore grass
    for (let gx = 0; gx < w; gx += 12) {
      const baseY = h * 0.86 + Math.sin(gx * 0.02) * h * 0.02;
      if (baseY < h * 0.84) continue;
      const sway = Math.sin(t * 0.8 + gx * 0.05) * 3;
      ctx.beginPath();
      ctx.moveTo(gx, baseY);
      ctx.quadraticCurveTo(gx + sway, baseY - 10, gx + sway * 0.5, baseY - 18);
      ctx.strokeStyle = "rgba(20,20,40,0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const loop = () => {
      timeRef.current += 0.016;
      draw(ctx, canvas.width, canvas.height, timeRef.current);
      animRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        opacity,
        transition: "opacity 2s ease",
      }}
    />
  );
}

function drawMountainRange(ctx, w, baseY, maxHeight, color, alphaBase, time, speed) {
  ctx.beginPath();
  const segments = 20;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * w;
    const peakPhase = Math.sin(i * 0.9 + 1.5) * 0.8 + Math.sin(i * 1.7) * 0.2;
    const y = baseY - Math.max(0, peakPhase) * maxHeight + Math.sin(time * speed + i) * 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.lineTo(w, baseY + 20);
  ctx.lineTo(0, baseY + 20);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.globalAlpha = alphaBase;
  ctx.fill();
  ctx.globalAlpha = 1;
}

// ─── Branching Prompt Engine ───
const PROMPT_STAGES = [
  { id: "welcome", text: null, delay: 3000 },
  {
    id: "what_want",
    text: "What do you want?",
    subtext: "Don\u2019t think too hard. Just let it come.",
    branches: (input) => {
      const l = input.toLowerCase();
      if (/peace|calm|quiet|rest|still|serene|relax/.test(l)) return "want_peace";
      if (/love|connect|relation|partner|friend|family|belong/.test(l)) return "want_connection";
      if (/free|escape|travel|adventure|new|change|different/.test(l)) return "want_freedom";
      if (/purpose|meaning|matter|impact|contribution|legacy/.test(l)) return "want_purpose";
      if (/success|achieve|goal|win|money|career|grow/.test(l)) return "want_success";
      if (/happy|joy|laugh|fun|light|play/.test(l)) return "want_joy";
      if (/heal|recover|whole|better|strong|health/.test(l)) return "want_healing";
      if (/know|understand|clarity|truth|answers|wisdom/.test(l)) return "want_clarity";
      return "want_general";
    },
  },
  { id: "want_peace", text: "Peace. That\u2019s a deep thing to want. What is it that\u2019s been loud?", subtext: "What\u2019s been taking up the space where quiet should be?", next: "why_matters" },
  { id: "want_connection", text: "Connection. You want to be seen \u2014 really seen. What\u2019s missing right now?", subtext: "Where do you feel the gap?", next: "why_matters" },
  { id: "want_freedom", text: "Freedom. Something is holding you. What does the cage look like?", subtext: "What would you walk away from if you could?", next: "why_matters" },
  { id: "want_purpose", text: "Purpose. You want your days to mean something. What would that feel like?", subtext: "Not what it looks like \u2014 what it feels like.", next: "why_matters" },
  { id: "want_success", text: "You want to build something. To get somewhere. Where are you trying to go?", subtext: "And who are you when you arrive?", next: "why_matters" },
  { id: "want_joy", text: "Joy. Simple and honest. When was the last time you really felt it?", subtext: "Let yourself remember.", next: "why_matters" },
  { id: "want_healing", text: "Healing. Something needs to mend. What part of you is asking for care?", subtext: "You don\u2019t have to name it perfectly.", next: "why_matters" },
  { id: "want_clarity", text: "Clarity. The fog is thick, isn\u2019t it? What question won\u2019t leave you alone?", subtext: "The one that keeps circling back.", next: "why_matters" },
  { id: "want_general", text: "Sit with that for a moment. Why does that matter to you?", subtext: "Not the surface reason \u2014 the real one.", next: "why_matters" },
  {
    id: "why_matters",
    text: "Why does this matter so much?",
    subtext: "Go deeper. What\u2019s underneath?",
    branches: (input) => {
      const l = input.toLowerCase();
      if (/afraid|fear|scared|worry|anxious|lose/.test(l)) return "fear_response";
      if (/love|care|someone|people|them|her|him|they/.test(l)) return "love_response";
      if (/deserve|worth|enough|should|owe/.test(l)) return "worth_response";
      if (/time|running out|short|urgent|wast/.test(l)) return "time_response";
      if (/always|never|every|since|childhood|kid|young|growing/.test(l)) return "pattern_response";
      return "depth_response";
    },
  },
  { id: "fear_response", text: "There\u2019s something you\u2019re afraid of losing \u2014 or never having. What does the fear protect?", subtext: "Fear usually guards what we love most.", next: "truth" },
  { id: "love_response", text: "This is about love, isn\u2019t it? For someone, for something, for who you could be.", subtext: "What does that love need from you today?", next: "truth" },
  { id: "worth_response", text: "You\u2019re questioning whether you\u2019re enough. But let me ask \u2014 who told you that you weren\u2019t?", subtext: "Whose voice is that, really?", next: "truth" },
  { id: "time_response", text: "Time feels heavy right now. Like the window is closing. But is it, truly?", subtext: "Or does it just feel that way?", next: "truth" },
  { id: "pattern_response", text: "This has been with you for a long time. You\u2019ve carried it far. What would it feel like to set it down?", subtext: "Even just for today.", next: "truth" },
  { id: "depth_response", text: "You\u2019re going deeper. Good. What\u2019s the truest thing you can say about this?", subtext: "The thing you might not say out loud.", next: "truth" },
  { id: "truth", text: "Now \u2014 say it simply. What do you really, truly want?", subtext: "One sentence. Your truth.", next: "align" },
  { id: "align", text: "You know what you want. What\u2019s one thing you can do today to move toward it?", subtext: "Not everything. Just one thing. The smallest honest step.", next: "closing" },
  { id: "closing", text: null, final: true },
];

function getStage(id) {
  return PROMPT_STAGES.find((s) => s.id === id);
}

// ─── Typewriter Effect ───
function TypewriterText({ text, speed = 45, onDone }) {
  const displayedRef = useRef("");
  const [, forceRender] = useState(0);
  const idxRef = useRef(0);
  const prevTextRef = useRef("");

  useEffect(() => {
    if (text !== prevTextRef.current) {
      prevTextRef.current = text;
      displayedRef.current = "";
      idxRef.current = 0;
    }
    if (!text) {
      if (onDone) onDone();
      return;
    }
    const interval = setInterval(() => {
      idxRef.current++;
      displayedRef.current = text.slice(0, idxRef.current);
      forceRender((n) => n + 1);
      if (idxRef.current >= text.length) {
        clearInterval(interval);
        if (onDone) onDone();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onDone]);

  return <span>{displayedRef.current}</span>;
}

// ─── Main App ───
export default function PearlLite() {
  const [phase, setPhase] = useState("arriving");
  const [stageId, setStageId] = useState("welcome");
  const [inputValue, setInputValue] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const [sceneOpacity, setSceneOpacity] = useState(0);
  const [uiOpacity, setUiOpacity] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);
  const [conversationLog, setConversationLog] = useState([]);
  const inputRef = useRef(null);
  const stage = getStage(stageId);

  useEffect(() => {
    if (phase === "arriving") {
      setTimeout(() => setSceneOpacity(1), 100);
      setTimeout(() => setPhase("sitting"), 2000);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "sitting") {
      setTimeout(() => setUiOpacity(1), 500);
      setTimeout(() => {
        setPhase("journey");
        setStageId("what_want");
        setTypingDone(false);
      }, 5000);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "journey" && stage && stage.text) {
      setTypingDone(false);
      setShowInput(false);
      setShowSubtext(false);
    }
  }, [stageId, phase]);

  useEffect(() => {
    if (typingDone && phase === "journey" && stage && stage.text) {
      const st = setTimeout(() => setShowSubtext(true), 400);
      const it = setTimeout(() => {
        setShowInput(true);
        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
        }, 100);
      }, 1000);
      return () => {
        clearTimeout(st);
        clearTimeout(it);
      };
    }
  }, [typingDone, phase, stage]);

  useEffect(() => {
    if (phase === "waking") {
      setUiOpacity(0);
      setTimeout(() => setSceneOpacity(0), 1500);
      setTimeout(() => setPhase("summary"), 3500);
    }
  }, [phase]);

  function handleSubmit() {
    if (!inputValue.trim()) return;
    const answer = inputValue.trim();
    setConversationLog((prev) => [...prev, { question: stage.text, answer, stageId }]);
    if (stage.final) return;
    let nextId;
    if (stage.branches) {
      nextId = stage.branches(answer);
    } else if (stage.next === "closing") {
      setInputValue("");
      setPhase("waking");
      return;
    } else {
      nextId = stage.next;
    }
    setInputValue("");
    setStageId(nextId);
  }

  function handleReplay() {
    setPhase("arriving");
    setStageId("welcome");
    setInputValue("");
    setConversationLog([]);
    setTypingDone(false);
    setSceneOpacity(0);
    setUiOpacity(0);
    setShowInput(false);
    setShowSubtext(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const truthEntry = conversationLog.find((c) => c.stageId === "truth");
  const alignEntry = conversationLog.find((c) => c.stageId === "align");

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#000" }}>
      <DreamScene opacity={sceneOpacity} />

      {(phase === "arriving" || phase === "sitting") && (
        <div
          style={{
            position: "fixed", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", zIndex: 10,
            opacity: uiOpacity, transition: "opacity 2s ease", pointerEvents: "none",
          }}
        >
          <h1
            style={{
              fontFamily: "'Baskervville', Georgia, serif",
              fontSize: "clamp(1.6rem, 4vw, 3rem)", color: COLORS.softYellow,
              textShadow: "0 2px 30px rgba(253,203,110,0.5)",
              letterSpacing: "0.05em", fontWeight: 400, margin: 0,
              textAlign: "center", padding: "0 2rem",
            }}
          >
            You're somewhere warm.
          </h1>
          <p
            style={{
              fontFamily: "Georgia, serif", fontSize: "clamp(0.9rem, 2vw, 1.2rem)",
              color: COLORS.textDim, marginTop: "1rem", fontStyle: "italic", textAlign: "center",
            }}
          >
            Sit for a moment. Breathe.
          </p>
        </div>
      )}

      {phase === "journey" && stage && stage.text && (
        <div
          style={{
            position: "fixed", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", zIndex: 10, padding: "2rem",
          }}
        >
          <div style={{ maxWidth: "600px", width: "100%", textAlign: "center" }}>
            <h2
              style={{
                fontFamily: "'Baskervville', Georgia, serif",
                fontSize: "clamp(1.3rem, 3.5vw, 2.2rem)", color: COLORS.softYellow,
                textShadow: "0 2px 25px rgba(253,203,110,0.4)",
                fontWeight: 400, lineHeight: 1.4, margin: 0, minHeight: "3em",
              }}
            >
              <TypewriterText key={stageId} text={stage.text} speed={45} onDone={() => setTypingDone(true)} />
            </h2>

            {showSubtext && stage.subtext && (
              <p
                style={{
                  fontFamily: "Georgia, serif", fontSize: "clamp(0.85rem, 1.8vw, 1.05rem)",
                  color: COLORS.textDim, fontStyle: "italic", marginTop: "0.8rem",
                  opacity: 0, animation: "fadeIn 1s ease forwards",
                }}
              >
                {stage.subtext}
              </p>
            )}

            {showInput && (
              <div style={{ marginTop: "2rem", opacity: 0, animation: "fadeIn 1s ease forwards" }}>
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Speak your truth..."
                  rows={3}
                  style={{
                    width: "100%", maxWidth: "500px", padding: "1rem 1.2rem",
                    fontSize: "1rem", fontFamily: "Georgia, serif", color: COLORS.white,
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "12px", outline: "none", resize: "none",
                    backdropFilter: "blur(10px)", transition: "border-color 0.3s ease",
                    lineHeight: 1.6, boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(253,203,110,0.4)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
                />
                <div style={{ marginTop: "0.8rem" }}>
                  <button
                    onClick={handleSubmit}
                    disabled={!inputValue.trim()}
                    style={{
                      padding: "0.6rem 2.5rem", fontSize: "0.9rem", fontFamily: "Georgia, serif",
                      color: inputValue.trim() ? COLORS.softYellow : "rgba(255,255,255,0.2)",
                      background: "transparent",
                      border: `1px solid ${inputValue.trim() ? "rgba(253,203,110,0.4)" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: "30px",
                      cursor: inputValue.trim() ? "pointer" : "default",
                      transition: "all 0.3s ease", letterSpacing: "0.08em",
                    }}
                  >
                    continue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {phase === "summary" && (
        <div
          style={{
            position: "fixed", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", zIndex: 10,
            background: "linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)",
            opacity: 0, animation: "fadeIn 2s ease forwards", padding: "2rem", overflow: "auto",
          }}
        >
          <div style={{ maxWidth: "550px", width: "100%", textAlign: "center" }}>
            <p
              style={{
                fontFamily: "Georgia, serif", fontSize: "0.85rem", color: COLORS.textDim,
                letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "2rem",
              }}
            >
              You woke up.
            </p>

            {truthEntry && (
              <div style={{ marginBottom: "2.5rem" }}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "0.8rem", color: COLORS.textDim, marginBottom: "0.5rem", fontStyle: "italic" }}>
                  What you truly want
                </p>
                <h2
                  style={{
                    fontFamily: "'Baskervville', Georgia, serif",
                    fontSize: "clamp(1.3rem, 3vw, 2rem)", color: COLORS.softYellow,
                    fontWeight: 400, lineHeight: 1.5,
                    textShadow: "0 2px 20px rgba(253,203,110,0.3)", margin: 0,
                  }}
                >
                  &ldquo;{truthEntry.answer}&rdquo;
                </h2>
              </div>
            )}

            {alignEntry && (
              <div style={{ marginBottom: "2.5rem" }}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "0.8rem", color: COLORS.textDim, marginBottom: "0.5rem", fontStyle: "italic" }}>
                  Your step today
                </p>
                <p
                  style={{
                    fontFamily: "'Baskervville', Georgia, serif",
                    fontSize: "clamp(1rem, 2.5vw, 1.4rem)", color: COLORS.coral,
                    fontWeight: 400, lineHeight: 1.5, margin: 0,
                  }}
                >
                  {alignEntry.answer}
                </p>
              </div>
            )}

            <div style={{ width: "40px", height: "1px", background: "rgba(255,255,255,0.15)", margin: "2rem auto" }} />

            <details style={{ textAlign: "left", marginBottom: "2rem" }}>
              <summary
                style={{
                  fontFamily: "Georgia, serif", fontSize: "0.8rem", color: COLORS.textDim,
                  cursor: "pointer", textAlign: "center", listStyle: "none", letterSpacing: "0.1em",
                }}
              >
                &#10022; view your full journey &#10022;
              </summary>
              <div style={{ marginTop: "1.5rem" }}>
                {conversationLog.map((entry, i) => (
                  <div key={i} style={{ marginBottom: "1.5rem" }}>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.8rem", color: COLORS.textDim, fontStyle: "italic", marginBottom: "0.3rem" }}>
                      {entry.question}
                    </p>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.95rem", color: COLORS.textSoft, lineHeight: 1.5, margin: 0 }}>
                      {entry.answer}
                    </p>
                  </div>
                ))}
              </div>
            </details>

            <button
              onClick={handleReplay}
              style={{
                padding: "0.7rem 2.5rem", fontSize: "0.9rem", fontFamily: "Georgia, serif",
                color: COLORS.softYellow, background: "transparent",
                border: "1px solid rgba(253,203,110,0.3)", borderRadius: "30px",
                cursor: "pointer", letterSpacing: "0.08em", transition: "all 0.3s ease", marginTop: "1rem",
              }}
              onMouseEnter={(e) => { e.target.style.background = "rgba(253,203,110,0.08)"; e.target.style.borderColor = "rgba(253,203,110,0.5)"; }}
              onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.borderColor = "rgba(253,203,110,0.3)"; }}
            >
              dream again
            </button>

            <p
              style={{
                fontFamily: "'Baskervville', Georgia, serif", fontSize: "0.75rem",
                color: "rgba(255,255,255,0.2)", marginTop: "3rem", letterSpacing: "0.2em",
              }}
            >
              PEARL
            </p>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baskervville:ital@0;1&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { width: 100%; height: 100%; overflow: hidden; background: #000; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        textarea::placeholder { color: rgba(255,255,255,0.25); font-style: italic; }
        textarea::-webkit-scrollbar { width: 4px; }
        textarea::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
        details > summary::-webkit-details-marker { display: none; }
        details > summary::marker { display: none; content: ""; }
        ::selection { background: rgba(253,203,110,0.3); color: white; }
      `}</style>
    </div>
  );
}
