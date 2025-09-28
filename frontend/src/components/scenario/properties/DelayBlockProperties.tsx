import React, { useState } from 'react';
import { Node } from 'reactflow';
import { DelayBlockData, StartBlockData, MenuBlockData, MessageBlockData, InputDataBlockData } from '../../../types/scenario';

export type BlockDataType = StartBlockData | MenuBlockData | MessageBlockData | DelayBlockData | InputDataBlockData;

interface DelayBlockPropertiesProps {
  node: Node<BlockDataType>;
  setNodes: React.Dispatch<React.SetStateAction<Node<BlockDataType>[]>>;
  onDataChange?: (newData: DelayBlockData) => void;
}

const MEASUREMENTS = [
  { value: 'seconds', label: 'секунд' },
  { value: 'minutes', label: 'минут' },
  { value: 'hours', label: 'часов' },
  { value: 'days', label: 'дней' },
];

const MAX_VALUES = {
  seconds: 60 * 60 * 24 * 31, // 2678400
  minutes: 60 * 24 * 31,     // 44640
  hours: 24 * 31,            // 744
  days: 31,
};

type MeasurementType = 'seconds' | 'minutes' | 'hours' | 'days';

const DelayBlockProperties: React.FC<DelayBlockPropertiesProps> = ({ node, setNodes, onDataChange }) => {
  const data = node.data as DelayBlockData;
  const [duration, setDuration] = useState<string>(data.value.duration || '0');
  const [measurement, setMeasurement] = useState<MeasurementType>(data.value.measurement || 'days');
  const [error, setError] = useState<string>('');

  // Проверка на число и лимит
  const validate = (val: string, measurement: MeasurementType) => {
    const num = Number(val);
    if (!val.trim() || isNaN(num) || num < 0) {
      setError('"Длительность" должна быть числом');
      return false;
    }
    if (num > MAX_VALUES[measurement]) {
      setError(`Максимум: ${MAX_VALUES[measurement]} для выбранной единицы`);
      return false;
    }
    setError('');
    return true;
  };

  // Обновить значение
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDuration(val);
    if (validate(val, measurement)) {
      setNodes(nds => nds.map(n => {
        if (n.id !== node.id) return n;
        if ('value' in n.data) {
          const newData = { 
            ...n.data, 
            value: { ...n.data.value, duration: val } 
          };
          onDataChange?.(newData as DelayBlockData);
          return { ...n, data: newData };
        }
        return n;
      }));
    }
  };

  // Обновить единицу измерения
  const handleMeasurementChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as MeasurementType;
    setMeasurement(val);
    // Проверяем лимит для текущего duration
    validate(duration, val);
    setNodes(nds => nds.map(n => {
      if (n.id !== node.id) return n;
      if ('value' in n.data) {
        const newData = { 
          ...n.data, 
          value: { ...n.data.value, measurement: val } 
        };
        onDataChange?.(newData as DelayBlockData);
        return { ...n, data: newData };
      }
      return n;
    }));
  };

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>
        Задерживаем на время
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        <input
          type="text"
          value={duration}
          onChange={handleDurationChange}
          style={{
            flex: 1,
            borderRadius: 8,
            border: error ? '2px solid #E24C4B' : '1px solid #E5E7EB',
            padding: '8px 10px',
            fontSize: 14,
            background: '#fff',
            outline: 'none',
            color: '#222',
          }}
          placeholder="0"
        />
        <select
          value={measurement}
          onChange={handleMeasurementChange}
          style={{
            borderRadius: 8,
            border: '1px solid #E5E7EB',
            padding: '8px 10px',
            fontSize: 14,
            background: '#fff',
            color: '#222',
          }}
        >
          {MEASUREMENTS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {error && <div style={{ color: '#E24C4B', fontSize: 12, marginBottom: 8 }}>{error}</div>}
      <div style={{ background: '#F4F4F6', borderRadius: 8, padding: '8px 10px', color: '#888', fontSize: 12, marginTop: 12 }}>
        Продолжить сценарий через {Number(duration) || 0} {MEASUREMENTS.find(m => m.value === measurement)?.label}
      </div>
    </div>
  );
};

export default DelayBlockProperties; 