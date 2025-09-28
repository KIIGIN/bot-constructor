import React, { useState, useEffect, useRef } from 'react';
import { Node } from 'reactflow';
import { MessageBlockData, StartBlockData, MenuBlockData, DelayBlockData, InputDataBlockData } from '../../../types/scenario';
import TextProperties from './TextProperties';
import api from '../../../utils/axios';

export type BlockDataType = StartBlockData | MenuBlockData | MessageBlockData | DelayBlockData | InputDataBlockData;

interface MessageBlockPropertiesProps {
  node: Node<BlockDataType>;
  setNodes: React.Dispatch<React.SetStateAction<Node<BlockDataType>[]>>;
  onDataChange?: (newData: MessageBlockData) => void;
}

const TABS = [
  { key: 'media', label: 'Обычное' },
  { key: 'document', label: 'С файлами' },
];

const MAX_FILES = 10;
const MAX_FILE_SIZE = 32 * 1024 * 1024; // 32 MB

const MessageBlockProperties: React.FC<MessageBlockPropertiesProps> = ({ node, setNodes, onDataChange }) => {
  const data = node.data as MessageBlockData;
  const [tab, setTab] = useState<'media' | 'document'>(data.type || 'media');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // обновление tab если data.type меняется извне
    if (data.type && data.type !== tab) setTab(data.type);
    // eslint-disable-next-line
  }, [data.type]);

  const handleTabChange = (newTab: 'media' | 'document') => {
    // Проверяем, можно ли переключиться на вкладку "Обычное"
    if (newTab === 'media' && data.attachments?.length) {
      const hasNonMediaFiles = data.attachments.some(
        att => !att.content_type.startsWith('image/') && !att.content_type.startsWith('video/')
      );
      if (hasNonMediaFiles) {
        setError('Нельзя переключиться на "Обычное", так как есть документы. Удалите их или переключитесь на "С файлами"');
        return;
      }
    }

    setTab(newTab);
    setNodes(nds => nds.map(n => {
      if (n.id !== node.id) return n;
      const newData = { ...n.data, type: newTab };
      onDataChange?.(newData as MessageBlockData);
      return { ...n, data: newData };
    }));
  };

  // Обновление текста через TextProperties
  const handleTextChange = (html: string) => {
    setNodes(nds => nds.map(n => {
      if (n.id !== node.id) return n;
      const newData = { ...n.data, text: html };
      onDataChange?.(newData as MessageBlockData);
      return { ...n, data: newData };
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setIsUploading(true);

    try {
      // Проверка количества файлов
      const currentFiles = data.attachments?.length || 0;
      if (currentFiles + files.length > MAX_FILES) {
        throw new Error(`Максимальное количество файлов: ${MAX_FILES}`);
      }

      // Проверка размера файлов
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > MAX_FILE_SIZE) {
          throw new Error(`Файл ${files[i].name} превышает максимальный размер 32MB`);
        }
      }

      // Проверка типов файлов для вкладки "Обычное"
      if (tab === 'media') {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            throw new Error(`В режиме "Обычное" можно загружать только изображения и видео`);
          }
        }
      }

      // Загрузка файлов
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/scenario/attachment', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      // Обновление данных блока
      setNodes(nds => nds.map(n => {
        if (n.id !== node.id) return n;
        if ('attachments' in n.data) {
          const newData = {
            ...n.data,
            attachments: [...(n.data.attachments || []), ...uploadedFiles],
          };
          onDataChange?.(newData as MessageBlockData);
          return { ...n, data: newData };
        }
        return n;
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке файлов');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (index: number) => {
    setNodes(nds => nds.map(n => {
      if (n.id !== node.id) return n;
      if ('attachments' in n.data) {
        const newAttachments = [...(n.data.attachments || [])];
        newAttachments.splice(index, 1);
        const newData = { ...n.data, attachments: newAttachments };
        onDataChange?.(newData as MessageBlockData);
        return { ...n, data: newData };
      }
      return n;
    }));
  };

  return (
    <div>
      {/* Табы для типа вложения */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => handleTabChange(t.key as 'media' | 'document')}
            style={{
              padding: '6px 18px',
              borderRadius: 8,
              border: 'none',
              background: tab === t.key ? '#E5C1A0' : '#F4F4F6',
              color: tab === t.key ? '#fff' : '#222',
              fontWeight: 500,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Заглушка для загрузки файлов */}
      <div style={{ marginBottom: 18 }}>
        {tab === 'media' ? (
          <>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Изображения или видео</div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,video/*"
              multiple
              style={{ display: 'none' }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '1px dashed #D1D5DB',
                borderRadius: 10,
                padding: 8,
                color: '#888',
                fontSize: 15,
                background: '#FAFAFB',
                textAlign: 'center',
                marginBottom: 8,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 12 }}>📎</span> Добавьте файл
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Файлы</div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              style={{ display: 'none' }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '1px dashed #D1D5DB',
                borderRadius: 10,
                padding: 8,
                color: '#888',
                fontSize: 15,
                background: '#FAFAFB',
                textAlign: 'center',
                marginBottom: 8,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 12 }}>📎</span> Добавьте файл
            </div>
          </>
        )}

        {error && (
          <div style={{ color: '#EF4444', fontSize: 14, marginTop: 8 }}>
            {error}
          </div>
        )}

        {isUploading && (
          <div style={{ color: '#666', fontSize: 14, marginTop: 8 }}>
            Загрузка файлов...
          </div>
        )}

        {data.attachments && data.attachments.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {data.attachments.map((file, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#F3F4F6',
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <div style={{ fontSize: 14, color: '#222' }}>
                  {file.filename}
                </div>
                <button
                  onClick={() => removeAttachment(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Сообщение */}
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Сообщение</div>
      <TextProperties
        value={data.text || ''}
        onChange={handleTextChange}
        placeholder="Сообщение"
        maxLength={4096}
        defaultHtml="Сообщение"
      />
    </div>
  );
};

export default MessageBlockProperties; 