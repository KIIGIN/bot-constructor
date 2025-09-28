import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Connection,
  addEdge,
  Edge as FlowEdge,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nanoid } from 'nanoid';
import { Connection as ScenarioConnection, ScenarioData, Block, BlockData } from '../../types/scenario';
import StartBlock from './blocks/StartBlock';
import MessageBlock from './blocks/MessageBlock';
import MenuBlock from './blocks/MenuBlock';
import DelayBlock from './blocks/DelayBlock';
import InputDataBlock from './blocks/InputDataBlock';
import StartBlockProperties, { BlockDataType } from './properties/StartBlockProperties';
import MessageBlockProperties from './properties/MessageBlockProperties';
import MenuBlockProperties from './properties/MenuBlockProperties';
import InputDataBlockProperties from './properties/InputDataBlockProperties';
import DelayBlockProperties from './properties/DelayBlockProperties';

interface ScenarioCanvasProps {
  scenario: ScenarioData;
  onUpdatePlacement?: (blockId: string, newCoord: { x: number; y: number }) => void;
  onAddConnection?: (connection: ScenarioConnection) => void;
  onDeleteConnection?: (connectionId: string) => void;
  onDeleteBlock?: (blockId: string) => void;
  onAddBlock?: (block: Block & { position: { x: number; y: number } }) => void;
  onNodeDataChange?: (blockId: string, newData: BlockData) => void;
}

const nodeTypes = {
  start: StartBlock,
  message: MessageBlock,
  menu: MenuBlock,
  delay: DelayBlock,
  input_data: InputDataBlock,
};

const ScenarioDraftCanvas = ({ scenario, onUpdatePlacement, onAddConnection, onDeleteConnection, onDeleteBlock, onAddBlock, onNodeDataChange }: ScenarioCanvasProps) => {
  const reactFlowInstance = useReactFlow();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const handleDeleteBlock = useCallback((blockId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== blockId));
    setEdges((eds) => eds.filter((e) => e.source !== blockId && e.target !== blockId));

    if (onDeleteBlock) {
      onDeleteBlock(blockId);
    }
  }, [onDeleteBlock]);

  const initialNodes = useMemo(() => {
    return scenario.blocks.map((block) => {
      const placement = scenario.placements.find((p) => p.id === block.id);
      return {
        id: block.id,
        type: block.type,
        position: placement ? placement.coord : { x: 0, y: 0 },
        data: {
          ...block.data,
          onDelete: handleDeleteBlock,
        },
      };
    });
  }, [scenario, handleDeleteBlock]);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [scenario]);


  // Преобразуем соединения в формат ReactFlow
  const initialEdges: Edge[] = scenario.connections.map((connection) => ({
    id: `${connection.from.block_id}-${connection.from.point}-${connection.to.block_id}-${connection.to.point}`,
    source: connection.from.block_id,
    target: connection.to.block_id,
    sourceHandle: connection.from.point,
    targetHandle: connection.to.point,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 10,
      height: 10
    }
  }));

  // Используем generic типизацию для useNodesState
  const [nodes, setNodes, onNodesChange] = useNodesState<BlockDataType>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Обработчик изменения позиции узлов
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    if (onUpdatePlacement) {
      const roundedPosition = {
        x: Math.round(node.position.x),
        y: Math.round(node.position.y)
      };
      onUpdatePlacement(node.id, roundedPosition);
    }
  }, [onUpdatePlacement]);

  // Обработчик добавления новой связи
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => {
      const exists = eds.some(
        (e) => e.source === params.source && e.sourceHandle === params.sourceHandle
      );
      if (exists) return eds;
      return addEdge({
        ...params,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 10,
          height: 10
        }
      }, eds);
    });

    if (onAddConnection && params.source && params.target && params.sourceHandle && params.targetHandle) {
      const connection: ScenarioConnection = {
        from: { block_id: params.source, point: params.sourceHandle },
        to: { block_id: params.target, point: params.targetHandle }
      };
      onAddConnection(connection);
    }
  }, [onAddConnection]);

  // Обработчик удаления связи по клику
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: FlowEdge) => {
    event.stopPropagation();
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    if (onDeleteConnection) {
      onDeleteConnection(edge.id);
    }
  }, [onDeleteConnection]);

  // Функция для генерации уникального ID
  const generateId = () => {
    return nanoid(); // по умолчанию — 21 символ
  };

  // Функция создания нового блока
  const createNewBlock = useCallback((type: Block['type'], position: { x: number; y: number }) => {
    const id = generateId();
    const newNode: Node = {
      id,
      type,
      position,
      data: {
        onDelete: handleDeleteBlock,
        // Добавляем базовые данные в зависимости от типа блока
        ...(type === 'message' && { text: 'Сообщение', type: 'media', attachments: [] }),
        ...(type === 'menu' && { text: 'Это ваше меню', buttons: [{id: generateId(), text: 'Кнопка 1'}] }),
        ...(type === 'delay' && { type: 'duration', value: { duration: '0', measurement: 'seconds' } }),
        ...(type === 'input_data' && { 
          text: 'Сообщение',
          field_name: 'Текст',
          field_type: 'text',
          variable_name: 'var',
          validation_failed_text: 'Ошибка валидации',
          buttons: [{id: generateId(), text: 'Назад'}]
        }),
      },
    };

    setNodes((nds) => [...nds, newNode]);
    if (onAddBlock) {
      onAddBlock({ 
        id, 
        type, 
        data: newNode.data,
        position: position
      });
    }
  }, [generateId, handleDeleteBlock, onAddBlock]);

  // Обработчик события drop
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as Block['type'];
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      createNewBlock(type, position);
    },
    [reactFlowInstance, createNewBlock]
  );

  // Обработчик события dragOver
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Обработчик клика по узлу
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
          minZoom={0.25}
          maxZoom={1}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          nodeTypes={nodeTypes}
          isValidConnection={({ sourceHandle, targetHandle }) => {
            if (!sourceHandle || !targetHandle) return false;
            if (sourceHandle === 'start') return false;
            return true;
          }}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onNodeClick={onNodeClick}
          onPaneClick={() => setSelectedNodeId(null)}
        >
          <Background />
        </ReactFlow>
      </div>
      {/* Боковое меню свойств блока */}
      {selectedNodeId && (() => {
        const node = nodes.find(n => n.id === selectedNodeId);
        if (!node) return null;
        if (node.type === 'start') {
          return (
            <div style={{ width: 340, background: '#fff', borderLeft: '1px solid #eee', padding: 24, boxSizing: 'border-box', height: '100%', overflowY: 'auto' }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>Старт</div>
              <StartBlockProperties 
                node={node} 
                setNodes={setNodes} 
                onDataChange={(newData) => onNodeDataChange?.(node.id, newData)}
              />
            </div>
          );
        }
        if (node.type === 'message') {
          return (
            <div style={{ width: 340, background: '#fff', borderLeft: '1px solid #eee', padding: 24, boxSizing: 'border-box', height: '100%', overflowY: 'auto' }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>Сообщение</div>
              <MessageBlockProperties 
                node={node} 
                setNodes={setNodes} 
                onDataChange={(newData) => onNodeDataChange?.(node.id, newData)}
              />
            </div>
          );
        }
        if (node.type === 'menu') {
          return (
            <div style={{ width: 340, background: '#fff', borderLeft: '1px solid #eee', padding: 24, boxSizing: 'border-box', height: '100%', overflowY: 'auto' }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>Меню</div>
              <MenuBlockProperties 
                node={node} 
                setNodes={setNodes} 
                onDataChange={(newData) => onNodeDataChange?.(node.id, newData)}
              />
            </div>
          );
        }
        if (node.type === 'input_data') {
          return (
            <div style={{ width: 340, background: '#fff', borderLeft: '1px solid #eee', padding: 24, boxSizing: 'border-box', height: '100%', overflowY: 'auto' }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>Сообщение</div>
              <InputDataBlockProperties 
                node={node} 
                setNodes={setNodes} 
                onDataChange={(newData) => onNodeDataChange?.(node.id, newData)}
              />
            </div>
          );
        }
        if (node.type === 'delay') {
          return (
            <div style={{ width: 340, background: '#fff', borderLeft: '1px solid #eee', padding: 24, boxSizing: 'border-box', height: '100%', overflowY: 'auto' }}>
              <DelayBlockProperties 
                node={node} 
                setNodes={setNodes} 
                onDataChange={(newData) => onNodeDataChange?.(node.id, newData)}
              />
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
};

export default ScenarioDraftCanvas; 