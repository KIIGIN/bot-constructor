import { Handle, NodeProps, Position } from 'reactflow';

const StartBlock = ({ data }: NodeProps) => {
  // Фильтруем активные триггеры
  const activeTriggers = Array.isArray(data.triggers)
    ? data.triggers.filter((t: any) => {
        if (!t.enabled) return false;
        if (t.type === 'key_word') {
          return Array.isArray(t.data.key_words) && t.data.key_words.length > 0;
        }
        return true;
      })
    : [];

  return (
    <div style={{
      border: '1.5px solid #F0D4B4',
      borderRadius: 12,
      background: '#fff',
      padding: 16,
      minWidth: 300,
      maxWidth: 300,
      width: 300,
      boxShadow: '0 2px 8px #E5C1A0',
      wordBreak: 'break-word',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', color: '#E5C1A0', fontWeight: 600, marginBottom: 8, gap: 6 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 8.5L10 3L17 8.5V16.25C17 16.6642 16.6642 17 16.25 17H13.25C12.8358 17 12.5 16.6642 12.5 16.25V13.25C12.5 12.8358 12.1642 12.5 11.75 12.5H8.25C7.83579 12.5 7.5 12.8358 7.5 13.25V16.25C7.5 16.6642 7.16421 17 6.75 17H3.75C3.33579 17 3 16.6642 3 16.25V8.5Z" fill="#F0D4B4" stroke="#F0D4B4" strokeWidth="1" strokeLinejoin="round"/>
        </svg>
        Старт
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activeTriggers.length === 0 && (
          <div style={{ color: '#9ca3af', fontSize: 14 }}>Нет активных триггеров</div>
        )}
        {activeTriggers.map((t: any, i: number) => (
          <div key={i} style={{
            background: '#f3f4f6',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 14,
            color: '#222',
            marginBottom: 4,
            wordBreak: 'break-word',
          }}>
            {t.type === 'start'
              ? 'Запуск по /start'
              : `Ключевые слова: ${t.data.key_words?.join(', ')}`}
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} id="next" style={{
        background: '#bbb',
        border: '1px solid #fff',
        width: 8,
        height: 8,
        minWidth: 8,
        minHeight: 8,
      }} />
    </div>
  );
};

export default StartBlock; 