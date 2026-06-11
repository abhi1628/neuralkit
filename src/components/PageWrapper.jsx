// src/components/PageWrapper.jsx
// Wraps any page with ChatWidget — add once, works everywhere

import ChatWidget from './ChatWidget';

export default function PageWrapper({ children }) {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
}
