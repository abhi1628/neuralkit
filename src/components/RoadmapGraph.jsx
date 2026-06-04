// src/components/RoadmapGraph.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../ThemeContext';
import { getTopicById } from '../data/roadmaps';

export default function RoadmapGraph({ roadmap, completedTopics = [], onTopicClick, highlightedTopic = null }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = isDark ? '#a78bfa' : '#7c3aed';
  
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Canvas dimensions - taller to fit all phases
  const SVG_WIDTH = 1100;
  const SVG_HEIGHT = 750;
  const NODE_RADIUS = 22;
  const PHASE_HEIGHT = 95;
  const TOP_MARGIN = 45;
  const LEFT_MARGIN = 110;
  const RIGHT_MARGIN = 40;
  
  // Build node positions
  const nodes = [];
  const nodeMap = {};
  
  const usableWidth = SVG_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;
  
  roadmap.phases.forEach((phase, phaseIndex) => {
    const topicsCount = phase.topics.length;
    const y = TOP_MARGIN + phaseIndex * PHASE_HEIGHT;
    
    // Spread topics across usable width
    const gap = topicsCount > 1 ? usableWidth / (topicsCount - 1) : 0;
    const startX = topicsCount === 1 ? SVG_WIDTH / 2 : LEFT_MARGIN;
    
    phase.topics.forEach((topic, topicIndex) => {
      const x = topicsCount === 1 
        ? startX 
        : startX + topicIndex * gap;
      
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

  // Build edges
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

  const isUnlocked = (nodeId) => {
    const prereqs = edges.filter(e => e.to.id === nodeId);
    if (prereqs.length === 0) return true;
    return prereqs.every(e => completedTopics.includes(e.from.id));
  };

  const isCompleted = (nodeId) => completedTopics.includes(nodeId);

  // Handle mouse events
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.3, Math.min(2.5, z * delta)));
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.target.tagName === 'circle' || e.target.tagName === 'text') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
    if (hoveredNode) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltipPos({ 
          x: e.clientX - rect.left, 
          y: e.clientY - rect.top 
        });
      }
    }
  }, [isDragging, dragStart, hoveredNode]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    resetView();
  }, [roadmap.slug]);

  // Calculate arrow path with proper offset
  const getArrowPoints = (from, to) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist === 0) return null;
    
    const offset = NODE_RADIUS + 4;
    const startX = from.x + (dx / dist) * offset;
    const startY = from.y + (dy / dist) * offset;
    const endX = to.x - (dx / dist) * (offset + 8);
    const endY = to.y - (dy / dist) * (offset + 8);
    
    return { startX, startY, endX, endY, angle: Math.atan2(dy, dx) };
  };

  const getTooltipContent = (nodeId) => {
    const node = nodeMap[nodeId];
    if (!node) return null;
    
    const prereqs = edges.filter(e => e.to.id === nodeId).map(e => ({
      label: e.from.label,
      completed: completedTopics.includes(e.from.id)
    }));
    const unlocks = edges.filter(e => e.from.id === nodeId).map(e => e.to.label);
    
    return {
      title: node.fullLabel,
      phase: node.phaseTitle,
      status: isCompleted(nodeId) ? '✓ Completed' : isUnlocked(nodeId) ? '◉ Ready to learn' : '○ Locked',
      prereqs,
      unlocks
    };
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '580px', 
        overflow: 'hidden', 
        borderRadius: '16px', 
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
        background: isDark ? '#0f0f14' : '#fafafa'
      }}
    >
      {/* Top Bar - Controls & Progress */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 10, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        background: isDark ? 'rgba(15,15,20,0.9)' : 'rgba(250,250,250,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ 
            fontSize: '0.65rem', 
            fontFamily: "'Space Mono',monospace", 
            color: ac,
            fontWeight: 600
          }}>
            {completedTopics.length} / {nodes.length} done
          </span>
          <div style={{ 
            width: '100px', 
            height: '4px', 
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', 
            borderRadius: '2px', 
            overflow: 'hidden' 
          }}>
            <div style={{ 
              width: `${nodes.length > 0 ? (completedTopics.length / nodes.length) * 100 : 0}%`, 
              height: '100%', 
              background: ac, 
              borderRadius: '2px', 
              transition: 'width 0.3s ease' 
            }}></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '0.6rem', 
            color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)', 
            fontFamily: "'Space Mono',monospace", 
            marginRight: '4px' 
          }}>
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={() => setZoom(z => Math.min(2.5, z * 1.2))} style={{ 
            width: '26px', 
            height: '26px', 
            borderRadius: '6px', 
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`, 
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
            color: isDark ? '#fff' : '#1a1a1a', 
            cursor: 'pointer', 
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>+</button>
          <button onClick={() => setZoom(z => Math.max(0.3, z * 0.8))} style={{ 
            width: '26px', 
            height: '26px', 
            borderRadius: '6px', 
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`, 
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
            color: isDark ? '#fff' : '#1a1a1a', 
            cursor: 'pointer', 
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>−</button>
          <button onClick={resetView} style={{ 
            width: '26px', 
            height: '26px', 
            borderRadius: '6px', 
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`, 
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

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          marginTop: '46px'
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          {/* Arrow marker for active edges */}
          <marker 
            id="arrow-active" 
            markerWidth="10" 
            markerHeight="10" 
            refX="9" 
            refY="5" 
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,10 L9,5 z" fill={ac} />
          </marker>
          {/* Arrow marker for dim edges */}
          <marker 
            id="arrow-dim" 
            markerWidth="8" 
            markerHeight="8" 
            refX="7" 
            refY="4" 
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,8 L7,4 z" fill={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'} />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Phase labels on the left */}
          {roadmap.phases.map((phase, i) => (
            <g key={`phase-label-${i}`}>
              <text
                x="15"
                y={TOP_MARGIN + i * PHASE_HEIGHT + 5}
                fill={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'}
                fontSize="11"
                fontFamily="'Space Mono', monospace"
                fontWeight="600"
                textAnchor="start"
              >
                {phase.icon}
              </text>
              <text
                x="35"
                y={TOP_MARGIN + i * PHASE_HEIGHT + 5}
                fill={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
                fontSize="10"
                fontFamily="'Space Mono', monospace"
                fontWeight="500"
                textAnchor="start"
              >
                {phase.title.split(':')[0].replace('Phase ', 'P')}
              </text>
              {/* Phase separator line */}
              {i < roadmap.phases.length - 1 && (
                <line
                  x1="10"
                  y1={TOP_MARGIN + i * PHASE_HEIGHT + PHASE_HEIGHT / 2}
                  x2={SVG_WIDTH - 10}
                  y2={TOP_MARGIN + i * PHASE_HEIGHT + PHASE_HEIGHT / 2}
                  stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              )}
            </g>
          ))}

          {/* Edges - drawn BEFORE nodes so they appear behind */}
          {edges.map((edge, i) => {
            const points = getArrowPoints(edge.from, edge.to);
            if (!points) return null;
            
            const isActive = completedTopics.includes(edge.from.id) && 
              (completedTopics.includes(edge.to.id) || isUnlocked(edge.to.id));
            
            return (
              <g key={`edge-${i}`}>
                <line
                  x1={points.startX}
                  y1={points.startY}
                  x2={points.endX}
                  y2={points.endY}
                  stroke={isActive ? ac : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}
                  strokeWidth={isActive ? 2 : 1.5}
                  strokeDasharray={edge.label === 'helps with' ? '4,3' : 'none'}
                  markerEnd={isActive ? 'url(#arrow-active)' : 'url(#arrow-dim)'}
                  opacity={isActive ? 0.8 : 0.5}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const completed = isCompleted(node.id);
            const unlocked = isUnlocked(node.id);
            const locked = !completed && !unlocked;
            const isHighlighted = highlightedTopic === node.id;
            const isHovered = hoveredNode === node.id;
            
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
                {/* Highlight ring */}
                {isHighlighted && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS + 8}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    opacity="0.5"
                  >
                    <animate 
                      attributeName="r" 
                      values={`${NODE_RADIUS + 6};${NODE_RADIUS + 12};${NODE_RADIUS + 6}`} 
                      dur="1.5s" 
                      repeatCount="indefinite" 
                    />
                    <animate 
                      attributeName="opacity" 
                      values="0.6;0.2;0.6" 
                      dur="1.5s" 
                      repeatCount="indefinite" 
                    />
                  </circle>
                )}
                
                {/* Hover ring */}
                {isHovered && !isHighlighted && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS + 5}
                    fill="none"
                    stroke={ac}
                    strokeWidth="1.5"
                    opacity="0.4"
                  />
                )}
                
                {/* Main circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill={completed 
                    ? (isDark ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.12)') 
                    : unlocked 
                      ? (isDark ? 'rgba(167,139,250,0.08)' : 'rgba(124,58,237,0.06)')
                      : (isDark ? 'rgba(40,40,50,0.9)' : 'rgba(245,245,250,0.95)')
                  }
                  stroke={completed 
                    ? ac 
                    : unlocked 
                      ? (isDark ? 'rgba(167,139,250,0.7)' : 'rgba(124,58,237,0.7)')
                      : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)')
                  }
                  strokeWidth={completed ? 2.5 : isHovered ? 2.5 : 2}
                />
                
                {/* Inner status indicator */}
                {completed && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS - 7}
                    fill={ac}
                    opacity="0.6"
                  />
                )}
                
                {/* Center icon/text */}
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fill={completed 
                    ? '#fff' 
                    : locked 
                      ? (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)')
                      : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)')
                  }
                  fontSize={completed ? '14' : locked ? '13' : '12'}
                  fontWeight={completed ? 'bold' : 'normal'}
                >
                  {completed ? '✓' : locked ? '🔒' : '○'}
                </text>
                
                {/* Label below node */}
                <text
                  x={node.x}
                  y={node.y + NODE_RADIUS + 16}
                  textAnchor="middle"
                  fill={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)'}
                  fontSize="9.5"
                  fontFamily="'DM Sans', sans-serif"
                  fontWeight="500"
                >
                  {node.label.length > 16 ? node.label.slice(0, 14) + '..' : node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Bottom Info Bar */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 14px',
        background: isDark ? 'rgba(15,15,20,0.9)' : 'rgba(250,250,250,0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`
      }}>
        {/* Legend */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '0.6rem', 
            fontFamily: "'Space Mono',monospace", 
            color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em' 
          }}>
            Legend
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: ac,
              display: 'inline-block' 
            }}></span>
            <span style={{ 
              fontSize: '0.68rem', 
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)' 
            }}>Done</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: isDark ? 'rgba(167,139,250,0.6)' : 'rgba(124,58,237,0.6)',
              display: 'inline-block' 
            }}></span>
            <span style={{ 
              fontSize: '0.68rem', 
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)' 
            }}>Ready</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              display: 'inline-block' 
            }}></span>
            <span style={{ 
              fontSize: '0.68rem', 
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)' 
            }}>Locked</span>
          </div>
        </div>

        {/* Hint */}
        <span style={{ 
          fontSize: '0.6rem', 
          color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)', 
          fontFamily: "'Space Mono',monospace" 
        }}>
          Scroll to zoom · Drag to pan · Click nodes
        </span>
      </div>

      {/* Tooltip */}
      {hoveredNode && (() => {
        const content = getTooltipContent(hoveredNode);
        if (!content) return null;
        
        const tooltipWidth = 240;
        let left = tooltipPos.x + 16;
        let top = tooltipPos.y - 10;
        
        // Prevent tooltip from going off right edge
        if (containerRef.current && left + tooltipWidth > containerRef.current.offsetWidth) {
          left = tooltipPos.x - tooltipWidth - 16;
        }
        
        return (
          <div style={{
            position: 'absolute',
            left: Math.max(10, left),
            top: Math.max(50, top),
            background: isDark ? 'rgba(20,20,28,0.97)' : 'rgba(255,255,255,0.97)',
            border: `1px solid ${isDark ? 'rgba(167,139,250,0.25)' : 'rgba(124,58,237,0.2)'}`,
            borderRadius: '12px',
            padding: '14px 16px',
            width: `${tooltipWidth}px`,
            boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)',
            zIndex: 30,
            pointerEvents: 'none'
          }}>
            <div style={{ 
              fontFamily: "'Syne',sans-serif", 
              fontWeight: 700, 
              fontSize: '0.85rem', 
              color: isDark ? '#fff' : '#1a1a1a', 
              marginBottom: '3px',
              lineHeight: 1.3
            }}>
              {content.title.split('—')[0]}
            </div>
            <div style={{ 
              fontSize: '0.65rem', 
              color: ac, 
              fontFamily: "'Space Mono',monospace", 
              marginBottom: '10px' 
            }}>
              {content.phase}
            </div>
            
            <div style={{ 
              fontSize: '0.72rem', 
              color: isCompleted(hoveredNode) ? '#22c55e' : isUnlocked(hoveredNode) ? ac : isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', 
              marginBottom: '10px', 
              fontWeight: 600, 
              fontFamily: "'Space Mono',monospace" 
            }}>
              {content.status}
            </div>
            
            {content.prereqs.length > 0 && content.prereqs[0].label !== 'None (foundation topic)' && (
              <div style={{ marginBottom: '6px' }}>
                <div style={{ 
                  fontSize: '0.6rem', 
                  color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', 
                  fontWeight: 600,
                  marginBottom: '3px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Prerequisites
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {content.prereqs.slice(0, 3).map((p, i) => (
                    <span key={i} style={{
                      fontSize: '0.65rem',
                      color: p.completed ? '#22c55e' : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                      background: p.completed ? (isDark ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.08)') : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontFamily: "'Space Mono',monospace"
                    }}>
                      {p.completed ? '✓ ' : ''}{p.label}
                    </span>
                  ))}
                  {content.prereqs.length > 3 && (
                    <span style={{ fontSize: '0.65rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>
                      +{content.prereqs.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {content.unlocks.length > 0 && content.unlocks[0] !== 'End of path' && (
              <div>
                <div style={{ 
                  fontSize: '0.6rem', 
                  color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', 
                  fontWeight: 600,
                  marginBottom: '3px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Unlocks
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {content.unlocks.slice(0, 3).map((u, i) => (
                    <span key={i} style={{
                      fontSize: '0.65rem',
                      color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                      background: isDark ? 'rgba(167,139,250,0.08)' : 'rgba(124,58,237,0.06)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontFamily: "'Space Mono',monospace"
                    }}>
                      {u}
                    </span>
                  ))}
                  {content.unlocks.length > 3 && (
                    <span style={{ fontSize: '0.65rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>
                      +{content.unlocks.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div style={{ 
              marginTop: '10px', 
              fontSize: '0.6rem', 
              color: ac, 
              fontFamily: "'Space Mono',monospace",
              opacity: 0.8
            }}>
              Click to view in list →
            </div>
          </div>
        );
      })()}
    </div>
  );
}
