import { Handle, NodeProps, Position } from 'reactflow';
import { Attachment } from '../../../types/scenario';

const MessageBlock = ({ data, id }: NodeProps) => (
  <div style={{
    border: '1.5px solid #e5e7eb',
    borderRadius: 12,
    background: '#fff',
    padding: 16,
    minWidth: 300,
    maxWidth: 300,
    width: 300,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    position: 'relative',
    wordBreak: 'break-word',
  }}>
    {data.onDelete && (
      <button onClick={() => data.onDelete?.(id)} style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: 18,
        color: '#bbb',
        zIndex: 2
      }}>×</button>
    )}
    <Handle type="target" position={Position.Top} id="start" style={{ 
      background: '#bbb',
      border: '1px solid #fff',
      width: 8,
      height: 8,
      minWidth: 8,
      minHeight: 8,
      pointerEvents: 'none'
    }} />
    <div style={{ display: 'flex', alignItems: 'center', color: '#222', fontWeight: 600, marginBottom: 8, gap: 6 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H20V16H5.17L4 17.17V4Z" stroke="#222" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M8 8H16" stroke="#222" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      Сообщение
    </div>
    <div style={{
      background: '#f3f4f6',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 14,
      color: '#222',
      marginBottom: 8,
      wordBreak: 'break-word',
    }} dangerouslySetInnerHTML={{ __html: data.text || '' }} />
    
    {data.attachments && data.attachments.length > 0 && (
      <div style={{ marginTop: 8 }}>
        {data.attachments.map((file: Attachment, index: number) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 8px',
              background: '#F9FAFB',
              borderRadius: 6,
              marginBottom: 4,
              fontSize: 13,
              color: '#4B5563',
            }}
          >
            <span style={{ fontSize: 12 }}>
              {file.content_type.startsWith('image/') ? '🖼️' : 
               file.content_type.startsWith('video/') ? '🎥' : '📄'}
            </span>
            <span style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              {file.filename}
            </span>
          </div>
        ))}
      </div>
    )}

    <Handle type="source" position={Position.Bottom} id="next" style={{
      background: '#bbb',
      border: '1px solid #fff',
      width: 8,
      height: 8,
      minWidth: 8,
      minHeight: 8,
    }} />
  </div>
);

export default MessageBlock; 