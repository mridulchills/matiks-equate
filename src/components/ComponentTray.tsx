import { Hash, Plus, Monitor, Type, Timer, CheckCircle } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';

const availableComponents = [
  { type: 'number_tile', label: 'Number', icon: Hash },
  { type: 'operator_input', label: 'Operator', icon: Plus },
  { type: 'target_display', label: 'Target', icon: Monitor },
  { type: 'answer_input', label: 'Input', icon: Type },
  { type: 'timer', label: 'Timer', icon: Timer },
  { type: 'submit_button', label: 'Submit', icon: CheckCircle },
];

const TrayItem = ({ comp }: { comp: any }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `tray-${comp.type}`,
  });
  const Icon = comp.icon;

  return (
    <div 
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="matiks-card cursor-grab"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        minWidth: '100px',
        padding: '12px',
        border: '1px solid var(--matiks-border)',
        transition: 'border-color 0.2s',
        cursor: 'grab'
      }}
      onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--matiks-yellow)')}
      onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--matiks-border)')}
    >
      <Icon size={24} color="var(--matiks-yellow)" />
      <span style={{ fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: 600 }}>
        {comp.label}
      </span>
    </div>
  );
};

export const ComponentTray: React.FC = () => {
  return (
    <div style={{
      backgroundColor: 'var(--matiks-surface)',
      borderTop: '1px solid var(--matiks-border)',
      padding: '24px',
      display: 'flex',
      gap: '16px',
      overflowX: 'auto',
      alignItems: 'center',
      minHeight: '120px'
    }}>
      {availableComponents.map((comp) => (
        <TrayItem key={comp.type} comp={comp} />
      ))}
    </div>
  );
};
