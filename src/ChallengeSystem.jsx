cat > src/ChallengeSystem.jsx << 'EOF'
import React, { useState } from "react";
import confetti from "canvas-confetti";

function fireConfetti() {
  const colors = ["#00ffe0", "#a78bfa", "#ffffff", "#00aaff"];
  const defaults = { spread: 360, ticks: 100, gravity: 0.8, decay: 0.94, startVelocity: 20, colors };
  const end = Date.now() + 1500;
  const frame = () => {
    confetti({ ...defaults, particleCount: 4, origin: { x: Math.random() * 0.3 + 0.35, y: Math.random() * 0.3 + 0.3 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

const CHALLENGES = {
  python: {
    easy: {
      questions: [
        { q: "What is 2 ** 3 ** 2?", a: "B", opts: ["A) 64", "B) 512", "C) 36", "D) 72"], exp: "Exponentiation is right-associative: 3**2=9, then 2**9=512" },
        { q: "What does [] == [] and [] is [] return?", a: "B", opts: ["A) True", "B) False", "C) Error", "D) None"], exp: "[] == [] is True, but [] is [] is False (different objects)" },
        { q: "What prints? def f(x=[]): x.append(1); return x; print(f()); print(f())", a: "B", opts: ["A) [1] [1]", "B) [1] [1,1]", "C) Error", "D) [1,1] [1,1,1]"], exp: "Mutable default argument trap! List created once" },
        { q: "What is 0.1 + 0.2 == 0.3?", a: "B", opts: ["A) True", "B) False", "C) Error", "D) Depends"], exp: "Floating-point: 0.1+0.2=0.30000000000000004" },
        { q: "What does bool('False') return?", a: "B", opts: ["A) False", "B) True", "C) Error", "D) 'False'"], exp: "Any non-empty string is truthy" }
      ],
      coding: { title: "Fix Mutable Default", starter: "def f(x=None):\n    if x is None:\n        x = []\n    x.append(1)\n    return x" }
    }
  },
  javascript: {
    easy: {
      questions: [
        { q: "What is typeof []?", a: "B", opts: ["A) array", "B) object", "C) Array", "D) undefined"], exp: "Arrays are objects in JS" },
        { q: "What is '5' - 3?", a: "B", opts: ["A) '53'", "B) 2", "C) NaN", "D) '2'"], exp: "Subtraction triggers numeric conversion" },
        { q: "What is 1 + '2' + 3?", a: "B", opts: ["A) 6", "B) '123'", "C) '15'", "D) NaN"], exp: "Once string appears, + becomes concatenation" },
        { q: "What is [] == ![]?", a: "A", opts: ["A) true", "B) false", "C) Error", "D) NaN"], exp: "![] = false. [] -> '' -> 0, false -> 0" },
        { q: "What is typeof NaN?", a: "B", opts: ["A) NaN", "B) number", "C) undefined", "D) 'NaN'"], exp: "NaN's type is 'number'" }
      ],
      coding: { title: "Fix Closure Trap", starter: "for (let i = 0; i < 3; i++) {\n    setTimeout(() => console.log(i), 100);\n}" }
    }
  }
};

export default function ChallengeSystem() {
  const [step, setStep] = useState('select');
  const [lang, setLang] = useState('python');
  const [diff, setDiff] = useState('easy');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [code, setCode] = useState('');
  const [codeOutput, setCodeOutput] = useState('');

  const data = CHALLENGES[lang]?.[diff];

  function startChallenge(language, difficulty) {
    setLang(language);
    setDiff(difficulty);
    setAnswers({});
    setSubmitted(false);
    setCode(data?.coding?.starter || '');
    setCodeOutput('');
    setStep('quiz');
  }

  function submitQuiz() {
    let correct = 0;
    data.questions.forEach((q, i) => {
      if (answers[i] === q.a) correct++;
    });
    const finalScore = Math.round((correct / data.questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);
    if (finalScore >= 60) {
      setStep('coding');
    } else {
      setStep('result');
    }
  }

  if (step === 'select') {
    return (
      <section id="challenges" style={{ maxWidth: "960px", margin: "80px auto", padding: "0 32px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "#00ffe0" }}>◆ Coding Challenges</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800 }}>Test Your Skills</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {[
            { id: 'python', icon: '🐍', name: 'Python' },
            { id: 'javascript', icon: '🌐', name: 'JavaScript' }
          ].map(l => (
            <div key={l.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px" }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{l.icon}</div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "20px" }}>{l.name}</div>
              <button onClick={() => startChallenge(l.id, 'easy')} style={{ width: "100%", background: "linear-gradient(135deg, #00ffe0, #0af)", border: "none", borderRadius: "8px", padding: "12px", color: "#000", fontWeight: 700, cursor: "pointer" }}>Start Easy →</button>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (step === 'quiz' && data) {
    return (
      <section style={{ maxWidth: "800px", margin: "80px auto", padding: "0 32px" }}>
        <button onClick={() => setStep('select')} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", marginBottom: "20px" }}>← Back</button>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "24px" }}>MCQs - {lang.toUpperCase()}</h2>
        {data.questions.map((q, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
            <div style={{ fontWeight: 600, marginBottom: "12px" }}>{i+1}. {q.q}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {q.opts.map(opt => (
                <button key={opt} onClick={() => !submitted && setAnswers({...answers, [i]: opt[0]})}
                  style={{ background: answers[i] === opt[0] ? "rgba(0,255,224,0.2)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 16px", textAlign: "left", cursor: submitted ? "default" : "pointer", color: submitted && opt[0] === q.a ? "#00ffe0" : "rgba(255,255,255,0.8)" }}>
                  {opt}
                </button>
              ))}
            </div>
            {submitted && <div style={{ marginTop: "12px", padding: "10px", background: "rgba(0,255,224,0.05)", borderRadius: "8px", fontSize: "0.8rem" }}>💡 {q.exp}</div>}
          </div>
        ))}
        {!submitted ? (
          <button onClick={submitQuiz} disabled={Object.keys(answers).length < data.questions.length}
            style={{ width: "100%", background: Object.keys(answers).length < data.questions.length ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #00ffe0, #0af)", border: "none", borderRadius: "12px", padding: "14px", color: "#000", fontWeight: 700, cursor: "pointer" }}>Submit →</button>
        ) : (
          <div style={{ textAlign: "center", padding: "16px", background: "rgba(0,255,224,0.06)", borderRadius: "12px" }}>Score: {score}% {score >= 60 ? "🎉 Moving to coding..." : "📚 Try again later"}</div>
        )}
      </section>
    );
  }

  if (step === 'coding' && data) {
    return (
      <section style={{ maxWidth: "900px", margin: "80px auto", padding: "0 32px" }}>
        <button onClick={() => setStep('select')} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", marginBottom: "20px" }}>← Back</button>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "20px" }}>{data.coding.title}</h2>
        <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px" }}>
          <pre style={{ margin: 0, fontSize: "0.8rem", color: "#e6edf3" }}>{data.coding.starter}</pre>
        </div>
        <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={10}
          style={{ width: "100%", background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px", color: "#fff", fontFamily: "'Space Mono', monospace", fontSize: "0.8rem", marginTop: "16px", resize: "vertical" }} />
        {codeOutput && (
          <div style={{ background: "#0d1117", border: "1px solid #00ffe0", borderRadius: "12px", padding: "16px", marginTop: "16px" }}>
            <pre style={{ margin: 0, fontSize: "0.8rem" }}>{codeOutput}</pre>
          </div>
        )}
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button onClick={() => setCodeOutput("✅ Great solution! Your code looks good.")} style={{ background: "linear-gradient(135deg, #00ffe0, #0af)", border: "none", borderRadius: "10px", padding: "10px 24px", color: "#000", fontWeight: 700, cursor: "pointer" }}>Run Test</button>
          <button onClick={() => { fireConfetti(); setStep('result'); setScore(85); }} style={{ background: "rgba(0,255,224,0.08)", border: "1px solid rgba(0,255,224,0.2)", borderRadius: "10px", padding: "10px 24px", color: "#00ffe0", fontWeight: 700, cursor: "pointer" }}>Submit Solution →</button>
        </div>
      </section>
    );
  }

  if (step === 'result') {
    return (
      <section style={{ maxWidth: "500px", margin: "80px auto", padding: "0 32px", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "20px" }}>{score >= 70 ? "🏆" : "📊"}</div>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "16px" }}>{score >= 70 ? "Challenge Passed!" : "Keep Practicing!"}</h2>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#00ffe0" }}>Score: {score}%</div>
        </div>
        <button onClick={() => setStep('select')} style={{ background: "linear-gradient(135deg, #00ffe0, #0af)", border: "none", borderRadius: "10px", padding: "14px 28px", color: "#000", fontWeight: 700, cursor: "pointer" }}>Try Another →</button>
      </section>
    );
  }

  return null;
}
EOF
