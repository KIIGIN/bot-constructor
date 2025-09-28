import React, { useState, useEffect } from 'react';

interface TextPropertiesProps {
  value: string; // html-текст
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
  defaultHtml?: string;
}

// Преобразовать html с <p> в обычный текст для textarea
function htmlToText(html: string): string {
  if (!html) return '';
  return html.replace(/<br\s*\/?>/g, '\n');
}

// Преобразовать текст в html с <p>...</p> по абзацам, пустые строки — &nbsp;
function textToHtml(text: string): string {
  if (!text) return '';
  return text; // Возвращаем текст как есть, с переносами строк
}

const TextProperties: React.FC<TextPropertiesProps> = ({ value, onChange, placeholder = '', maxLength = 4096, defaultHtml = 'Сообщение' }) => {
  // plain text для textarea
  const [text, setText] = useState<string>(() => htmlToText(value || ''));

  useEffect(() => {
    setText(htmlToText(value || ''));
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.target.value;
    if (val.length > maxLength) val = val.slice(0, maxLength);
    setText(val);
  };

  const handleTextBlur = () => {
    let html = textToHtml(text);
    if (!text.trim()) {
      html = defaultHtml;
      setText(htmlToText(defaultHtml));
    }
    onChange(html);
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={handleTextChange}
        onBlur={handleTextBlur}
        maxLength={maxLength}
        rows={6}
        style={{
          width: '100%',
          borderRadius: 10,
          border: '1px solid #E5E7EB',
          padding: '10px 12px',
          fontSize: 14,
          fontFamily: 'inherit',
          resize: 'vertical',
          background: '#fff',
          marginBottom: 8,
        }}
        placeholder={placeholder}
      />
      <div style={{ color: '#888', fontSize: 12, marginBottom: 8, textAlign: 'right' }}>{text.length} / {maxLength}</div>
    </div>
  );
};

export default TextProperties; 