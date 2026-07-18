import { useState, useEffect } from "react";

// ---------- Design tokens: "Candidate Dossier" ----------
// Ink #1C2420 · Paper #F4F4EE · Ledger green #1E6B4F · Stamp red #B5382C · Amber #9A6B0A
const T = {
  ink: "#1C2420",
  paper: "#F4F4EE",
  panel: "#FFFFFF",
  green: "#1E6B4F",
  greenSoft: "#E4EFE9",
  red: "#B5382C",
  redSoft: "#F7E7E4",
  amber: "#9A6B0A",
  amberSoft: "#F5EDDA",
  gray: "#6B7268",
  line: "#D8D9CF",
};

const SAMPLE_CV = `MARIA SANTOS
Quezon City, Philippines · maria.santos@email.com

EXPERIENCE
Social Media Manager — BrightPath Digital Agency (2022–present)
- Manage 6 client accounts across Instagram, TikTok, and Facebook
- Grew a fintech client's TikTok from 2K to 85K followers in 10 months
- Write monthly content calendars, briefs, and performance reports
- Coordinate with 3 freelance designers and 2 video editors

Virtual Assistant — US-based e-commerce founder (2020–2022)
- Inbox and calendar management, customer support via Zendesk
- Basic Shopify product uploads and order tracking

SKILLS
Content strategy, community management, Canva, CapCut, Meta Business Suite, basic SEO, English (fluent), Filipino (native)

EDUCATION
BA Communication Arts, University of Santo Tomas, 2020`;

const SAMPLE_JD = `ROLE: Senior Social Media Strategist (Remote, PH-based)

We're a US staffing startup looking for a senior strategist to own social across LinkedIn, X/Twitter, and TikTok.

REQUIREMENTS
- 4+ years in social media strategy, agency experience preferred
- Proven B2B content experience, especially LinkedIn
- Strong analytical skills: build reports, read funnel metrics, propose experiments
- Experience managing paid social budgets ($5K+/month)
- Excellent written English; able to ghostwrite for executives
- Comfortable with async remote work across US time zones

NICE TO HAVE
- Experience in recruiting/HR tech or B2B SaaS
- Familiarity with HubSpot or similar CRM`;

const LOADING_LINES = [
  "Reading the CV line by line…",
  "Cross-checking every requirement…",
  "Weighing experience against the role…",
  "Drafting interview questions…",
  "Stamping the verdict…",
];

export default function RecruiterWorkspace() {
  const [cv, setCv] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadIdx, setLoadIdx] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,600;125,800&family=IBM+Plex+Mono:wght@400;500&family=Public+Sans:wght@400;500;600&display=swap";
    document.head.appendChild(fontLink);
    return () => fontLink.remove();
  }, []);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(
      () => setLoadIdx((i) => (i + 1) % LOADING_LINES.length),
      2200
    );
    return () => clearInterval(t);
  }, [loading]);

  const analyze = async () => {
    if (!cv.trim() || !jd.trim()) {
      setError("Add both a CV and a job description before running the analysis.");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    setLoadIdx(0);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are an expert technical recruiter. Compare this candidate CV against the job description and respond ONLY with a valid JSON object — no preamble, no markdown fences, no commentary.

CV:
${cv}

JOB DESCRIPTION:
${jd}

Respond with exactly this JSON shape:
{
  "match_score": <integer 0-100>,
  "verdict": "<STRONG MATCH | GOOD MATCH | PARTIAL MATCH | WEAK MATCH>",
  "summary": "<2-3 sentence experience summary relevant to this role>",
  "matching_skills": ["<skill or qualification the candidate clearly meets>", ...4-7 items],
  "gaps": [{"item": "<missing or weak requirement>", "severity": "<missing|weak>"}, ...2-6 items],
  "concerns": ["<potential concern a recruiter should note>", ...1-4 items],
  "interview_questions": [{"q": "<question>", "probes": "<what this question tests, under 12 words>"}, ...5 items],
  "recommendation": {"action": "<ADVANCE | SCREEN FURTHER | PASS>", "rationale": "<1-2 sentences>"}
}

Be honest and specific. Ground every point in the actual CV and JD text. Score calibration: 85+ only if nearly all hard requirements are clearly met; 60-84 if core skills match but notable gaps exist; below 60 if key requirements are missing.`,
            },
          ],
        }),
      });
      const data = await response.json();
      const text = (data.content || [])
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (e) {
      console.error(e);
      setError(
        "The analysis didn't come back cleanly. Try running it again — occasionally the model response needs a second attempt."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setCv(SAMPLE_CV);
    setJd(SAMPLE_JD);
    setResult(null);
    setError(null);
  };

  const reset = () => {
    setCv("");
    setJd("");
    setResult(null);
    setError(null);
  };

  const verdictColor =
    result &&
    (result.match_score >= 80
      ? T.green
      : result.match_score >= 60
      ? T.amber
      : T.red);

  const display = { fontFamily: "'Archivo', sans-serif", fontStretch: "125%" };
  const mono = { fontFamily: "'IBM Plex Mono', monospace" };
  const body = { fontFamily: "'Public Sans', sans-serif" };

  return (
    <div style={{ ...body, minHeight: "100vh", background: T.paper, color: T.ink }}>
      <style>{`
        textarea:focus, button:focus-visible { outline: 2px solid ${T.green}; outline-offset: 2px; }
        textarea { resize: vertical; }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
        @keyframes stampIn { from { transform: rotate(-6deg) scale(1.6); opacity: 0; } to { transform: rotate(-6deg) scale(1); opacity: 1; } }
        @media (max-width: 720px) { .rw-cols { grid-template-columns: 1fr !important; } .rw-head { flex-direction: column; align-items: flex-start !important; gap: 12px; } }
      `}</style>

      {/* Header */}
      <header
        className="rw-head"
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          padding: "28px 32px 20px",
          borderBottom: `2px solid ${T.ink}`,
        }}
      >
        <div>
          <div style={{ ...mono, fontSize: 11, letterSpacing: "0.14em", color: T.gray, textTransform: "uppercase", marginBottom: 6 }}>
            Candidate Dossier
          </div>
          <h1 style={{ ...display, fontWeight: 800, fontSize: 30, margin: 0, letterSpacing: "-0.01em" }}>
            Recruiter Workspace
          </h1>
        </div>
        <div style={{ ...mono, fontSize: 12, color: T.gray }}>
          CV × JD → score · gaps · questions
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px 64px" }}>
        {/* Inputs */}
        <div className="rw-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[
            { label: "Candidate CV", val: cv, set: setCv, ph: "Paste the candidate's CV or resume text here…" },
            { label: "Job Description", val: jd, set: setJd, ph: "Paste the full job description here…" },
          ].map((f) => (
            <div key={f.label} style={{ background: T.panel, border: `1px solid ${T.line}`, borderTop: `3px solid ${T.ink}` }}>
              <div style={{ ...mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", padding: "10px 14px", borderBottom: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between" }}>
                <span>{f.label}</span>
                <span style={{ color: T.gray }}>{f.val.trim() ? `${f.val.trim().split(/\s+/).length} words` : "empty"}</span>
              </div>
              <textarea
                value={f.val}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.ph}
                rows={12}
                style={{ ...body, width: "100%", border: "none", padding: 14, fontSize: 13.5, lineHeight: 1.55, background: "transparent", boxSizing: "border-box" }}
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={analyze}
            disabled={loading}
            style={{ ...display, fontWeight: 600, fontSize: 15, background: loading ? T.gray : T.ink, color: T.paper, border: "none", padding: "13px 28px", cursor: loading ? "wait" : "pointer", letterSpacing: "0.02em" }}
          >
            {loading ? "Analyzing…" : "Run analysis"}
          </button>
          <button onClick={loadSample} style={{ ...mono, fontSize: 12.5, background: "transparent", color: T.ink, border: `1px solid ${T.ink}`, padding: "12px 18px", cursor: "pointer" }}>
            Load sample
          </button>
          {(cv || jd || result) && (
            <button onClick={reset} style={{ ...mono, fontSize: 12.5, background: "transparent", color: T.gray, border: "none", padding: "12px 6px", cursor: "pointer", textDecoration: "underline" }}>
              Clear
            </button>
          )}
          {loading && (
            <span style={{ ...mono, fontSize: 12.5, color: T.gray }}>{LOADING_LINES[loadIdx]}</span>
          )}
        </div>

        {error && (
          <div style={{ marginTop: 16, background: T.redSoft, borderLeft: `3px solid ${T.red}`, padding: "12px 16px", fontSize: 13.5 }}>
            {error}
          </div>
        )}

        {/* Report */}
        {result && (
          <section style={{ marginTop: 36, background: T.panel, border: `1px solid ${T.line}` }}>
            {/* Verdict band */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between", padding: "26px 28px", borderBottom: `2px solid ${T.ink}` }}>
              <div style={{ flex: "1 1 320px", minWidth: 260 }}>
                <div style={{ ...mono, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: T.gray, marginBottom: 8 }}>
                  Experience summary
                </div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>{result.summary}</p>
              </div>
              {/* Signature: the stamp */}
              <div
                aria-label={`Verdict: ${result.verdict}, score ${result.match_score} out of 100`}
                style={{
                  ...display,
                  animation: "stampIn 0.35s ease-out",
                  transform: "rotate(-6deg)",
                  border: `3px double ${verdictColor}`,
                  color: verdictColor,
                  padding: "12px 22px",
                  textAlign: "center",
                  fontWeight: 800,
                  userSelect: "none",
                }}
              >
                <div style={{ fontSize: 40, lineHeight: 1 }}>{result.match_score}</div>
                <div style={{ ...mono, fontSize: 10, letterSpacing: "0.1em", marginTop: 2 }}>/ 100</div>
                <div style={{ fontSize: 14, letterSpacing: "0.08em", marginTop: 6 }}>{result.verdict}</div>
              </div>
            </div>

            <div className="rw-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              {/* Matching skills */}
              <div style={{ padding: "22px 28px", borderRight: `1px solid ${T.line}` }}>
                <div style={{ ...mono, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: T.green, marginBottom: 12 }}>
                  Meets the bar
                </div>
                {(result.matching_skills || []).map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", fontSize: 13.5, lineHeight: 1.5, borderBottom: i < result.matching_skills.length - 1 ? `1px dashed ${T.line}` : "none" }}>
                    <span style={{ color: T.green, fontWeight: 600 }}>✓</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>

              {/* Gaps */}
              <div style={{ padding: "22px 28px" }}>
                <div style={{ ...mono, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: T.red, marginBottom: 12 }}>
                  Missing or weak
                </div>
                {(result.gaps || []).map((g, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "7px 0", fontSize: 13.5, lineHeight: 1.5, borderBottom: i < result.gaps.length - 1 ? `1px dashed ${T.line}` : "none" }}>
                    <span
                      style={{
                        ...mono,
                        fontSize: 10,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: g.severity === "missing" ? T.red : T.amber,
                        background: g.severity === "missing" ? T.redSoft : T.amberSoft,
                        padding: "2px 7px",
                        whiteSpace: "nowrap",
                        marginTop: 1,
                      }}
                    >
                      {g.severity}
                    </span>
                    <span>{g.item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Concerns */}
            {result.concerns && result.concerns.length > 0 && (
              <div style={{ padding: "22px 28px", borderTop: `1px solid ${T.line}` }}>
                <div style={{ ...mono, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: T.gray, marginBottom: 12 }}>
                  Recruiter notes
                </div>
                {result.concerns.map((c, i) => (
                  <p key={i} style={{ margin: "0 0 8px", fontSize: 13.5, lineHeight: 1.6 }}>
                    — {c}
                  </p>
                ))}
              </div>
            )}

            {/* Interview questions */}
            <div style={{ padding: "22px 28px", borderTop: `1px solid ${T.line}`, background: T.paper }}>
              <div style={{ ...mono, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: T.ink, marginBottom: 14 }}>
                Suggested interview questions
              </div>
              {(result.interview_questions || []).map((q, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, lineHeight: 1.5 }}>{q.q}</p>
                  <p style={{ ...mono, margin: "3px 0 0", fontSize: 11.5, color: T.gray }}>probes: {q.probes}</p>
                </div>
              ))}
            </div>

            {/* Recommendation */}
            {result.recommendation && (
              <div style={{ padding: "22px 28px", borderTop: `2px solid ${T.ink}`, display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                <span
                  style={{
                    ...display,
                    fontWeight: 800,
                    fontSize: 14,
                    letterSpacing: "0.08em",
                    color: T.paper,
                    background:
                      result.recommendation.action === "ADVANCE"
                        ? T.green
                        : result.recommendation.action === "PASS"
                        ? T.red
                        : T.amber,
                    padding: "8px 16px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {result.recommendation.action}
                </span>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, flex: 1, minWidth: 240 }}>
                  {result.recommendation.rationale}
                </p>
              </div>
            )}
          </section>
        )}

        {!result && !loading && (
          <p style={{ ...mono, marginTop: 40, fontSize: 12.5, color: T.gray, textAlign: "center" }}>
            Paste a CV and a job description above — or load the sample — then run the analysis.
          </p>
        )}
      </main>
    </div>
  );
}
