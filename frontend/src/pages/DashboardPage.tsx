import React, { useState } from 'react';
import styled from 'styled-components';
import { Bot, Plus, Pencil, Copy, Trash2, X, FileCode2, MessageSquare, MoreVertical, Play, ExternalLink, Link2, Pause, BookOpen } from 'lucide-react';
import Button from '../components/Button';
import api from '../utils/axios';
import { useNavigate } from 'react-router-dom';

const PageContainer = styled.main`
  flex: 1;
  padding: 32px 24px;
  margin: 0 auto;
  width: 100%;
  max-width: calc(100vw - 48px);

  @media (max-width: 768px) {
    padding: 16px 12px;
  }
`;

const Section = styled.section`
  margin-bottom: 48px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 24px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 28px;
  font-weight: 600;
  color: var(--color-gray-900);

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const AddButton = styled(Button)`
  padding: 8px 16px;
  font-size: 14px;
`;

const DropdownButton = styled.div`
  position: relative;
`;

const DropdownContent = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: ${props => props.$isOpen ? 'block' : 'none'};
  min-width: 200px;
  z-index: 10;
  margin-top: 4px;
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  color: var(--color-gray-700);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover {
    background-color: var(--color-gray-50);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-gray-900);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--color-gray-500);
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: var(--color-gray-700);
  }
`;

const BotLink = styled.a`
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    color: var(--color-primary-dark);
  }
`;

const Command = styled.span`
  color: var(--color-primary);
  font-family: monospace;
  background-color: var(--color-gray-50);
  padding: 2px 6px;
  border-radius: 4px;
`;

const TokenInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  margin: 16px 0;
  font-family: monospace;
  
  &:focus {
    border-color: var(--color-primary);
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 14px;
  margin-top: -8px;
  margin-bottom: 16px;
`;

const BotList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BotCard = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-gray-200);
  width: 100%;
  margin: 0 auto;
`;

const BotHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--color-gray-200);

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const BotIconWrapper = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-gray-50);
  border-radius: 12px;
  margin-right: 24px;

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
    margin-right: 16px;
  }
`;

const BotIcon = styled(Bot)`
  color: var(--color-primary);

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
  }
`;

const BotInfo = styled.div`
  flex: 1;
`;

const BotNameWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const BotNameText = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-gray-900);

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const EditButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  color: var(--color-gray-400);
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;

  ${BotNameWrapper}:hover & {
    opacity: 1;
  }

  &:hover {
    color: var(--color-gray-600);
  }
`;

const BotLinkContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  a {
    color: var(--color-primary);
    text-decoration: underline;
    font-size: 14px;
    
    &:hover {
      color: var(--color-primary-dark);
    }
  }
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  color: var(--color-gray-400);
  cursor: pointer;
  
  &:hover {
    color: var(--color-gray-600);
  }
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--color-primary-light);
  color: var(--color-primary);
  background: none;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 24px;
  
  &:hover {
    background-color: var(--color-primary-light);
  }
`;

const ScenariosList = styled.div`
  padding: 16px 24px;

  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const ScenarioItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--color-gray-50);
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const DataCollectionInfo = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background-color: #F8EAD8;
  border-radius: 7px;
  padding: 4px 6px;
  margin-right: 0;
  min-width: 32px;
  min-height: 32px;
  border: none;
  cursor: pointer;
  transition: box-shadow 0.2s;
  box-shadow: none;
  outline: none;

  &:hover {
    box-shadow: 0 0 0 2px #e2c9a0;
  }
`;

const DataIcon = styled(BookOpen)`
  color: var(--color-primary-dark, #c9a26b);
  width: 16px;
  height: 16px;
`;

const DataCount = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--color-gray-800);
  line-height: 1;
`;

const ScenarioInfo = styled.div`
  display: grid;
  grid-template-columns: 240px 140px 1fr 40px 160px;
  align-items: center;
  gap: 16px;
  width: 100%;

  @media (max-width: 1200px) {
    grid-template-columns: 200px 120px 1fr 40px 140px;
  }

  @media (max-width: 992px) {
    grid-template-columns: 180px 100px 1fr 40px 120px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 40px;
    gap: 8px;
  }
`;

const ScenarioInfoRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-right: 16px;
`;

const ScenarioName = styled.h4`
  font-size: 16px;
  font-weight: 500;
  color: var(--color-gray-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;

  @media (max-width: 768px) {
    max-width: none;
  }
`;

const ScenarioStatus = styled.span<{ $isActive?: boolean }>`
  color: ${props => props.$isActive ? '#10B981' : '#6B7280'};
  font-size: 14px;
  white-space: nowrap;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ScenarioTriggers = styled.span`
  font-family: monospace;
  background-color: var(--color-gray-100);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  justify-self: start;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ScenarioTime = styled.span`
  color: var(--color-gray-500);
  font-size: 14px;
  white-space: nowrap;
  margin-left: auto;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ScenarioActions = styled.div`
  position: relative;
  margin-left: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  color: var(--color-gray-400);
  cursor: pointer;
  
  &:hover {
    color: var(--color-gray-600);
  }

  @media (max-width: 768px) {
    padding: 4px;
  }
`;

const ActionMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: ${props => props.$isOpen ? 'block' : 'none'};
  min-width: 180px;
  z-index: 40;
  padding: 4px;
  white-space: nowrap;
  right: 0;
  top: 100%;
  margin-top: 4px;

  @media (max-width: 768px) {
    min-width: 160px;
  }
`;

const ActionMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  color: var(--color-gray-700);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;

  &:hover {
    background-color: var(--color-gray-50);
  }
`;

const AttachModal = styled(Modal)``;

const AttachModalContent = styled(ModalContent)`
  max-width: 400px;
`;

const SelectWrapper = styled.div`
  margin: 16px 0;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  background-color: white;
  
  &:focus {
    border-color: var(--color-primary);
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }
`;

const EditNameModal = styled(Modal)``;

const EditNameContent = styled(ModalContent)`
  max-width: 400px;
`;

const EditNameInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  margin: 16px 0;
  
  &:focus {
    border-color: var(--color-primary);
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const DisabledButton = styled(Button)`
  opacity: 0.5;
  cursor: not-allowed;
  
  &:hover {
    transform: none;
    box-shadow: none;
  }
`;

const Toast = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--color-gray-900);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  opacity: ${props => props.$isVisible ? '1' : '0'};
  transform: translateY(${props => props.$isVisible ? '0' : '20px'});
  transition: all 0.3s ease;
`;

const MAX_SCENARIO_NAME_LENGTH = 245;

// Вспомогательная функция для форматирования триггеров
const formatTriggers = (triggers: any[]) => {
  if (!triggers || triggers.length === 0) return 'нет';
  const parts: string[] = [];
  triggers.forEach(t => {
    if (t.type === 'start') {
      parts.push('/start');
    } else if (t.type === 'key_word' && t.data.key_words) {
      if (t.data.key_words.length === 1) {
        parts.push(`Ключевые слова: ${t.data.key_words[0]}`);
      } else if (t.data.key_words.length > 1) {
        parts.push(`Ключевые слова: ${t.data.key_words[0]}, ...`);
      }
    }
  });
  return parts.length > 0 ? parts.join(', ') : 'нет';
};

// Вспомогательная функция для обрезки названия сценария
const truncateScenarioName = (name: string) => {
  return name.length > 40 ? name.slice(0, 40) + '...' : name;
};

// Вспомогательная функция для подсчета общего количества собранных данных
const getTotalDataCount = (fields: any[] | null) => {
  if (!fields || fields.length === 0) return 0;
  return fields.reduce((total, field) => total + (field.values?.length || 0), 0);
};

// Хук для отслеживания ширины окна
function useWindowWidth() {
  const [width, setWidth] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

const DashboardPage: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState<{ id: string; first_name: string } | null>(null);
  const [botToken, setBotToken] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [newBotName, setNewBotName] = useState('');
  const [toast, setToast] = useState({ message: '', visible: false });
  const [activeScenarioMenu, setActiveScenarioMenu] = useState<string | null>(null);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<{ id: string; name: string } | null>(null);
  const [selectedBotForAttach, setSelectedBotForAttach] = useState('');
  const [isDeleteScenarioModalOpen, setIsDeleteScenarioModalOpen] = useState(false);
  const [selectedScenarioForDelete, setSelectedScenarioForDelete] = useState<{ id: string; name: string } | null>(null);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [scenarioError, setScenarioError] = useState('');
  const [bots, setBots] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [isEditScenarioModalOpen, setIsEditScenarioModalOpen] = useState(false);
  const [selectedScenarioForEdit, setSelectedScenarioForEdit] = useState<{ id: string; name: string } | null>(null);
  const [newScenarioNameEdit, setNewScenarioNameEdit] = useState('');
  const [scenarioEditError, setScenarioEditError] = useState('');
  const navigate = useNavigate();
  const windowWidth = useWindowWidth();

  React.useEffect(() => {
    fetchBots();
    fetchScenarios();
  }, []);

  const fetchBots = async () => {
    try {
      const res = await api.get('/chat-bot');
      setBots(res.data);
    } catch {}
  };
  const fetchScenarios = async () => {
    try {
      const res = await api.get('/scenario');
      setScenarios(res.data);
    } catch {}
  };

  const validateToken = (token: string) => {
    const pattern = /^\d{8,10}:[\w-]{30,50}$/;
    return pattern.test(token);
  };

  const handleTokenSubmit = async () => {
    if (!validateToken(botToken)) {
      setTokenError('Токен должен быть корректным');
      return;
    }
    try {
      await api.post('/chat-bot', { token: botToken });
      setToast({ message: 'Бот успешно добавлен!', visible: true });
      setIsModalOpen(false);
      setBotToken('');
      setTokenError('');
      fetchBots();
      setTimeout(() => setToast({ message: '', visible: false }), 3000);
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      setTokenError(detail || 'Ошибка при добавлении бота');
    }
  };

  const handleScenarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newScenarioName.slice(0, MAX_SCENARIO_NAME_LENGTH);
    if (!trimmedName.trim()) {
      setScenarioError('Введите название сценария');
      return;
    }
    if (trimmedName.length > MAX_SCENARIO_NAME_LENGTH) {
      setScenarioError(`Максимальная длина текста — ${MAX_SCENARIO_NAME_LENGTH} символов`);
      return;
    }
    try {
      // Генерация id для блока start
      const startBlockId = Math.random().toString(36).slice(2);
      const defaultData = {
        blocks: [
          {
            id: startBlockId,
            type: 'start',
            data: { triggers: [
              {
                data: {},
                type: "start",
                enabled: false
              },
              {
                data: {},
                type: "key_word",
                enabled: false
              }
            ] }
          }
        ],
        placements: [
          {
            id: startBlockId,
            coord: { x: 100, y: 100 }
          }
        ],
        connections: []
      };
      await api.post('/scenario', { name: trimmedName, data: defaultData });
      setToast({ message: 'Сценарий успешно добавлен!', visible: true });
      setIsScenarioModalOpen(false);
      setNewScenarioName('');
      setScenarioError('');
      fetchScenarios();
      setTimeout(() => setToast({ message: '', visible: false }), 3000);
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      setScenarioError(detail || 'Ошибка при добавлении сценария');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast({ message: 'Ссылка скопирована', visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  const handleEditClick = (bot: any) => {
    setSelectedBot(bot);
    setNewBotName(bot.first_name);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (bot: { id: string; first_name: string }) => {
    setSelectedBot(bot);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedBot || !newBotName || newBotName === selectedBot.first_name ||
        newBotName.length < 2 || newBotName.length > 64) {
      return;
    }

    try {
      await api.patch(`/chat-bot/${selectedBot.id}`, { first_name: newBotName });
      setIsEditModalOpen(false);
      setSelectedBot(null);
      setNewBotName('');
      fetchBots();
    } catch (error) {
      console.error('Error updating bot name:', error);
    }
  };

  const handleScenarioMenuClick = (scenarioId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (activeScenarioMenu === scenarioId) {
      setActiveScenarioMenu(null);
      return;
    }
    
    setActiveScenarioMenu(scenarioId);
  };

  const handleAttachScenario = (scenario: { id: string; name: string }) => {
    setSelectedScenario(scenario);
    setIsAttachModalOpen(true);
  };

  const handleAttachConfirm = async () => {
    if (!selectedScenario || !selectedBotForAttach) return;
    try {
      await api.post(`/scenario/${selectedScenario.id}/bot`, { bot_id: selectedBotForAttach });
      setIsAttachModalOpen(false);
      setSelectedScenario(null);
      setSelectedBotForAttach('');
      setToast({ message: 'Сценарий присоединён к боту!', visible: true });
      fetchScenarios();
      setTimeout(() => setToast({ message: '', visible: false }), 3000);
    } catch (error) {
      setToast({ message: 'Ошибка при присоединении сценария', visible: true });
      setTimeout(() => setToast({ message: '', visible: false }), 3000);
    }
  };

  const handleDeleteScenarioClick = (scenario: { id: string; name: string }) => {
    setSelectedScenarioForDelete(scenario);
    setIsDeleteScenarioModalOpen(true);
    setActiveScenarioMenu(null);
  };

  const handleEditScenarioClick = (scenario: { id: string; name: string }) => {
    setSelectedScenarioForEdit(scenario);
    setNewScenarioNameEdit(scenario.name);
    setIsEditScenarioModalOpen(true);
  };

  const handleSaveEditScenario = async () => {
    if (!selectedScenarioForEdit || !newScenarioNameEdit || newScenarioNameEdit === selectedScenarioForEdit.name || newScenarioNameEdit.length < 2 || newScenarioNameEdit.length > 245) {
      return;
    }
    try {
      await api.patch(`/scenario/${selectedScenarioForEdit.id}`, { name: newScenarioNameEdit });
      setIsEditScenarioModalOpen(false);
      setSelectedScenarioForEdit(null);
      setNewScenarioNameEdit('');
      fetchScenarios();
    } catch (error: any) {
      setScenarioEditError(error?.response?.data?.detail || 'Ошибка при изменении названия');
    }
  };

  const handleDeleteScenario = async () => {
    if (!selectedScenarioForDelete) return;
    try {
      await api.delete(`/scenario/${selectedScenarioForDelete.id}`);
      setIsDeleteScenarioModalOpen(false);
      setSelectedScenarioForDelete(null);
      fetchScenarios();
    } catch (error) {
      console.error('Error deleting scenario:', error);
    }
  };

  const handleDeleteBot = async () => {
    if (!selectedBot) return;
    try {
      await api.delete(`/chat-bot/${selectedBot.id}`);
      setIsDeleteModalOpen(false);
      setSelectedBot(null);
      setToast({ message: 'Бот удалён!', visible: true });
      fetchBots();
      setTimeout(() => setToast({ message: '', visible: false }), 3000);
    } catch (error) {
      setToast({ message: 'Ошибка при удалении бота', visible: true });
      setTimeout(() => setToast({ message: '', visible: false }), 3000);
    }
  };

  const handleStartScenario = async (scenario: any) => {
    try {
      await api.post('/chat-bot/definition/deploy', {
        bot_id: scenario.bot.id,
        scenario_id: scenario.id
      });
      setToast({ message: 'Сценарий успешно запущен!', visible: true });
      fetchScenarios();
      setTimeout(() => setToast({ message: '', visible: false }), 3000);
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      setToast({ message: detail || 'Ошибка при запуске сценария', visible: true });
      setTimeout(() => setToast({ message: '', visible: false }), 3000);
    }
    setActiveScenarioMenu(null);
  };

  const handleStopScenario = async (scenario: any) => {
    try {
      await api.post('/chat-bot/definition/stop', {
        bot_id: scenario.bot.id,
        scenario_id: scenario.id
      });
      setToast({ message: 'Сценарий успешно остановлен!', visible: true });
      fetchScenarios();
      setTimeout(() => setToast({ message: '', visible: false }), 3000);
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      setToast({ message: detail || 'Ошибка при остановке сценария', visible: true });
      setTimeout(() => setToast({ message: '', visible: false }), 3000);
    }
    setActiveScenarioMenu(null);
  };

  const handleDataCollectionClick = (scenarioId: string) => {
    navigate(`/scenario/${scenarioId}/data`);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.querySelector('.scenario-action-menu');
      if (menu && !menu.contains(event.target as Node)) {
        setActiveScenarioMenu(null);
      }
    };
    if (activeScenarioMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeScenarioMenu, navigate]);

  return (
    <PageContainer>
      <Section>
        <SectionHeader>
          <SectionTitle>Ваши чат-боты</SectionTitle>
          <DropdownButton>
            <AddButton
              variant="primary"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Plus size={16} />
              Добавить
            </AddButton>
            <DropdownContent $isOpen={isDropdownOpen}>
              <DropdownItem onClick={() => {
                setIsModalOpen(true);
                setIsDropdownOpen(false);
              }}>
                <MessageSquare size={20} />
                Чат-бот
              </DropdownItem>
              <DropdownItem onClick={() => {
                setIsScenarioModalOpen(true);
                setIsDropdownOpen(false);
              }}>
                <FileCode2 size={20} />
                Сценарий
              </DropdownItem>
            </DropdownContent>
          </DropdownButton>
        </SectionHeader>

        <BotList>
          {bots.length === 0 ? (
            <BotCard>
              <div style={{ textAlign: 'center', color: '#6B7280', padding: '32px 0' }}>Список ботов пуст</div>
            </BotCard>
          ) : (
            bots.map(bot => (
              <BotCard key={bot.id}>
                <BotHeader>
                  <BotIconWrapper>
                    <BotIcon size={32} />
                  </BotIconWrapper>
                  
                  <BotInfo>
                    <BotNameWrapper>
                      <BotNameText>{bot.first_name || bot.name || bot.username}</BotNameText>
                      <EditButton onClick={() => handleEditClick(bot)}>
                        <Pencil size={16} />
                      </EditButton>
                    </BotNameWrapper>
                    
                    <BotLinkContainer>
                      <a href={`https://t.me/${bot.username}`} target="_blank" rel="noopener noreferrer">
                        @{bot.username}
                      </a>
                      <CopyButton onClick={() => copyToClipboard(`https://t.me/${bot.username}`)}>
                        <Copy size={14} />
                      </CopyButton>
                    </BotLinkContainer>
                  </BotInfo>

                  <DeleteButton onClick={() => handleDeleteClick(bot)}>
                    <Trash2 size={20} />
                  </DeleteButton>
                </BotHeader>

                <ScenariosList>
                  {scenarios.filter(s => s.bot && s.bot.id === bot.id).length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6B7280', padding: '8px 0' }}>Список сценариев пуст</div>
                  ) : (
                    scenarios.filter(s => s.bot && s.bot.id === bot.id).map(scenario => (
                      <ScenarioItem key={scenario.id}>
                        <ScenarioInfo>
                          <ScenarioName>{truncateScenarioName(scenario.name)}</ScenarioName>
                          <ScenarioStatus $isActive={scenario.enabled}>
                            <b>Статус:</b> {scenario.enabled ? 'Активен' : 'Неактивен'}
                          </ScenarioStatus>
                          {windowWidth > 768 && (
                            <ScenarioTriggers>
                              <b>Триггеры:</b> {formatTriggers(scenario.triggers)}
                            </ScenarioTriggers>
                          )}
                          <ScenarioInfoRight>
                            {getTotalDataCount(scenario.fields) > 0 ? (
                              <DataCollectionInfo type="button" tabIndex={0} title="Собранные данные" onClick={() => handleDataCollectionClick(scenario.id)}>
                                <DataIcon />
                                <DataCount>{getTotalDataCount(scenario.fields)}</DataCount>
                              </DataCollectionInfo>
                            ) : null}
                            {windowWidth > 992 && (
                              <ScenarioTime>
                                <b>Изменено:</b> {scenario.updated_at ? new Date(scenario.updated_at).toLocaleString() : ''}
                              </ScenarioTime>
                            )}
                          </ScenarioInfoRight>
                        </ScenarioInfo>

                        <ScenarioActions>
                          <ActionButton onClick={(e) => handleScenarioMenuClick(scenario.id, e)}>
                            <MoreVertical size={20} />
                          </ActionButton>
                          {activeScenarioMenu === scenario.id && (
                            <ActionMenu $isOpen={true} className="scenario-action-menu">
                              <ActionMenuItem onClick={() => handleEditScenarioClick(scenario)}>
                                <Pencil size={16} />
                                Изменить название
                              </ActionMenuItem>
                              <ActionMenuItem onClick={() => navigate(`/scenario/${scenario.id}`)}>
                                <ExternalLink size={16} />
                                Открыть сценарий
                              </ActionMenuItem>
                              {scenario.enabled ? (
                                <ActionMenuItem onClick={() => handleStopScenario(scenario)}>
                                  <Pause size={16} />
                                  Остановить сценарий
                                </ActionMenuItem>
                              ) : (
                                <ActionMenuItem onClick={() => handleStartScenario(scenario)}>
                                  <Play size={16} />
                                  Запустить сценарий
                                </ActionMenuItem>
                              )}
                              <ActionMenuItem onClick={() => handleDeleteScenarioClick(scenario)}>
                                <Trash2 size={16} />
                                Удалить сценарий
                              </ActionMenuItem>
                            </ActionMenu>
                          )}
                        </ScenarioActions>
                      </ScenarioItem>
                    ))
                  )}
                </ScenariosList>
              </BotCard>
            ))
          )}
        </BotList>
      </Section>

      <SectionHeader>
        <SectionTitle>Сценарии без чат-ботов</SectionTitle>
      </SectionHeader>
      <BotList>
        {scenarios.filter(s => !s.bot).length === 0 ? (
          <BotCard>
            <div style={{ textAlign: 'center', color: '#6B7280', padding: '32px 0' }}>Список сценариев пуст</div>
          </BotCard>
        ) : (
          scenarios.filter(s => !s.bot).map(scenario => (
            <BotCard key={scenario.id}>
              <ScenariosList>
                <ScenarioItem>
                  <ScenarioInfo>
                    <ScenarioName>{truncateScenarioName(scenario.name)}</ScenarioName>
                    <ScenarioStatus $isActive={scenario.enabled}>
                      <b>Статус:</b> {scenario.enabled ? 'Активен' : 'Неактивен'}
                    </ScenarioStatus>
                    {windowWidth > 768 && (
                      <ScenarioTriggers>
                        <b>Триггеры:</b> {formatTriggers(scenario.triggers)}
                      </ScenarioTriggers>
                    )}
                    <ScenarioInfoRight>
                      {getTotalDataCount(scenario.fields) > 0 ? (
                        <DataCollectionInfo type="button" tabIndex={0} title="Собранные данные" onClick={() => handleDataCollectionClick(scenario.id)}>
                          <DataIcon />
                          <DataCount>{getTotalDataCount(scenario.fields)}</DataCount>
                        </DataCollectionInfo>
                      ) : null}
                      {windowWidth > 992 && (
                        <ScenarioTime>
                          <b>Изменено:</b> {scenario.updated_at ? new Date(scenario.updated_at).toLocaleString() : ''}
                        </ScenarioTime>
                      )}
                    </ScenarioInfoRight>
                  </ScenarioInfo>

                  <ScenarioActions>
                    <ActionButton onClick={(e) => handleScenarioMenuClick(scenario.id, e)}>
                      <MoreVertical size={20} />
                    </ActionButton>
                    {activeScenarioMenu === scenario.id && (
                      <ActionMenu $isOpen={true} className="scenario-action-menu">
                        <ActionMenuItem onClick={() => handleEditScenarioClick(scenario)}>
                          <Pencil size={16} />
                          Изменить название
                        </ActionMenuItem>
                        <ActionMenuItem onClick={() => navigate(`/scenario/${scenario.id}`)}>
                          <ExternalLink size={16} />
                          Открыть сценарий
                        </ActionMenuItem>
                        <ActionMenuItem onClick={() => handleAttachScenario(scenario)}>
                          <Link2 size={16} />
                          Присоединить к чат-боту
                        </ActionMenuItem>
                        <ActionMenuItem onClick={() => handleDeleteScenarioClick(scenario)}>
                          <Trash2 size={16} />
                          Удалить
                        </ActionMenuItem>
                      </ActionMenu>
                    )}
                  </ScenarioActions>
                </ScenarioItem>
              </ScenariosList>
            </BotCard>
          ))
        )}
      </BotList>

      {isModalOpen && (
        <Modal onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>3 шага для подключения бота</ModalTitle>
              <CloseButton onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>
            
            <div>
              <p>1. Откройте аккаунт <BotLink href="https://t.me/botfather" target="_blank" rel="noopener noreferrer">@botfather</BotLink> в Telegram.</p>
              <p>2. Отправьте команду <Command>/newbot</Command> в чат с @botfather и следуйте указаниям.</p>
              <p>3. Бот пришлет токен. Скопируйте его и вставьте ниже:</p>
              
              <TokenInput
                type="text"
                value={botToken}
                onChange={(e) => {
                  setBotToken(e.target.value);
                  setTokenError('');
                }}
                placeholder="Например, 2116517626:AAGxf-THo0CbG10P4oYBAmmjvZbLmer6LEA"
              />
              {tokenError && <ErrorMessage>{tokenError}</ErrorMessage>}
              
              {validateToken(botToken) ? (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleTokenSubmit}
                >
                  Подключить чат-бот
                </Button>
              ) : (
                <DisabledButton
                  variant="primary"
                  fullWidth
                  disabled
                >
                  Подключить чат-бот
                </DisabledButton>
              )}
            </div>
          </ModalContent>
        </Modal>
      )}

      {isEditModalOpen && selectedBot && (
        <EditNameModal onClick={() => setIsEditModalOpen(false)}>
          <EditNameContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Изменить название бота</ModalTitle>
              <CloseButton onClick={() => setIsEditModalOpen(false)}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>
            
            <EditNameInput
              type="text"
              value={newBotName}
              onChange={(e) => setNewBotName(e.target.value.slice(0, 64))}
              placeholder="Введите новое название"
            />
            {newBotName.length > 64 && (
              <ErrorMessage>Максимальная длина названия - 64 символа</ErrorMessage>
            )}
            
            <ButtonGroup>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Отмена
              </Button>
              {newBotName && newBotName !== selectedBot.first_name && newBotName.length >= 2 && newBotName.length <= 64 ? (
                <Button
                  variant="primary"
                  onClick={handleSaveEdit}
                >
                  Сохранить
                </Button>
              ) : (
                <DisabledButton
                  variant="primary"
                  disabled
                >
                  Сохранить
                </DisabledButton>
              )}
            </ButtonGroup>
          </EditNameContent>
        </EditNameModal>
      )}

      {isDeleteModalOpen && selectedBot && (
        <Modal onClick={() => setIsDeleteModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Удаление бота</ModalTitle>
              <CloseButton onClick={() => setIsDeleteModalOpen(false)}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>
            
            <p>Вы точно хотите удалить бота?</p>
            
            <ButtonGroup>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteBot}
              >
                Удалить
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {isAttachModalOpen && selectedScenario && (
        <AttachModal onClick={() => setIsAttachModalOpen(false)}>
          <AttachModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Выберите чат-бота</ModalTitle>
              <CloseButton onClick={() => setIsAttachModalOpen(false)}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>

            <p>Сценарий будет перемещён в выбранный чат-бот</p>

            <SelectWrapper>
              <Select
                value={selectedBotForAttach}
                onChange={(e) => setSelectedBotForAttach(e.target.value)}
              >
                <option value="">Выберите чат-бота</option>
                {bots.map(bot => (
                  <option key={bot.id} value={bot.id}>{bot.first_name || bot.username}</option>
                ))}
              </Select>
            </SelectWrapper>

            <ButtonGroup>
              <Button
                variant="outline"
                onClick={() => setIsAttachModalOpen(false)}
              >
                Отмена
              </Button>
              {selectedBotForAttach ? (
                <Button
                  variant="primary"
                  onClick={handleAttachConfirm}
                >
                  Присоединить
                </Button>
              ) : (
                <DisabledButton
                  variant="primary"
                  disabled
                >
                  Присоединить
                </DisabledButton>
              )}
            </ButtonGroup>
          </AttachModalContent>
        </AttachModal>
      )}

      {isDeleteScenarioModalOpen && selectedScenarioForDelete && (
        <Modal onClick={() => setIsDeleteScenarioModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Удаление сценария</ModalTitle>
              <CloseButton onClick={() => setIsDeleteScenarioModalOpen(false)}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>
            
            <p>Вы точно хотите удалить сценарий?</p>
            
            <ButtonGroup>
              <Button
                variant="outline"
                onClick={() => setIsDeleteScenarioModalOpen(false)}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteScenario}
              >
                Удалить
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {isScenarioModalOpen && (
        <Modal onClick={() => setIsScenarioModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Добавить сценарий</ModalTitle>
              <CloseButton onClick={() => setIsScenarioModalOpen(false)}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>
            <form onSubmit={handleScenarioSubmit}>
              <EditNameInput
                type="text"
                value={newScenarioName}
                onChange={e => {
                  const value = e.target.value.slice(0, MAX_SCENARIO_NAME_LENGTH);
                  setNewScenarioName(value);
                  if (e.target.value.length > MAX_SCENARIO_NAME_LENGTH) {
                    setScenarioError(`Максимальная длина текста — ${MAX_SCENARIO_NAME_LENGTH} символов`);
                  } else {
                    setScenarioError('');
                  }
                }}
                placeholder="Название сценария"
              />
              {scenarioError && <ErrorMessage>{scenarioError}</ErrorMessage>}
              <ButtonGroup>
                <Button variant="outline" onClick={() => setIsScenarioModalOpen(false)}>
                  Отмена
                </Button>
                <Button variant="primary" type="submit">
                  Добавить
                </Button>
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}

      {isEditScenarioModalOpen && selectedScenarioForEdit && (
        <EditNameModal onClick={() => setIsEditScenarioModalOpen(false)}>
          <EditNameContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Изменить название сценария</ModalTitle>
              <CloseButton onClick={() => setIsEditScenarioModalOpen(false)}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>
            <EditNameInput
              type="text"
              value={newScenarioNameEdit}
              onChange={(e) => setNewScenarioNameEdit(e.target.value.slice(0, 245))}
              placeholder="Введите новое название"
            />
            {newScenarioNameEdit.length > 245 && (
              <ErrorMessage>Максимальная длина названия - 245 символов</ErrorMessage>
            )}
            {scenarioEditError && <ErrorMessage>{scenarioEditError}</ErrorMessage>}
            <ButtonGroup>
              <Button
                variant="outline"
                onClick={() => setIsEditScenarioModalOpen(false)}
              >
                Отмена
              </Button>
              {newScenarioNameEdit && newScenarioNameEdit !== selectedScenarioForEdit.name && newScenarioNameEdit.length >= 2 && newScenarioNameEdit.length <= 245 ? (
                <Button
                  variant="primary"
                  onClick={handleSaveEditScenario}
                >
                  Сохранить
                </Button>
              ) : (
                <DisabledButton
                  variant="primary"
                  disabled
                >
                  Сохранить
                </DisabledButton>
              )}
            </ButtonGroup>
          </EditNameContent>
        </EditNameModal>
      )}

      <Toast $isVisible={toast.visible}>
        {toast.message}
      </Toast>
    </PageContainer>
  );
};

export default DashboardPage;