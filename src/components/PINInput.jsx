import { useRef, useState } from 'react';

export default function PINInput({ length = 6, onComplete, error }) {
  const [values, setValues] = useState(Array(length).fill(''));
  const refs = useRef([]);

  function handleChange(index, e) {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const newValues = [...values];
    newValues[index] = char;
    setValues(newValues);
    if (char && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
    if (newValues.every(Boolean)) {
      onComplete?.(newValues.join(''));
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace') {
      const newValues = [...values];
      if (newValues[index]) {
        newValues[index] = '';
        setValues(newValues);
      } else if (index > 0) {
        newValues[index - 1] = '';
        setValues(newValues);
        refs.current[index - 1]?.focus();
      }
    }
  }

  function handlePaste(e) {
    e.preventDefault();
  }

  return (
    <div>
      <div className="flex gap-2 justify-center">
        {values.map((val, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            aria-label={`PIN digit ${i + 1} of ${length}`}
            className={`w-12 h-12 text-center text-lg font-mono border-2 rounded-lg focus:outline-none transition-colors
              ${error
                ? 'border-red-500 bg-red-50 animate-shake'
                : val
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-surface-200 bg-white focus:border-brand-500'
              }`}
          />
        ))}
      </div>
      {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
    </div>
  );
}
