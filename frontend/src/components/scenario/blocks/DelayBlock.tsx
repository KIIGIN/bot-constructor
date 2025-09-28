import { Handle, NodeProps, Position } from 'reactflow';

const DelayBlock = ({ data, id }: NodeProps) => (
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
        <circle cx="12" cy="12" r="9" stroke="#222" strokeWidth="2"/>
        <path d="M12 7V12L15 15" stroke="#222" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      Задержка
    </div>
    <div style={{ marginBottom: 4, color: '#9ca3af', fontSize: 13 }}>Продолжить сценарий</div>
    <div style={{ fontSize: 14, color: '#222', marginBottom: 8, wordBreak: 'break-word' }}>
      через {data.value?.duration || 0} {data.value?.measurement === 'days' ? 'дней' : data.value?.measurement === 'hours' ? 'часов' : data.value?.measurement === 'minutes' ? 'минут' : 'секунд'}
    </div>
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

export default DelayBlock; 