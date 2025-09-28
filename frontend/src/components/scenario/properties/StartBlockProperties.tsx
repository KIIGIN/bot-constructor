import React, { useRef } from 'react';
import { Node } from 'reactflow';
import { StartBlockData, Trigger, MenuBlockData, MessageBlockData, DelayBlockData, InputDataBlockData } from '../../../types/scenario';

// Типизация для всех возможных data блоков
export type BlockDataType = StartBlockData | MenuBlockData | MessageBlockData | DelayBlockData | InputDataBlockData;

interface StartBlockPropertiesProps {
  node: Node<BlockDataType>;
  setNodes: React.Dispatch<React.SetStateAction<Node<BlockDataType>[]>>;
  onDataChange?: (newData: StartBlockData) => void;
}

// Switch компонент
const Switch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <span
    style={{
      display: 'inline-block',
      width: 36,
      height: 20,
      borderRadius: 12,
      background: checked ? '#E5C1A0' : '#E5E7EB',
      position: 'relative',
      cursor: 'pointer',
      verticalAlign: 'middle',
      transition: 'background 0.2s',
    }}
    onClick={onChange}
  >
    <span
      style={{
        display: 'block',
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute',
        top: 2,
        left: checked ? 18 : 2,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        transition: 'left 0.2s',
      }}
    />
  </span>
);

const StartBlockProperties: React.FC<StartBlockPropertiesProps> = ({ node, setNodes, onDataChange }) => {
  const data = node.data as StartBlockData;
  const triggers = data.triggers || [];
  const keyWordTrigger = triggers.find(t => t.type === 'key_word');
  const startTrigger = triggers.find(t => t.type === 'start');
  const inputRef = useRef<HTMLInputElement>(null);

  // Включить/выключить триггер
  const toggleTrigger = (type: Trigger['type']) => {
    setNodes(nds => nds.map(n => {
      if (n.id !== node.id) return n;
      const oldTriggers = ((n.data as StartBlockData).triggers || []) as Trigger[];
      let newTriggers: Trigger[];
      if (oldTriggers.some(t => t.type === type)) {
        newTriggers = oldTriggers.map(t => t.type === type ? { ...t, enabled: !t.enabled } : t);
      } else {
        newTriggers = [...oldTriggers, { type, enabled: true, data: {} }];
      }
      const newData = { ...(n.data as StartBlockData), triggers: newTriggers };
      onDataChange?.(newData);
      return { ...n, data: newData };
    }));
  };

  // Добавить ключевое слово
  const addKeyWord = (word: string) => {
    if (!word.trim()) return;
    setNodes(nds => nds.map(n => {
      if (n.id !== node.id) return n;
      const oldTriggers = ((n.data as StartBlockData).triggers || []) as Trigger[];
      const newData = {
        ...(n.data as StartBlockData),
        triggers: oldTriggers.map(t =>
          t.type === 'key_word'
            ? { ...t, data: { key_words: Array.from(new Set([...(t.data.key_words || []), word.trim()])) } }
            : t
        )
      };
      onDataChange?.(newData);
      return { ...n, data: newData };
    }));
    if (inputRef.current) inputRef.current.value = '';
  };

  // Удалить ключевое слово
  const removeKeyWord = (word: string) => {
    setNodes(nds => nds.map(n => {
      if (n.id !== node.id) return n;
      const oldTriggers = ((n.data as StartBlockData).triggers || []) as Trigger[];
      const newData = {
        ...(n.data as StartBlockData),
        triggers: oldTriggers.map(t =>
          t.type === 'key_word'
            ? { ...t, data: { key_words: (t.data.key_words || []).filter((w: string) => w !== word) } }
            : t
        )
      };
      onDataChange?.(newData);
      return { ...n, data: newData };
    }));
  };

  return (
    <div>
      {/* Запуск по /start */}
      <div style={{ background: '#F4F4F6', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#18181B', flex: 1 }}>Запуск по /start</span>
          <Switch checked={!!(startTrigger && startTrigger.enabled)} onChange={() => toggleTrigger('start')} />
        </div>
        <div style={{ color: '#888', fontSize: 12 }}>Этот сценарий будет приветственным</div>
      </div>

      {/* Запуск по ключевым словам */}
      <div style={{ background: '#F4F4F6', borderRadius: 12, padding: 16, marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#18181B', flex: 1 }}>Запуск по ключевым словам</span>
          <Switch checked={!!(keyWordTrigger && keyWordTrigger.enabled)} onChange={() => toggleTrigger('key_word')} />
        </div>
        {keyWordTrigger && keyWordTrigger.enabled && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                ref={inputRef}
                type="text"
                style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, background: '#fff' }}
                placeholder="Начните вводить ключевое слово..."
                onKeyDown={e => {
                  if (e.key === 'Enter') addKeyWord((e.target as HTMLInputElement).value);
                }}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(keyWordTrigger.data.key_words || []).map((word: string) => (
                <span key={word} style={{ background: '#E5E7EB', borderRadius: 6, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 2, fontSize: 12, color: '#444' }}>
                  {word}
                  <button
                    type="button"
                    onClick={() => removeKeyWord(word)}
                    style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginLeft: 2, fontSize: 12, padding: 0, lineHeight: 1 }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartBlockProperties; 