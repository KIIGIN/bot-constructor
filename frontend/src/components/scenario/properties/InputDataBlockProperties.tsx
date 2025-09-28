import React, { useState } from 'react';
import { Node } from 'reactflow';
import { InputDataBlockData, StartBlockData, MenuBlockData, MessageBlockData, DelayBlockData, Button, Block } from '../../../types/scenario';
import TextProperties from './TextProperties';
import ButtonProperties from './ButtonProperties';

export type BlockDataType = StartBlockData | MenuBlockData | MessageBlockData | DelayBlockData | InputDataBlockData;

interface InputDataBlockPropertiesProps {
  node: Node<BlockDataType>;
  setNodes: React.Dispatch<React.SetStateAction<Node<BlockDataType>[]>>;
  onDataChange?: (newData: InputDataBlockData) => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Текст' },
  { value: 'string', label: 'Строка' },
  { value: 'number', label: 'Число' },
  { value: 'date', label: 'Дата' },
  { value: 'yes_no', label: 'Да/Нет' },
  { value: 'phone', label: 'Телефон' },
  { value: 'email', label: 'Email' },
];

const FIELD_HINTS: Record<string, string> = {
  phone: 'Ввод цифр, символов +-(), до 150 знаков',
  email: 'Ввод почты в формате email@provider.com',
  date: 'Ввод даты в форматах "mm/dd/yyyy", "dd.mm.yyyy"',
  string: 'Однострочный текст до 255 символов',
  number: 'Целое число или число с десятичной точкой, со знаком или без',
  text: 'Многострочный текст до 5000 символов',
  yes_no: 'Ответ "да" или "нет"',
};

const InputDataBlockProperties: React.FC<InputDataBlockPropertiesProps> = ({ node, setNodes, onDataChange }) => {
  const data = node.data as InputDataBlockData;
  const buttons = data.buttons || [];
  const [variableError, setVariableError] = useState<string>('');

  // Генерация уникального имени переменной
  const generateUniqueVariableName = (blocks: { id: string; data: BlockDataType }[]): string => {
    const usedNames = new Set(blocks.map(b => (b.data as InputDataBlockData).variable_name));
    let counter = 1;
    let newName = `var_${counter}`;
    while (usedNames.has(newName)) {
      counter++;
      newName = `var_${counter}`;
    }
    return newName;
  };

  // Валидация имени переменной
  const validateVariableName = (value: string, blocks: { id: string; data: BlockDataType }[]): boolean => {
    // Если поле пустое, считаем валидным (будет сгенерировано уникальное имя)
    if (!value) {
      setVariableError('');
      return true;
    }

    if (!/^[a-zA-Z]/.test(value)) {
      setVariableError('Имя переменной должно начинаться с буквы');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setVariableError('Имя переменной может содержать только буквы, цифры и символ _');
      return false;
    }

    // Проверка на уникальность
    const isDuplicate = blocks.some(b => 
      b.id !== node.id && 
      (b.data as InputDataBlockData).variable_name === value
    );
    if (isDuplicate) {
      setVariableError('Такое имя переменной уже используется в сценарии');
      return false;
    }

    setVariableError('');
    return true;
  };

  // Обновить текст сообщения
  const handleTextChange = (html: string) => {
    setNodes(nds => nds.map(n => {
      if (n.id !== node.id) return n;
      const newData = { ...n.data, text: html };
      onDataChange?.(newData as InputDataBlockData);
      return { ...n, data: newData };
    }));
  };

  // Обновить кнопки
  const handleButtonsChange = (newButtons: Button[]) => {
    setNodes(nds => nds.map(n => {
      if (n.id !== node.id) return n;
      const newData = { ...n.data, buttons: newButtons };
      onDataChange?.(newData as InputDataBlockData);
      return { ...n, data: newData };
    }));
  };

  // Обновить поля сбора данных
  const handleFieldChange = (field: keyof InputDataBlockData, value: string) => {
    setNodes(nds => {
      if (field === 'variable_name') {
        if (!validateVariableName(value, nds.map(n => ({ id: n.id, data: n.data })))) {
          return nds;
        }
      }
      return nds.map(n => {
        if (n.id !== node.id) return n;
        const newData = { ...n.data, [field]: value };
        onDataChange?.(newData as InputDataBlockData);
        return { ...n, data: newData };
      });
    });
  };

  // Обработка потери фокуса для поля переменной
  const handleVariableNameBlur = () => {
    setNodes(nds => {
      const currentValue = (data as InputDataBlockData).variable_name;
      if (!currentValue) {
        const newValue = generateUniqueVariableName(nds.map(n => ({ id: n.id, data: n.data })));
        return nds.map(n => {
          if (n.id !== node.id) return n;
          const newData = { ...n.data, variable_name: newValue };
          onDataChange?.(newData as InputDataBlockData);
          return { ...n, data: newData };
        });
      }
      return nds;
    });
  };

  return (
    <div>
      {/* Первая часть: сообщение и кнопки */}
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Сообщение</div>
      <TextProperties
        value={data.text || ''}
        onChange={handleTextChange}
        placeholder="Сообщение"
        maxLength={4096}
        defaultHtml="Сообщение"
      />
      <div style={{ fontSize: 14, fontWeight: 500, margin: '18px 0 8px 0' }}>Кнопки</div>
      <ButtonProperties
        buttons={buttons}
        onChange={handleButtonsChange}
        min={1}
        max={10}
      />
      {/* Разделительная линия */}
      <div style={{ height: 1, background: '#E5E7EB', margin: '24px 0' }} />
      {/* Вторая часть: сбор данных */}
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Сбор данных</div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Поле</div>
        <input
          type="text"
          value={data.field_name || ''}
          onChange={e => handleFieldChange('field_name', e.target.value)}
          style={{
            width: '100%',
            borderRadius: 8,
            border: '1px solid #E5E7EB',
            padding: '8px 10px',
            fontSize: 14,
            marginBottom: 4,
          }}
          placeholder="Название поля"
        />
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Тип поля</div>
        <select
          value={data.field_type}
          onChange={e => handleFieldChange('field_type', e.target.value)}
          style={{
            width: '100%',
            borderRadius: 8,
            border: '1px solid #E5E7EB',
            padding: '8px 10px',
            fontSize: 14,
            marginBottom: 4,
            background: '#fff',
          }}
        >
          {FIELD_TYPES.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div style={{ color: '#888', fontSize: 12 }}>
          {FIELD_HINTS[data.field_type] || ''}
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Переменная</div>
        <input
          type="text"
          value={data.variable_name || ''}
          onChange={e => handleFieldChange('variable_name', e.target.value)}
          onBlur={handleVariableNameBlur}
          style={{
            width: '100%',
            borderRadius: 8,
            border: variableError ? '2px solid #E24C4B' : '1px solid #E5E7EB',
            padding: '8px 10px',
            fontSize: 14,
            marginBottom: 4,
            background: '#fff',
          }}
          placeholder="Имя переменной"
        />
        {variableError && (
          <div style={{ color: '#E24C4B', fontSize: 12, marginBottom: 4 }}>
            {variableError}
          </div>
        )}
        <div style={{ color: '#888', fontSize: 12 }}>
          Только латинские буквы, цифры и символ _. Первый символ — буква. Оставьте пустым для автоматической генерации
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Сообщение при ошибке ввода</div>
        <textarea
          value={data.validation_failed_text || ''}
          onChange={e => handleFieldChange('validation_failed_text', e.target.value)}
          maxLength={4096}
          rows={3}
          style={{
            width: '100%',
            borderRadius: 8,
            border: '1px solid #E5E7EB',
            padding: '8px 10px',
            fontSize: 14,
            resize: 'vertical',
            background: '#fff',
          }}
          placeholder="Сообщение, если пользователь ошибся при вводе"
          onBlur={e => {
            if (!e.target.value.trim()) {
              handleFieldChange('validation_failed_text', 'Ошибка валидации');
            }
          }}
        />
      </div>
      <div style={{ color: '#888', fontSize: 12, marginTop: 8 }}>
        Если данные не похожи на выбранное поле, бот отправит это сообщение, а затем исходное с кнопкой
      </div>
    </div>
  );
};

export default InputDataBlockProperties; 