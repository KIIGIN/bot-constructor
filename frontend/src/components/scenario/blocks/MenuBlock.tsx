import { Handle, NodeProps, Position } from 'reactflow';

const MenuBlock = ({ data, id }: NodeProps) => (
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
        <rect x="2" y="2" width="6" height="6" rx="2" fill="#222"/>
        <rect x="12" y="2" width="6" height="6" rx="2" fill="#222"/>
        <rect x="2" y="12" width="6" height="6" rx="2" fill="#222"/>
        <rect x="12" y="12" width="6" height="6" rx="2" fill="#222"/>
      </svg>
      Меню
    </div>
    <div style={{
      background: '#f3f4f6',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 14,
      color: '#222',
      marginBottom: 16,
      wordBreak: 'break-word',
    }} dangerouslySetInnerHTML={{ __html: data.text || '' }} />
    {Array.isArray(data.buttons) && data.buttons.length > 0 && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.buttons.map((btn: any) => (
          <div key={btn.id} style={{
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            padding: '8px 0',
            fontSize: 14,
            fontWeight: 500,
            color: '#222',
            width: '100%',
            textAlign: 'center',
            boxSizing: 'border-box',
            position: 'relative',
            wordBreak: 'break-word',
          }}>
            {btn.text}
            <Handle
              type="source"
              position={Position.Right}
              id={btn.id}
              style={{
                background: '#bbb',
                border: '1px solid #fff',
                width: 8,
                height: 8,
                minWidth: 8,
                minHeight: 8,
              }}
            />
          </div>
        ))}
      </div>
    )}
  </div>
);

export default MenuBlock; 