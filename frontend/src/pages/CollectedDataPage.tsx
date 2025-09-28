import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/axios';
import styled from 'styled-components';
import { ChevronDown, ChevronUp } from 'lucide-react';
import * as XLSX from 'xlsx';

const Breadcrumbs = styled.nav`
  font-size: 14px;
  margin: 24px 0 16px 0;
  color: var(--color-gray-600);
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

const Th = styled.th`
  background: var(--color-gray-50);
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid var(--color-gray-200);
`;

const Td = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-gray-100);
`;

const Tr = styled.tr``;

const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
`;

const PageButton = styled.button`
  background: none;
  border: 1px solid var(--color-gray-200);
  border-radius: 6px;
  padding: 6px 12px;
  margin: 0 4px;
  cursor: pointer;
  color: var(--color-gray-700);
  font-size: 14px;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RowsSelect = styled.select`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--color-gray-200);
  font-size: 14px;
  margin-left: 8px;
`;

const SortIcon = styled.span`
  margin-left: 4px;
  display: inline-flex;
  vertical-align: middle;
`;

const NavigationLink = styled(Link)`
  color: var(--color-primary);
  font-size: 14px;
  &:hover {
    color: var(--color-primary);
  }
`;

const ExportButton = styled.button<{ $disabled?: boolean }>`
  background: ${props => props.$disabled ? 'var(--color-primary-light)' : 'var(--color-primary)'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  margin-left: 16px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
  box-shadow: ${props => props.$disabled ? 'none' : '0 2px 8px rgba(210,180,140,0.10)'};
  opacity: ${props => props.$disabled ? '0.7' : '1'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: ${props => props.$disabled ? 'var(--color-primary-light)' : 'var(--color-primary-dark)'};
    box-shadow: ${props => props.$disabled ? 'none' : '0 4px 12px rgba(210,180,140,0.18)'};
    transform: ${props => props.$disabled ? 'none' : 'translateY(-2px)'};
  }
  &:active {
    background: ${props => props.$disabled ? 'var(--color-primary-light)' : 'var(--color-primary)'};
    box-shadow: none;
    transform: none;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const columns = [
  { key: 'name', label: 'Название поля' },
  { key: 'type', label: 'Тип поля' },
  { key: 'user_id', label: 'ID пользователя' },
  { key: 'username', label: 'Имя пользователя' },
  { key: 'value', label: 'Ответ' },
  { key: 'created_at', label: 'Время ответа' },
];

const ROWS_OPTIONS = [10, 25, 50, 75, 100];

const PageContainer = styled.main`
  flex: 1;
  padding: 32px 24px;
  margin: 0 auto;
  width: 100%;
  max-width: calc(100vw - 48px);
`;

const CollectedDataPage: React.FC = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const [scenario, setScenario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    const fetchScenario = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/scenario/${scenarioId}`);
        setScenario(res.data);
      } catch (e: any) {
        const detail = e?.response?.data?.detail;
        setError(detail || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    fetchScenario();
  }, [scenarioId]);

  // Преобразуем данные для таблицы
  const tableRows = scenario?.fields?.flatMap((field: any) =>
    (field.values || []).map((value: any) => ({
      name: field.name,
      type: field.type,
      user_id: value.user_id,
      username: value.username,
      value: value.value,
      created_at: value.created_at,
    }))
  ) || [];

  // Сортировка
  const sortedRows = React.useMemo(() => {
    if (!sortBy) return tableRows;
    return [...tableRows].sort((a, b) => {
      if (a[sortBy] === null || a[sortBy] === undefined) return 1;
      if (b[sortBy] === null || b[sortBy] === undefined) return -1;
      if (a[sortBy] === b[sortBy]) return 0;
      if (sortOrder === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });
  }, [tableRows, sortBy, sortOrder]);

  // Пагинация
  const totalRows = sortedRows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const paginatedRows = sortedRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Сброс страницы только при смене scenarioId
  useEffect(() => {
    setCurrentPage(1);
  }, [scenarioId]);

  // Экспорт в Excel
  const handleExportExcel = () => {
    const exportData = sortedRows.map((row: any) => ({
      'Название поля': row.name,
      'Тип поля': row.type,
      'ID пользователя': row.user_id,
      'Имя пользователя': row.username || '-',
      'Ответ': row.value,
      'Время ответа': row.created_at ? new Date(row.created_at).toLocaleString() : '-',
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Данные');
    XLSX.writeFile(workbook, 'collected_data.xlsx');
  };

  return (
    <PageContainer>
      <Breadcrumbs>
        <NavigationLink to="/dashboard">Чат-боты</NavigationLink> &gt; {scenario?.name || '...'}
      </Breadcrumbs>
      <HeaderRow>
        <Title>Собранные данные</Title>
        <ExportButton 
          onClick={handleExportExcel} 
          $disabled={loading || !!error || paginatedRows.length === 0}
          disabled={loading || !!error || paginatedRows.length === 0}
        >
          Экспорт в Excel
        </ExportButton>
      </HeaderRow>
      {loading ? (
        <div>Загрузка...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <>
          <Table>
            <thead>
              <Tr>
                {columns.map(col => (
                  <Th
                    key={col.key}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    {sortBy === col.key && (
                      <SortIcon>
                        {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </SortIcon>
                    )}
                  </Th>
                ))}
              </Tr>
            </thead>
            <tbody>
              {paginatedRows.map((row: any, idx: number) => (
                <Tr key={idx}>
                  <Td>{row.name}</Td>
                  <Td>{row.type}</Td>
                  <Td>{row.user_id}</Td>
                  <Td>{row.username || '-'}</Td>
                  <Td>{row.value}</Td>
                  <Td>{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <PaginationWrapper>
            <div>
              Строк на странице:
              <RowsSelect value={rowsPerPage} onChange={handleRowsPerPageChange}>
                {ROWS_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </RowsSelect>
            </div>
            <div>
              <PageButton onClick={() => handlePageChange(1)} disabled={currentPage === 1}>{'<<'}</PageButton>
              <PageButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>{'<'}</PageButton>
              <span style={{ margin: '0 8px' }}>Страница {currentPage} из {totalPages}</span>
              <PageButton onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>{'>'}</PageButton>
              <PageButton onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>{'>>'}</PageButton>
            </div>
          </PaginationWrapper>
        </>
      )}
    </PageContainer>
  );
};

export default CollectedDataPage; 