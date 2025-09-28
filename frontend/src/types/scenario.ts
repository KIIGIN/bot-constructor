// Базовые типы для триггеров
interface Trigger {
  type: 'start' | 'key_word';
  enabled: boolean;
  data: {
    key_words?: string[];
  };
}

// Типы для кнопок
interface Button {
  id: string;
  text: string;
}

// Интерфейс для вложений
interface Attachment {
  url: string;
  filename: string;
  content_type: string;
  size: number;
}

// Типы для задержки
interface DelayValue {
  duration: string;
  measurement: 'seconds' | 'minutes' | 'hours' | 'days';
}

// Типы для точек соединения
interface ConnectionPoint {
  point: 'start' | 'next' | 'completed' | string; // string для ID кнопок
  block_id: string;
}

// Типы для соединений
interface Connection {
  to: ConnectionPoint;
  from: ConnectionPoint;
}

// Типы для координат
interface Coordinates {
  x: number;
  y: number;
}

// Типы для размещения блоков
interface BlockPlacement {
  id: string;
  coord: Coordinates;
}

// Базовый интерфейс для данных блоков
interface BaseBlockData {
  text?: string;
}

interface StartBlockData {
  triggers: Trigger[];
}

interface MenuBlockData extends BaseBlockData {
  buttons: Button[];
}

interface MessageBlockData extends BaseBlockData {
  type: 'media' | 'document';
  attachments?: Attachment[];
}

interface DelayBlockData {
  type: 'duration';
  value: DelayValue;
}

interface InputDataBlockData extends BaseBlockData {
  buttons: Button[];
  field_name: string;
  field_type: 'text' | 'string' | 'number' | 'date' | 'yes_no' | 'phone' | 'email';
  variable_name: string;
  validation_failed_text: string;
}

// Объединение всех типов данных блоков
type BlockData = 
  | StartBlockData 
  | MenuBlockData 
  | MessageBlockData 
  | DelayBlockData 
  | InputDataBlockData;

// Основной интерфейс блока
interface Block {
  id: string;
  type: 'start' | 'menu' | 'message' | 'delay' | 'input_data';
  data: BlockData;
}

// Основной интерфейс сценария
interface ScenarioData {
  blocks: Block[];
  connections: Connection[];
  placements: BlockPlacement[];
}

interface Scenario {
  id: string | number;
  name: string;
  data: ScenarioData;
  draft?: { data: ScenarioData } | null;
  // Можно добавить другие поля, если нужно
}

export type {
  Trigger,
  Button,
  Attachment,
  DelayValue,
  ConnectionPoint,
  Connection,
  Coordinates,
  BlockPlacement,
  BaseBlockData,
  StartBlockData,
  MenuBlockData,
  MessageBlockData,
  DelayBlockData,
  InputDataBlockData,
  BlockData,
  Block,
  ScenarioData,
  Scenario
}; 