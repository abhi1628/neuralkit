// src/components/RoadmapGraph.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../ThemeContext';
import { getTopicById } from '../data/roadmaps';

export default function RoadmapGraph({ roadmap, completedTopics = [], onTopicClick, highlightedTopic = null }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = isDark ? '#a78bfa' : '#7c3aed';
  const acDim = isDark ? 'rgba(167,139,250,0.3)' : 'rgba(124,58,237,0.3)';
  
  const svgRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Build node positions based on phases
  const nodes = [];
  const nodeMap = {};
  
  roadmap.phases.forEach((phase, phaseIndex) => {
    const topicsCount = phase.topics.length;
    const y = 80 + phaseIndex * 140; // Vertical spacing between phases
    
    phase.topics.forEach((topic, topicIndex) => {
      // Spread topics horizontally within phase
      const spread = Math.min(topicsCount * 120, 800);
      const startX = 400 - spread / 2;
      const x = startX + (topicIndex / Math.max(topicsCount - 1, 1)) * spread;
      
      const node = {
        id: topic.id,
        x,
        y,
        label: topic.name.split('—')[0].trim(),
        fullLabel: topic.name,
        phaseId: phase.phaseId,
        phaseIndex,
        icon: phase.icon
      };
      nodes.push(node);
      nodeMap[topic.id] = node;
    });
  });

  // Build edges from dependencies
  const edges = [];
  if (roadmap.dependencies) {
    roadmap.dependencies.forEach(dep => {
      const fromNode = nodeMap[dep.from];
      const toNode = nodeMap[dep.to];
      if (fromNode && toNode) {
        edges.push({
          from: fromNode,
          to: toNode,
          label: dep.label || 'required for'
        });
      }
    });
  }

  // Check if a node is unlocked (all prerequisites completed)
  const isUnlocked = (nodeId) => {
    const prereqs = edges.filter(e => e.to.id === nodeId);
    if (prereqs.length === 0) return true;
    return prereqs.every(e => completedTopics.includes(e.from.id));
  };

  const isCompleted = (nodeId) => completedTopics.includes(nodeId);

  const getNodeColor = (nodeId) => {
    if (highlightedTopic === nodeId) return '#22c55e'; // Green for highlighted
    if (isCompleted(nodeId)) return ac;
    if (isUnlocked(nodeId)) return isDark ? 'rgba(167,139,250,0.6)' : 'rgba(124,58,237,0.6)';
    return isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
  };

  const getNodeRadius = (nodeId) => {
    if (hoveredNode === nodeId) return 28;
    if (highlightedTopic === nodeId) return 26;
    return 22;
  };

  // Handle mouse events for pan/zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.3, Math.min(3, z * delta)));
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.target.tagName === 'circle') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
    if (hoveredNode) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    }
  }, [isDragging, dragStart, hoveredNode]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Reset view
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Auto-fit on mount
  useEffect(() => {
    resetView();
  }, [roadmap.slug]);

  // Get tooltip content
  const getTooltipContent = (nodeId) => {
    const node = nodeMap[nodeId];
    if (!node) return null;
    
    const topic = getTopicById(roadmap, nodeId);
    const prereqs = edges.filter(e => e.to.id === nodeId).map(e => e.from.label);
    const unlocks = edges.filter(e => e.from.id === nodeId).map(e => e.to.label);
    
    return {
      title: topic?.name || node.fullLabel,
      phase: topic?.phaseTitle || '',
      status: isCompleted(nodeId) ? '✓ Completed' : isUnlocked(nodeId) ? '◉ Ready to learn' : '○ Locked',
      prereqs: prereqs.length > 0 ? prereqs : ['None (foundation topic)'],
      unlocks: unlocks.length > 0 ? unlocks : ['End of path']
    };
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px', overflow: 'hidden', borderRadius: '16px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)'}` }}>
      {/* Controls */}
      <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, display: 'flex', gap: '6px' }}>
        <button onClick={() => setZoom(z => Math.min(3, z * 1.2))} style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)', color: isDark ? '#fff' : '#1a1a1a', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        <button onClick={() => setZoom(z => Math.max(0.3, z * 0.8))} style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)', color: isDark ? '#fff' : '#1a1a1a', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        <button onClick={resetView} style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)', color: isDark ? '#fff' : '#1a1a1a', cursor: 'pointer', fontSize: '0.7rem', fontFamily: "'Space Mono',monospace", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⟲</button>
      </div>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: '12px', left: '12px', zIndex: 10, background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)', padding: '10px 14px', borderRadius: '10px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, backdropFilter: 'blur(8px)' }}>
        <div style={{ fontSize: '0.6rem', fontFamily: "'Space Mono',monospace", color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Legend</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: ac }}></span>
            <span style={{ fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>Completed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: isDark ? 'rgba(167,139,250,0.6)' : 'rgba(124,58,237,0.6)' }}></span>
            <span style={{ fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>Ready to learn</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}></span>
            <span style={{ fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>Locked (needs prerequisites)</span>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      {completedTopics.length > 0 && (
        <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)', padding: '8px 14px', borderRadius: '10px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, backdropFilter: 'blur(8px)' }}>
          <div style={{ fontSize: '0.7rem', fontFamily: "'Space Mono',monospace", color: ac }}>
            {completedTopics.length} / {nodes.length} topics completed
          </div>
          <div style={{ width: '120px', height: '4px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${(completedTopics.length / nodes.length) * 100}%`, height: '100%', background: ac, borderRadius: '2px', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>
      )}

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 800 500"
        style={{ cursor: isDragging ? 'grabbing' : 'grab', background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Phase labels */}
          {roadmap.phases.map((phase, i) => (
            <text
              key={phase.phaseId}
              x="20"
              y={80 + i * 140 - 35}
              fill={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'}
              fontSize="11"
              fontFamily="'Space Mono', monospace"
              fontWeight="600"
            >
              {phase.icon} {phase.title.split(':')[0]}
            </text>
          ))}

          {/* Edges */}
          {edges.map((edge, i) => {
            const isActive = isCompleted(edge.from.id) && (isCompleted(edge.to.id) || isUnlocked(edge.to.id));
            return (
              <g key={`edge-${i}`}>
                <line
                  x1={edge.from.x}
                  y1={edge.from.y}
                  x2={edge.to.x}
                  y2={edge.to.y}
                  stroke={isActive ? acDim : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                  strokeWidth={isActive ? 2 : 1}
                  strokeDasharray={edge.label === 'helps with' ? '4,4' : 'none'}
                />
                {/* Arrowhead */}
                {isActive && (
                  <polygon
                    points={`${edge.to.x - 6},${edge.to.y - 6} ${edge.to.x + 6},${edge.to.y - 6} ${edge.to.x},${edge.to.y + 4}`}
                    fill={acDim}
                    transform={`rotate(${Math.atan2(edge.to.y - edge.from.y, edge.to.x - edge.from.x) * 180 / Math.PI - 90}, ${edge.to.x}, ${edge.to.y})`}
                  />
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const color = getNodeColor(node.id);
            const radius = getNodeRadius(node.id);
            const unlocked = isUnlocked(node.id);
            
            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onTopicClick?.(node.id, node.phaseId);
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow effect for highlighted */}
                {highlightedTopic === node.id && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 8}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    opacity="0.4"
                  >
                    <animate attributeName="r" values={`${radius + 4};${radius + 12};${radius + 4}`} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                
                {/* Main circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill={isDark ? 'rgba(20,20,25,0.9)' : 'rgba(255,255,255,0.95)'}
                  stroke={color}
                  strokeWidth={hoveredNode === node.id ? 3 : 2}
                />
                
                {/* Inner fill for completed */}
                {isCompleted(node.id) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius - 6}
                    fill={ac}
                    opacity="0.3"
                  />
                )}
                
                {/* Checkmark for completed */}
                {isCompleted(node.id) && (
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fill={ac}
                    fontSize="14"
                    fontWeight="bold"
                  >
                    ✓
                  </text>
                )}
                
                {/* Lock icon for locked */}
                {!unlocked && !isCompleted(node.id) && (
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fill={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                    fontSize="12"
                  >
                    🔒
                  </text>
                )}
                
                {/* Label */}
                <text
                  x={node.x}
                  y={node.y + radius + 14}
                  textAnchor="middle"
                  fill={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'}
                  fontSize="9"
                  fontFamily="'DM Sans', sans-serif"
                  fontWeight="500"
                >
                  {node.label.length > 16 ? node.label.slice(0, 14) + '...' : node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredNode && (() => {
        const content = getTooltipContent(hoveredNode);
        if (!content) return null;
        
        return (
          <div style={{
            position: 'absolute',
            left: Math.min(tooltipPos.x + 20, 600),
            top: Math.max(tooltipPos.y - 10, 10),
            background: isDark ? 'rgba(20,20,25,0.95)' : 'rgba(255,255,255,0.95)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '12px',
            padding: '14px 16px',
            maxWidth: '280px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)',
            zIndex: 20,
            pointerEvents: 'none'
          }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '0.85rem', color: isDark ? '#fff' : '#1a1a1a', marginBottom: '4px' }}>
              {content.title.split('—')[0]}
            </div>
            <div style={{ fontSize: '0.65rem', color: ac, fontFamily: "'Space Mono',monospace", marginBottom: '8px' }}>
              {content.phase}
            </div>
            <div style={{ fontSize: '0.72rem', color: isCompleted(hoveredNode) ? '#22c55e' : isUnlocked(hoveredNode) ? ac : isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginBottom: '8px', fontWeight: 600 }}>
              {content.status}
            </div>
            <div style={{ fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600 }}>Prerequisites:</span> {content.prereqs.slice(0, 3).join(', ')}{content.prereqs.length > 3 ? ` +${content.prereqs.length - 3} more` : ''}
            </div>
            <div style={{ fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
              <span style={{ fontWeight: 600 }}>Unlocks:</span> {content.unlocks.slice(0, 3).join(', ')}{content.unlocks.length > 3 ? ` +${content.unlocks.length - 3} more` : ''}
            </div>
            <div style={{ marginTop: '8px', fontSize: '0.6rem', color: ac, fontFamily: "'Space Mono',monospace" }}>
              Click to jump to topic →
            </div>
          </div>
        );
      })()}
    </div>
  );
}
