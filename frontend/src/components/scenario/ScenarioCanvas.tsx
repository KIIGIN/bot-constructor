import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ScenarioData } from '../../types/scenario';
import StartBlock from './blocks/StartBlock';
import MessageBlock from './blocks/MessageBlock';
import MenuBlock from './blocks/MenuBlock';
import DelayBlock from './blocks/DelayBlock';
import InputDataBlock from './blocks/InputDataBlock';

interface ScenarioCanvasProps {
  scenario: ScenarioData;
}

const nodeTypes = {
  start: StartBlock,
  message: MessageBlock,
  menu: MenuBlock,
  delay: DelayBlock,
  input_data: InputDataBlock,
};

const ScenarioCanvas = ({ scenario }: ScenarioCanvasProps) => {
  // Преобразуем блоки в формат ReactFlow
  const initialNodes: Node[] = scenario.blocks.map((block) => {
    const placement = scenario.placements.find((p) => p.id === block.id);
    return {
      id: block.id,
      type: block.type,
      position: placement ? placement.coord : { x: 0, y: 0 },
      data: block.data,
    };
  });

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

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Обработчик изменения позиции узлов (только для просмотра)
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    // В режиме просмотра ничего не делаем
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        fitView
        minZoom={0.25}
        maxZoom={1}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        nodeTypes={nodeTypes}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

export default ScenarioCanvas; 