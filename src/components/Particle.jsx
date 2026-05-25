// src/components/Particle.jsx
export default function Particle({ style }) {
  return (
    <div style={{
      position: 'absolute',
      borderRadius: '50%',
      background: 'rgba(0,255,224,0.15)',
      animation: 'float linear infinite',
      ...style,
    }} />
  );
}
