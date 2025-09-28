import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../utils/axios';
import ScenarioCanvas from '../components/scenario/ScenarioCanvas';
import { Scenario, ScenarioData } from '../types/scenario';

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

const ScenarioName = styled.span`
  color: var(--color-gray-900);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
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
  
  &.edit {
    background-color: var(--color-gray-100);
    color: var(--color-gray-700);
    border: none;
    
    &:hover {
      background-color: var(--color-gray-200);
    }
  }
  
  &.run {
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

const ScenarioPage = () => {
  const navigate = useNavigate();
  const { scenarioId } = useParams();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScenario = async () => {
      try {
        const response = await api.get(`/scenario/${scenarioId}`);
        setScenario(response.data);
      } catch (err) {
        setError('Не удалось загрузить сценарий');
        console.error('Error fetching scenario:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScenario();
  }, [scenarioId]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;
  if (!scenario) return <div>Сценарий не найден</div>;

  const truncatedName = scenario.name.length > 50 
    ? `${scenario.name.slice(0, 50)}...` 
    : scenario.name;

  return (
    <PageContainer>
      <TopBar>
        <Navigation>
          <NavigationLink to="/dashboard">Чат-боты</NavigationLink>
          <NavigationSeparator>{'>'}</NavigationSeparator>
          <ScenarioName>{truncatedName}</ScenarioName>
        </Navigation>

        <ButtonGroup>
          <Button className="edit" onClick={() => navigate(`/scenario/${scenarioId}/edit`)}>Изменить</Button>
        </ButtonGroup>
      </TopBar>
      <CanvasContainer>
        {scenario.data && <ScenarioCanvas scenario={scenario.data as ScenarioData} />}
      </CanvasContainer>
    </PageContainer>
  );
};

export default ScenarioPage; 