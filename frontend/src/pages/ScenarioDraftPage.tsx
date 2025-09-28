import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../utils/axios';
import ScenarioDraftCanvas from '../components/scenario/ScenarioDraftCanvas';
import { Block, BlockData, Scenario, ScenarioData } from '../types/scenario';
import { ReactFlowProvider } from 'reactflow';
import debounce from 'lodash/debounce';

const PageContainer = styled.div`
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: white;
  border-bottom: 1px solid var(--color-gray-200);
`;

const Navigation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-gray-600);
`;

const NavigationLink = styled(Link)`
  color: var(--color-primary);
  font-size: 14px;
  &:hover {
    color: var(--color-primary);
  }
`;

const NavigationSeparator = styled.span`
  color: var(--color-gray-400);
  font-size: 14px;
`;

const ScenarioName = styled(Link)`
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
  text-decoration: none;

  &:hover {
    color: var(--color-primary-dark);
  }
`;

const DraftText = styled.span`
  color: var(--color-gray-900);
  font-size: 14px;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &.clear {
    background-color: var(--color-gray-100);
    color: var(--color-gray-700);
    border: none;
    
    &:hover {
      background-color: var(--color-gray-200);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      &:hover {
        background-color: var(--color-gray-100);
      }
    }
  }
  
  &.save {
    background-color: var(--color-primary);
    color: white;
    border: none;
    
    &:hover {
      background-color: var(--color-primary-dark);
    }
  }
`;

const CanvasContainer = styled.div`
  flex: 1;
  background-color: var(--color-gray-50);
`;

const SideMenu = styled.div`
  width: 200px;
  background: #fff;
  border-right: 1px solid var(--color-gray-200);
  padding: 15px 15px 15px 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
`;

const MenuButton = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: #fff;
  border: 1.5px solid rgb(229, 231, 235);
  border-radius: 8px;
  font-size: 14px;
  color: rgb(34, 34, 34);
  font-weight: 500;
  cursor: grab;
  transition: box-shadow 0.15s;
  user-select: none;
  min-height: 36px;
  height: 36px;
  &:hover {
    box-shadow: rgba(0, 0, 0, 0.04) 0px 2px 8px;
    border-color: var(--color-gray-200);
  }
  &:active {
    cursor: grabbing;
  }
`;

// const JsonViewer = styled.pre`
//   position: fixed;
//   right: 24px;
//   bottom: 24px;
//   width: 400px;
//   max-height: 350px;
//   background: #18181b;
//   color: #fafafa;
//   font-size: 13px;
//   border-radius: 10px;
//   box-shadow: 0 2px 16px rgba(0,0,0,0.18);
//   padding: 18px 18px 18px 18px;
//   overflow: auto;
//   z-index: 1000;
//   white-space: pre-wrap;
// `;

const ScenarioDraftPage = () => {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentData, setCurrentData] = useState<ScenarioData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const lastSavedDraft = useRef<string | null>(null);

  const handleDeleteBlock = (blockId: string) => {
    setCurrentData(prev => prev ? {
        ...prev,
      blocks: prev.blocks.filter(b => b.id !== blockId),
      placements: prev.placements.filter(p => p.id !== blockId),
      connections: prev.connections.filter(
        c => c.from.block_id !== blockId && c.to.block_id !== blockId
      ),
    }: prev);
  };

  const handleNodeDataChange = (blockId: string, newData: BlockData) => {
    setCurrentData(prev => prev ? {
      ...prev,
      blocks: prev.blocks.map(block => 
        block.id === blockId 
          ? { ...block, data: newData }
          : block
      )
    } : prev);
  };

  const fetchScenario = async () => {
    try {
      const response = await api.get(`/scenario/${scenarioId}`);
      setScenario(response.data);
      setCurrentData(
        response.data.draft && response.data.draft.data
          ? response.data.draft.data
          : response.data.data
      );
    } catch (err) {
      setError('Не удалось загрузить сценарий');
      console.error('Error fetching scenario:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearDraft = async () => {
    try {
      const response = await api.patch(`/scenario/${scenarioId}`, {
        draft: null
      });
      setScenario(response.data);
      setCurrentData(
        response.data.draft && response.data.draft.data
          ? response.data.draft.data
          : response.data.data
      );
    } catch (err) {
      console.error('Error clearing draft:', err);
      setError('Не удалось очистить черновик');
    }
  };

  // Функция для сохранения черновика
  const saveDraft = async (data: ScenarioData) => {
    if (!scenarioId) return;
    
    try {
      setIsSaving(true);
      const response = await api.patch(`/scenario/${scenarioId}`, {
        draft: { data }
      });
      setScenario(response.data);
    } catch (err) {
      console.error('Error saving draft:', err);
      setError('Не удалось сохранить черновик');
    } finally {
      setIsSaving(false);
    }
  };

  // Создаем debounced версию функции сохранения
  const debouncedSaveDraft = useCallback(
    debounce((data: ScenarioData) => {
      saveDraft(data);
    }, 1000),
    [scenarioId]
  );

  // Эффект для отслеживания изменений в currentData
  useEffect(() => {
    if (!currentData || !scenario) return;

    const currentDraft = scenario.draft?.data;
    const currentDataStr = JSON.stringify(currentData);

    // Если draft не изменился по сравнению с последним отправленным, не отправляем запрос
    if (lastSavedDraft.current === currentDataStr) return;

    const hasChanges = !currentDraft || currentDataStr !== JSON.stringify(currentDraft);

    if (hasChanges) {
      debouncedSaveDraft(currentData);
      lastSavedDraft.current = currentDataStr;
    }

    return () => {
      debouncedSaveDraft.cancel();
    };
  }, [currentData, scenario, debouncedSaveDraft]);

  useEffect(() => {
    fetchScenario();
  }, [scenarioId]);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const publishDraft = async () => {
    if (!scenarioId) return;
    
    try {
      setIsPublishing(true);
      await api.post(`/scenario/${scenarioId}/draft/apply`);
      // После успешной публикации переходим на страницу сценария
      navigate(`/scenario/${scenarioId}`);
    } catch (err) {
      console.error('Error publishing draft:', err);
      setError('Не удалось опубликовать черновик');
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;
  if (!scenario || !currentData) return <div>Сценарий не найден</div>;

  const truncatedName = scenario.name.length > 50 
    ? `${scenario.name.slice(0, 50)}...` 
    : scenario.name;

  // Проверяем, равны ли данные черновика основным данным сценария
  const isDraftEmpty = !scenario.draft || JSON.stringify(scenario.draft.data) === JSON.stringify(scenario.data);

  return (
    <PageContainer>
      <TopBar>
        <Navigation>
          <NavigationLink to="/dashboard">Чат-боты</NavigationLink>
          <NavigationSeparator>{'>'}</NavigationSeparator>
          <ScenarioName to={`/scenario/${scenarioId}`}>{truncatedName}</ScenarioName>
          <NavigationSeparator>{'>'}</NavigationSeparator>
          <DraftText>
            Черновик
          </DraftText>
        </Navigation>

        <ButtonGroup>
          <Button 
            className="clear" 
            onClick={clearDraft}
            disabled={isDraftEmpty}
          >
            Очистить черновик
          </Button>
          <Button 
            className="save" 
            onClick={publishDraft}
            disabled={isDraftEmpty || isPublishing}
          >
            {isPublishing ? 'Публикация...' : 'Опубликовать'}
          </Button>
        </ButtonGroup>
      </TopBar>
      <div style={{ display: 'flex', height: '100%' }}>
        <SideMenu>
          <MenuButton
            draggable
            onDragStart={(e) => onDragStart(e, 'message')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20V16H5.17L4 17.17V4Z" stroke="#222" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M8 8H16" stroke="#222" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Сообщение
          </MenuButton>
          <MenuButton
            draggable
            onDragStart={(e) => onDragStart(e, 'menu')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="6" height="6" rx="2" fill="#222"/>
              <rect x="12" y="2" width="6" height="6" rx="2" fill="#222"/>
              <rect x="2" y="12" width="6" height="6" rx="2" fill="#222"/>
              <rect x="12" y="12" width="6" height="6" rx="2" fill="#222"/>
            </svg>
            Меню
          </MenuButton>
          <MenuButton
            draggable
            onDragStart={(e) => onDragStart(e, 'input_data')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="7" width="7" height="10" rx="2" fill="#222"/>
              <rect x="15" y="7" width="7" height="10" rx="2" fill="#222"/>
              <path d="M9 12H15" stroke="#222" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Сбор данных
          </MenuButton>
          <MenuButton
            draggable
            onDragStart={(e) => onDragStart(e, 'delay')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="#222" strokeWidth="2"/>
              <path d="M12 7V12L15 15" stroke="#222" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Задержка
          </MenuButton>
        </SideMenu>
        <CanvasContainer>
          <ReactFlowProvider>
            <ScenarioDraftCanvas 
              scenario={currentData} 
              onUpdatePlacement={(blockId, newCoord) => {
                setCurrentData(prev => prev ? {
                  ...prev,
                  placements: prev.placements.map(p =>
                    p.id === blockId ? { ...p, coord: newCoord } : p
                  )
                } : prev);
              }}
              onAddConnection={(connection) => {
                setCurrentData(prev => prev ? {
                  ...prev,
                  connections: [...prev.connections, connection]
                } : prev);
              }}
              onDeleteConnection={(edgeId) => {
                setCurrentData(prev => prev ? {
                  ...prev,
                  connections: prev.connections.filter(c =>
                    `${c.from.block_id}-${c.to.block_id}` !== edgeId
                  )
                } : prev);
              }}
              onDeleteBlock={handleDeleteBlock}
              onAddBlock={(block: Block & { position: { x: number; y: number } }) => {
                setCurrentData(prev => prev ? {
                  ...prev,
                  blocks: [...prev.blocks, { id: block.id, type: block.type, data: block.data }],
                  placements: [...prev.placements, { 
                    id: block.id, 
                    coord: { 
                      x: Math.round(block.position.x), 
                      y: Math.round(block.position.y) 
                    } 
                  }]
                } : prev);
              }}
              onNodeDataChange={handleNodeDataChange}
            />
          </ReactFlowProvider>
        </CanvasContainer>
      </div>
      {/* Окно просмотра JSON */}
      {/* <JsonViewer>
        {JSON.stringify(currentData, null, 2)}
      </JsonViewer> */}
    </PageContainer>
  );
};

export default ScenarioDraftPage;