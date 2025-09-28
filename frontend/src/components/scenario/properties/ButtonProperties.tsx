import React from 'react';
import { Button } from '../../../types/scenario';

interface ButtonPropertiesProps {
  buttons: Button[];
  onChange: (buttons: Button[]) => void;
  min?: number;
  max?: number;
}

const ButtonProperties: React.FC<ButtonPropertiesProps> = ({ buttons, onChange, min = 1, max = 10 }) => {
  // Обновить текст кнопки
  const handleButtonTextChange = (idx: number, value: string) => {
    if (value.length > 50) value = value.slice(0, 50);
    const newButtons = [...buttons];
    newButtons[idx] = { ...newButtons[idx], text: value };
    onChange(newButtons);
  };

  // Удалить кнопку
  const handleDeleteButton = (idx: number) => {
    if (buttons.length <= min) return;
    const newButtons = buttons.filter((_, i) => i !== idx);
    onChange(newButtons);
  };

  // Добавить кнопку
  const handleAddButton = () => {
    if (buttons.length >= max) return;
    const newButtons = [
      ...buttons,
      { id: Date.now().toString() + Math.random().toString(36).slice(2, 6), text: `Кнопка ${buttons.length + 1}` },
    ];
    onChange(newButtons);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        {buttons.map((btn, idx) => (
          <div key={btn.id} style={{ background: '#F4F4F6', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="text"
              value={btn.text}
              onChange={e => handleButtonTextChange(idx, e.target.value)}
              maxLength={50}
              style={{
                flex: 1,
                fontSize: 12,
                fontWeight: 500,
                padding: '6px 10px',
              }}
              placeholder={`Кнопка ${idx + 1}`}
              onBlur={() => {
                if (!btn.text.trim()) handleButtonTextChange(idx, `Кнопка ${idx + 1}`);
              }}
            />
            <span style={{ color: '#888', fontSize: 12 }}>{btn.text.length} / 50</span>
            <button
              type="button"
              onClick={() => handleDeleteButton(idx)}
              disabled={buttons.length <= min}
              style={{
                background: 'none',
                border: 'none',
                color: buttons.length <= min ? '#ccc' : '#E24C4B',
                cursor: buttons.length <= min ? 'not-allowed' : 'pointer',
                fontSize: 12,
                marginLeft: 6,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
              }}
              title={buttons.length <= min ? 'Нельзя удалить последнюю кнопку' : 'Удалить кнопку'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 6V4.8C7 4.35817 7 4.13725 7.0545 3.94722C7.17889 3.51111 7.51111 3.17889 7.94722 3.0545C8.13725 3 8.35817 3 8.8 3H15.2C15.6418 3 15.8627 3 16.0528 3.0545C16.4889 3.17889 16.8211 3.51111 16.9455 3.94722C17 4.13725 17 4.35817 17 4.8V6M4 6H20M19 6V18.2C19 18.8802 19 19.2202 18.872 19.476C18.7611 19.7022 18.5702 19.8931 18.344 20.004C18.0882 20.132 17.7482 20.132 17.068 20.132H6.932C6.25181 20.132 5.91175 20.132 5.65601 20.004C5.42977 19.8931 5.23893 19.7022 5.12801 19.476C5 19.2202 5 18.8802 5 18.2V6M9.5 10V16M14.5 10V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAddButton}
        disabled={buttons.length >= max}
        style={{
          width: '100%',
          background: 'var(--color-gray-100)',
          color: 'var(--color-gray-900)',
          border: 'none',
          borderRadius: 8,
          padding: '10px 0',
          fontWeight: 500,
          fontSize: 14,
          cursor: buttons.length >= max ? 'not-allowed' : 'pointer',
          marginTop: 2,
        }}
      >
        + Добавить кнопку
      </button>
    </div>
  );
};

export default ButtonProperties; 