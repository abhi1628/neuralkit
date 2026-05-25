// src/components/TryExample.jsx
export default function TryExample({ onFill, exampleMap, toolId }) {
  const example = exampleMap?.[toolId];
  if (!example) return null;
  return (
    <button className="try-example-btn" onClick={() => onFill(example)} aria-label="Load example">
      ✦ Try an example
    </button>
  );
}
