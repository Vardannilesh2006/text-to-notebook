import React from 'react';

export default function AIAssistant({ text, onFormatText }) {
  
  // 1. Clean spacing: Trim lines, replace multiple spaces, fix spacing around punctuation
  const cleanSpacing = () => {
    if (!text) return;
    
    let formatted = text
      .split('\n')
      .map(line => line.trim()) // Trim trailing/leading whitespace per line
      .join('\n');
      
    // Replace double spaces with a single space (while preserving line breaks)
    formatted = formatted.replace(/[ \t]+/g, ' ');
    
    // Fix punctuation spacing: comma, period, question mark, exclamation mark
    // E.g., "hello ,world" -> "hello, world" and "hello.world" -> "hello. world"
    formatted = formatted
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s*\.\s*/g, '. ')
      .replace(/\s*\?\s*/g, '? ')
      .replace(/\s*!\s*/g, '! ')
      .replace(/\s*:\s*/g, ': ')
      // Clean up spacing around double-quotes/parentheses
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .trim();

    onFormatText(formatted);
  };

  // 2. Fix capitalization: Capitalize first word of sentences and stand-alone 'i'
  const fixCapitalization = () => {
    if (!text) return;

    let formatted = text;

    // Capitalize sentence starts. Look for punctuation followed by a space and lowercase letter.
    // Also captures the very beginning of the string.
    formatted = formatted.replace(/(^\s*|[.!?]\s+)([a-z])/g, (match, p1, p2) => {
      return p1 + p2.toUpperCase();
    });

    // Capitalize standalone 'i' (e.g. "what can i do" -> "what can I do")
    formatted = formatted.replace(/\bi\b/g, 'I');

    onFormatText(formatted);
  };

  // 3. Format Assignment: Structure questions and answers neatly
  const formatAssignment = () => {
    if (!text) return;

    let lines = text.split('\n');
    let formattedLines = [];

    // Simple regex to detect Question and Answer identifiers
    const qRegex = /^(q(uestion)?\.?\s*\d*[:.-]?\s*)/i;
    const aRegex = /^(a(nswer)?\.?\s*\d*[:.-]?\s*)/i;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (line === '') {
        formattedLines.push('');
        continue;
      }

      if (qRegex.test(line)) {
        // Standardize Question prefix to "Q. " or "Question X: "
        line = line.replace(qRegex, (match) => {
          // Extract question number if any
          const numMatch = match.match(/\d+/);
          return numMatch ? `\nQuestion ${numMatch[0]}: ` : `\nQuestion: `;
        });
      } else if (aRegex.test(line)) {
        // Standardize Answer prefix to "Ans: "
        line = line.replace(aRegex, 'Ans: ');
      }

      formattedLines.push(line);
    }

    // Join and trim leading/trailing newlines
    let formatted = formattedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    onFormatText(formatted);
  };

  return (
    <div className="ai-assistant-bar">
      <button 
        className="btn btn-ai" 
        onClick={cleanSpacing}
        title="Fix double spaces, trim lines, and fix punctuation spacing"
        disabled={!text}
      >
        ✨ Clean Spacing
      </button>
      <button 
        className="btn btn-ai" 
        onClick={fixCapitalization}
        title="Capitalize sentence starts and stand-alone 'I'"
        disabled={!text}
      >
        🔠 Fix Capitalization
      </button>
      <button 
        className="btn btn-ai" 
        onClick={formatAssignment}
        title="Standardize Question and Answer formatting"
        disabled={!text}
      >
        📝 Format Assignment
      </button>
    </div>
  );
}
