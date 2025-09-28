import React from 'react';
import { Node } from 'reactflow';
import { MenuBlockData, StartBlockData, MessageBlockData, DelayBlockData, InputDataBlockData, Button } from '../../../types/scenario';
import TextProperties from './TextProperties';
import ButtonProperties from './ButtonProperties';

export type BlockDataType = StartBlockData | MenuBlockData | MessageBlockData | DelayBlockData | InputDataBlockData;

interface MenuBlockPropertiesProps {
  node: Node<BlockDataType>;
  setNodes: React.Dispatch<React.SetStateAction<Node<BlockDataType>[]>>;
  onDataChange?: (newData: MenuBlockData) => void;
}

const MenuBlockProperties: React.FC<MenuBlockPropertiesProps> = ({ node, setNodes, onDataChange }) => {
  const data = node.data as MenuBlockData;
  const buttons = data.buttons || [];

  // Обновить текст меню
  const handleTextChange = (html: string) => {
    setNodes(nds => nds.map(n => {
      if (n.id !== node.id) return n;
      const newData = { ...n.data, text: html };
      onDataChange?.(newData as MenuBlockData);
      return { ...n, data: newData };
    }));
  };

  // Обновить кнопки
  const handleButtonsChange = (newButtons: Button[]) => {
    setNodes(nds => nds.map(n => {
      if (n.id !== node.id) return n;
      const newData = { ...n.data, buttons: newButtons };
      onDataChange?.(newData as MenuBlockData);
      return { ...n, data: newData };
    }));
  };

  return (
    <div>
      {/* Текст меню */}
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Сообщение</div>
      <TextProperties
        value={data.text || ''}
        onChange={handleTextChange}
        placeholder="Это ваше меню"
        maxLength={4096}
        defaultHtml="Это ваше меню"
      />
      {/* Кнопки */}
      <div style={{ fontSize: 14, fontWeight: 500, margin: '18px 0 8px 0' }}>Кнопки</div>
      <ButtonProperties
        buttons={buttons}
        onChange={handleButtonsChange}
        min={1}
        max={10}
      />
    </div>
  );
};

export default MenuBlockProperties; 