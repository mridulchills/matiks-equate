import type { GameComponent } from '../types';
import { Settings, Trash2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CanvasProps {
  components: GameComponent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const SortableComponent = ({ comp, selectedId, onSelect, onDelete }: { comp: GameComponent, selectedId: string | null, onSelect: (id: string) => void, onDelete: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: comp.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef}
      style={{
        ...style,
        minWidth: '100px',
        backgroundColor: 'var(--matiks-surface)',
        border: `2px solid ${selectedId === comp.id ? 'var(--matiks-yellow)' : 'var(--matiks-border)'}`,
        borderRadius: '16px',
        padding: '16px',
        cursor: 'grab',
        position: 'relative',
        transition: 'border-color 0.2s',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100px',
        zIndex: selectedId === comp.id ? 2 : 1
      }}
      className="animate-fade-in"
      onClick={() => onSelect(comp.id)}
      {...attributes}
      {...listeners}
    >
      <div style={{ fontSize: '0.75rem', color: 'var(--matiks-yellow)', letterSpacing: '0.05em', marginBottom: '8px' }}>
        [{comp.id}]
      </div>
      <h4 className="heading-lg" style={{ margin: 0, textTransform: 'uppercase', pointerEvents: 'none', fontSize: '1.25rem', textAlign: 'center' }}>
        {comp.type.replace('_', ' ')}
        {comp.value !== undefined && <div style={{ fontSize: '1.5rem', color: '#fff', marginTop: '4px' }}>{comp.value}</div>}
      </h4>
      
      {selectedId === comp.id && (
        <button 
          onPointerDown={(e) => { e.stopPropagation(); onDelete(comp.id); }}
          style={{
            position: 'absolute',
            top: '-12px',
            right: '-12px',
            background: 'var(--matiks-red)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 10
          }}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}

export const Canvas: React.FC<CanvasProps> = ({ components, selectedId, onSelect, onDelete }) => {
  const { setNodeRef } = useDroppable({
    id: 'canvas-droppable',
  });

  return (
    <div 
      ref={setNodeRef}
      className="matiks-grid-bg"
      style={{ 
        minHeight: '400px', 
        borderRadius: '16px',
        border: '1px dashed var(--matiks-border)',
        padding: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'flex-start'
      }}
    >
      {components.length === 0 ? (
        <div className="flex-center" style={{ height: '100%', width: '100%', flexDirection: 'column', gap: '16px', opacity: 0.5 }}>
          <Settings size={48} />
          <h3 className="heading-lg">DRAG COMPONENTS HERE</h3>
        </div>
      ) : (
        <SortableContext items={components.map(c => c.id)} strategy={rectSortingStrategy}>
          {components.map((comp) => (
            <SortableComponent 
              key={comp.id} 
              comp={comp} 
              selectedId={selectedId} 
              onSelect={onSelect} 
              onDelete={onDelete} 
            />
          ))}
        </SortableContext>
      )}
    </div>
  );
};
