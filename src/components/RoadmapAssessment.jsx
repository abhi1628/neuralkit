// src/components/RoadmapAssessment.jsx
import { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { trackEvent } from '../utils';

export default function RoadmapAssessment({ roadmap, onComplete }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = isDark ? '#a78bfa' : '#7c3aed';
  
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const questions = roadmap.assessment || [];
  
  if (questions.length === 0) {
    onComplete?.([]);
    return null;
  }

  const handleAnswer = (questionId, knowsIt) => {
    const newAnswers = { ...answers, [questionId]: knowsIt };
    setAnswers(newAnswers);
    
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResults(true);
      calculateResults(newAnswers);
    }
  };

  const calculateResults = (finalAnswers) => {
    const topicsToSkip = new Set();
    let hoursSaved = 0;
    
    questions.forEach(q => {
      if (finalAnswers[q.id]) {
        q.skipIfYes.forEach(topicId => topicsToSkip.add(topicId));
        hoursSaved += q.estimatedHoursSaved;
      }
    });
    
    const skipList = Array.from(topicsToSkip);
    trackEvent('roadmap_assessment_complete', { 
      roadmap: roadmap.slug, 
      skipped: skipList.length, 
      hoursSaved 
    });
    
    onComplete?.(skipList, hoursSaved);
  };

  const reset = () => {
    setCurrentQ(0);
    setAnswers({});
    setShowResults(false);
  };

  const progress = ((currentQ) / questions.length) * 100;

  if (showResults) {
    const skippedCount = Object.values(answers).filter(Boolean).length;
    const totalHoursSaved = questions.reduce((sum, q) => answers[q.id] ? sum + q.estimatedHoursSaved : sum, 0);
    const skippedTopics = new Set();
    questions.forEach(q => {
      if (answers[q.id]) q.skipIfYes.forEach(t => skippedTopics.add(t));
    });

    return (
      <div style={{
        background: isDark ? 'rgba(167,139,250,0.05)' : 'rgba(124,58,237,0.04)',
        border: `1px solid ${isDark ? 'rgba(167,139,250,0.15)' : 'rgba(124,58,237,0.12)'}`,
        borderRadius: '16px',
        padding: '28px',
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎯</div>
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '1.2rem', color: isDark ? '#fff' : '#1a1a1a', marginBottom: '8px' }}>
          Your Personalized Path Ready
        </h3>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Based on your experience, we've tailored this roadmap for you.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            borderRadius: '12px',
            padding: '16px 24px',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: ac, fontFamily: "'Syne',sans-serif" }}>
              {skippedTopics.size}
            </div>
            <div style={{ fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontFamily: "'Space Mono',monospace", marginTop: '4px' }}>
              Topics Skipped
            </div>
          </div>
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            borderRadius: '12px',
            padding: '16px 24px',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22c55e', fontFamily: "'Syne',sans-serif" }}>
              {totalHoursSaved}h
            </div>
            <div style={{ fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontFamily: "'Space Mono',monospace", marginTop: '4px' }}>
              Hours Saved
            </div>
          </div>
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            borderRadius: '12px',
            padding: '16px 24px',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: isDark ? '#fff' : '#1a1a1a', fontFamily: "'Syne',sans-serif" }}>
              {roadmap.estimatedHours - totalHoursSaved}h
            </div>
            <div style={{ fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontFamily: "'Space Mono',monospace", marginTop: '4px' }}>
              Your Estimate
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => onComplete?.(Array.from(skippedTopics), totalHoursSaved)}
            style={{
              background: `linear-gradient(135deg, ${ac}, ${isDark ? '#818cf8' : '#4f46e5'})`,
              border: 'none',
              borderRadius: '10px',
              padding: '12px 28px',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: "'Space Mono',monospace"
            }}
          >
            View My Roadmap →
          </button>
          <button
            onClick={reset}
            style={{
              background: 'transparent',
              border: `1px solid ${ac}`,
              borderRadius: '10px',
              padding: '12px 24px',
              color: ac,
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: "'Space Mono',monospace'
            }}
          >
            Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div style={{
      background: isDark ? 'rgba(167,139,250,0.05)' : 'rgba(124,58,237,0.04)',
      border: `1px solid ${isDark ? 'rgba(167,139,250,0.15)' : 'rgba(124,58,237,0.12)'}`,
      borderRadius: '16px',
      padding: '28px',
      marginBottom: '32px'
    }}>
      {/* Progress bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.65rem', fontFamily: "'Space Mono',monospace", color: ac, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Skill Assessment
          </span>
          <span style={{ fontSize: '0.65rem', fontFamily: "'Space Mono',monospace", color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
            {currentQ + 1} / {questions.length}
          </span>
        </div>
        <div style={{ width: '100%', height: '4px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: ac, borderRadius: '2px', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '0.75rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontFamily: "'Space Mono',monospace", marginBottom: '12px' }}>
          Question {currentQ + 1}
        </div>
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '1.1rem', color: isDark ? '#fff' : '#1a1a1a', margin: 0, lineHeight: 1.5 }}>
          {q.question}
        </h3>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => handleAnswer(q.id, true)}
          style={{
            flex: 1,
            minWidth: '140px',
            background: isDark ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.08)',
            border: `1px solid ${isDark ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.25)'}`,
            borderRadius: '12px',
            padding: '16px 20px',
            color: '#22c55e',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontFamily: "'DM Sans',sans-serif",
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.15)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = isDark ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>✅</div>
          Yes, I know this
        </button>
        <button
          onClick={() => handleAnswer(q.id, false)}
          style={{
            flex: 1,
            minWidth: '140px',
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '12px',
            padding: '16px 20px',
            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontFamily: "'DM Sans',sans-serif",
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>📚</div>
          No, teach me
        </button>
      </div>

      {currentQ > 0 && (
        <button
          onClick={() => setCurrentQ(currentQ - 1)}
          style={{
            marginTop: '16px',
            background: 'transparent',
            border: 'none',
            color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            fontFamily: "'Space Mono',monospace"
          }}
        >
          ← Back
        </button>
      )}
    </div>
  );
}
