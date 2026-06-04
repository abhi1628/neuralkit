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

  // SVG canvas dimensions
  const SVG_WIDTH = 1000;
  const SVG_HEIGHT = 600;
  const NODE_RADIUS = 24;
  const PHASE_HEIGHT = 110;
  const TOP_MARGIN = 50;
  
  // Build node positions based on phases
  const nodes = [];
  const nodeMap = {};
  
  roadmap.phases.forEach((phase, phaseIndex) => {
    const topicsCount = phase.topics.length;
    const y = TOP_MARGIN + phaseIndex * PHASE_HEIGHT;
    
    // Calculate spread based on topic count
    const minSpread = 200;
    const maxSpread = 900;
    const spread = Math.min(Math.max(topicsCount * 140, minSpread), maxSpread);
    const startX = (SVG_WIDTH - spread) / 2;
    
    phase.topics.forEach((topic, topicIndex) => {
      const x = topicsCount === 1 
        ? SVG_WIDTH / 2 
        : startX + (topicIndex / (topicsCount - 1)) * spread;
      
      const node = {
        id: topic.id,
        x,
        y,
        label: topic.name.split('—')[0].trim(),
        fullLabel: topic.name,
        phaseId: phase.phaseId,
        phaseIndex,
        phaseTitle: phase.title,
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
    if (highlightedTopic === nodeId) return '#22c55e';
    if (isCompleted(nodeId)) return ac;
    if (isUnlocked(nodeId)) return isDark ? 'rgba(167,139,250,0.6)' : 'rgba(124,58,237,0.6)';
    return isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';
  };

  const getNodeFill = (nodeId) => {
    if (isCompleted(nodeId)) return isDark ? 'rgba(167,139,250,0.15)' : 'rgba(124,58,237,0.1)';
    if (isUnlocked(nodeId)) return isDark ? 'rgba(167,139,250,0.08)' : 'rgba(124,58,237,0.05)';
    return isDark ? 'rgba(30,30,35,0.9)' : 'rgba(255,255,255,0.95)';
  };

  // Handle mouse events for pan/zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.4, Math.min(2.5, z * delta)));
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.target.tagName === 'circle' || e.target.closest('g')) return;
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
      phase: node.phaseTitle || '',
      status: isCompleted(nodeId) ? '✓ Completed' : isUnlocked(nodeId) ? '◉ Ready to learn' : '○ Locked',
      prereqs: prereqs.length > 0 ? prereqs : ['None (foundation topic)'],
      unlocks: unlocks.length > 0 ? unlocks : ['End of path']
    };
  };

  // Calculate arrow path
  const getArrowPath = (from, to) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const offset = NODE_RADIUS + 6;
    
    const startX = from.x + (dx / dist) * offset;
    const startY = from.y + (dy / dist) * offset;
    const endX = to.x - (dx / dist) * offset;
    const endY = to.y - (dy / dist) * offset;
    
    return { startX, startY, endX, endY };
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '520px', 
      overflow: 'hidden', 
      borderRadius: '16px', 
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)'}`,
      background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'
    }}>
      {/* Top Controls Bar */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 10, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 14px',
        background: isDark ? 'rgba(15,15,20,0.8)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
      }}>
        {/* Left: Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {completedTopics.length > 0 && (
            <>
              <div style={{ fontSize: '0.65rem', fontFamily: "'Space Mono',monospace", color: ac }}>
                {completedTopics.length} / {nodes.length} done
              </div>
              <div style={{ width: '80px', height: '4px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${(completedTopics.length / nodes.length) * 100}%`, 
                  height: '100%', 
                  background: ac, 
                  borderRadius: '2px', 
                  transition: 'width 0.3s ease' 
                }}></div>
              </div>
            </>
          )}
        </div>

        {/* Right: Zoom Controls */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.6rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', fontFamily: "'Space Mono',monospace", marginRight: '4px' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={() => setZoom(z => Math.min(2.5, z * 1.2))} style={{ 
            width: '28px', 
            height: '28px', 
            borderRadius: '6px', 
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, 
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
            color: isDark ? '#fff' : '#1a1a1a', 
            cursor: 'pointer', 
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>+</button>
          <button onClick={() => setZoom(z => Math.max(0.4, z * 0.8))} style={{ 
            width: '28px', 
            height: '28px', 
            borderRadius: '6px', 
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, 
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
            color: isDark ? '#fff' : '#1a1a1a', 
            cursor: 'pointer', 
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>−</button>
          <button onClick={resetView} style={{ 
            width: '28px', 
            height: '28px', 
            borderRadius: '6px', 
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, 
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
            color: isDark ? '#fff' : '#1a1a1a', 
            cursor: 'pointer', 
            fontSize: '0.7rem',
            fontFamily: "'Space Mono',monospace",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>⟲</button>
        </div>
      </div>

      {/* Bottom Legend */}
      <div style={{ 
        position: 'absolute', 
        bottom: '10px', 
        left: '10px', 
        zIndex: 10, 
        background: isDark ? 'rgba(15,15,20,0.85)' : 'rgba(255,255,255,0.95)', 
        padding: '8px 12px', 
        borderRadius: '8px', 
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, 
        backdropFilter: 'blur(8px)',
        display: 'flex',
        gap: '14px',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '0.6rem', fontFamily: "'Space Mono',monospace", color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '4px' }}>
          Legend
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: ac, display: 'inline-block' }}></span>
          <span style={{ fontSize: '0.68rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>Done</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: isDark ? 'rgba(167,139,250,0.6)' : 'rgba(124,58,237,0.6)', display: 'inline-block' }}></span>
          <span style={{ fontSize: '0.68rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>Ready</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', display: 'inline-block' }}></span>
          <span style={{ fontSize: '0.68rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>Locked</span>
        </div>
      </div>

      {/* Hint */}
      <div style={{ 
        position: 'absolute', 
        bottom: '10px', 
        right: '10px', 
        zIndex: 10,
        fontSize: '0.6rem', 
        color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)', 
        fontFamily: "'Space Mono',monospace"
      }}>
        Scroll to zoom · Drag to pan · Click nodes
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          marginTop: '44px' // Space for top bar
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={acDim} />
          </marker>
          <marker id="arrowhead-dim" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Phase background bands */}
          {roadmap.phases.map((phase, i) => (
            <rect
              key={`band-${i}`}
              x="0"
              y={TOP_MARGIN + i * PHASE_HEIGHT - 35}
              width={SVG_WIDTH}
              height={PHASE_HEIGHT}
              fill={i % 2 === 0 
                ? (isDark ? 'rgba(167,139,250,0.02)' : 'rgba(124,58,237,0.015)') 
                : 'transparent'
              }
              rx="8"
            />
          ))}

          {/* Phase labels */}
          {roadmap.phases.map((phase, i) => (
            <text
              key={`phase-${i}`}
              x="20"
              y={TOP_MARGIN + i * PHASE_HEIGHT - 12}
              fill={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'}
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
            const path = getArrowPath(edge.from, edge.to);
            
            return (
              <g key={`edge-${i}`}>
                <line
                  x1={path.startX}
                  y1={path.startY}
                  x2={path.endX}
                  y2={path.endY}
                  stroke={isActive ? acDim : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                  strokeWidth={isActive ? 2 : 1}
                  strokeDasharray={edge.label === 'helps with' ? '5,5' : 'none'}
                  markerEnd={isActive ? 'url(#arrowhead)' : 'url(#arrowhead-dim)'}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const color = getNodeColor(node.id);
            const fill = getNodeFill(node.id);
            const unlocked = isUnlocked(node.id);
            const completed = isCompleted(node.id);
            
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
                {/* Glow for highlighted */}
                {highlightedTopic === node.id && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS + 10}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    opacity="0.3"
                  >
                    <animate attributeName="r" values={`${NODE_RADIUS + 6};${NODE_RADIUS + 14};${NODE_RADIUS + 6}`} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                
                {/* Outer ring */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill={fill}
                  stroke={color}
                  strokeWidth={hoveredNode === node.id ? 3 : completed ? 2.5 : 2}
                />
                
                {/* Inner dot for completed */}
                {completed && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS - 8}
                    fill={ac}
                    opacity="0.4"
                  />
                )}
                
                {/* Icon inside */}
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fill={completed ? ac : !unlocked ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') : color}
                  fontSize="16"
                >
                  {completed ? '✓' : !unlocked ? '🔒' : node.icon || '●'}
                </text>
                
                {/* Label below */}
                <text
                  x={node.x}
                  y={node.y + NODE_RADIUS + 16}
                  textAnchor="middle"
                  fill={isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)'}
                  fontSize="10"
                  fontFamily="'DM Sans', sans-serif"
                  fontWeight="500"
                >
                  {node.label.length > 18 ? node.label.slice(0, 16) + '..' : node.label}
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
            left: Math.min(tooltipPos.x + 16, 500),
            top: Math.max(tooltipPos.y - 80, 50),
            background: isDark ? 'rgba(20,20,25,0.95)' : 'rgba(255,255,255,0.97)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '12px',
            padding: '14px 16px',
            maxWidth: '260px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(12px)',
            zIndex: 30,
            pointerEvents: 'none'
          }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '0.85rem', color: isDark ? '#fff' : '#1a1a1a', marginBottom: '3px' }}>
              {content.title.split('—')[0]}
            </div>
            <div style={{ fontSize: '0.65rem', color: ac, fontFamily: "'Space Mono',monospace", marginBottom: '8px' }}>
              {content.phase}
            </div>
            <div style={{ fontSize: '0.72rem', color: completedTopics.includes(hoveredNode) ? '#22c55e' : isUnlocked(hoveredNode) ? ac : isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginBottom: '8px', fontWeight: 600, fontFamily: "'Space Mono',monospace" }}>
              {content.status}
            </div>
            <div style={{ fontSize: '0.68rem', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600 }}>Needs:</span> {content.prereqs.slice(0, 2).join(', ')}{content.prereqs.length > 2 ? '...' : ''}
            </div>
            <div style={{ fontSize: '0.68rem', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600 }}>Unlocks:</span> {content.unlocks.slice(0, 2).join(', ')}{content.unlocks.length > 2 ? '...' : ''}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
