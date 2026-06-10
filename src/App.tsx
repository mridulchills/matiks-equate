import { useState } from 'react';
import MatiksSplash from './components/MatiksSplash';
import type { MatiksGame, GameComponent, ComponentType } from './types';
import { Canvas } from './components/Canvas';
import { ComponentTray } from './components/ComponentTray';
import { RuleSheet } from './components/RuleSheet';
import { PreviewMode } from './components/PreviewMode';
import { GlobalSettings } from './components/GlobalSettings';
import { Settings as SettingsIcon } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import './index.css';

import { EquateGame } from './components/equate/EquateGame';

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [appState, setAppState] = useState<'menu' | 'builder' | 'equate'>('menu');
  const [mode, setMode] = useState<'build' | 'preview'>('build');
  const [game, setGame] = useState<MatiksGame>({
    game_id: 'ugc_test1',
    creator: { user_id: 'u_123', username: 'mridul_cm' },
    meta: { name: 'Make 24', category: 'arithmetic', difficulty: 'hard', visibility: 'public' },
    config: {
      rounds: 5,
      time_limit: { type: 'per_question', seconds: 30 },
      layout: {
        components: [
          { id: 'A', type: 'number_tile', position: 0 },
          { id: 'op1', type: 'operator_input', position: 1 },
          { id: 'B', type: 'number_tile', position: 2 },
          { id: 'op2', type: 'operator_input', position: 3 },
          { id: 'C', type: 'number_tile', position: 4 },
          { id: 'op3', type: 'operator_input', position: 5 },
          { id: 'D', type: 'number_tile', position: 6 },
          { id: 'target', type: 'target_display', position: 7, value: 24 },
          { id: 'submit', type: 'submit_button', position: 8 }
        ]
      },
      rule_sheet: {
        inputs: {
          A: { type: 'random_int', min: 1, max: 9 },
          B: { type: 'random_int', min: 1, max: 9 },
          C: { type: 'random_int', min: 1, max: 9 },
          D: { type: 'random_int', min: 1, max: 9 }
        },
        expression: "A op1 B op2 C op3 D",
        win_condition: { type: 'equals', target: 24 }
      }
    }
  });

  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<string | null>(null);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (String(event.active.id).startsWith('tray-')) {
      setActiveDragType(String(event.active.id).replace('tray-', ''));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragType(null);
    const { active, over } = event;

    if (!over) return;

    if (String(active.id).startsWith('tray-')) {
      // Dropping a new component from the tray
      if (over.id === 'canvas-droppable' || game.config.layout.components.find(c => c.id === over.id)) {
        const type = String(active.id).replace('tray-', '') as ComponentType;

        setGame(prev => {
          const newGame = JSON.parse(JSON.stringify(prev)) as MatiksGame;
          let newId = Math.random().toString(36).substring(7);

          if (type === 'number_tile') {
            const existingInputs = Object.keys(newGame.config.rule_sheet.inputs);
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            newId = letters.split('').find(l => !existingInputs.includes(l)) || newId;
            newGame.config.rule_sheet.inputs[newId] = { type: 'random_int', min: 1, max: 9 };
          } else if (type === 'operator_input') {
            const existingOps = newGame.config.layout.components.filter(c => c.type === 'operator_input').length;
            newId = `op${existingOps + 1}`;
          } else if (type === 'target_display') {
            newId = 'target';
          } else if (type === 'submit_button') {
            newId = 'submit';
          } else if (type === 'answer_input') {
            newId = 'answer';
          } else if (type === 'timer') {
            newId = 'timer';
          }

          const newComponent: GameComponent = {
            id: newId,
            type,
            position: newGame.config.layout.components.length
          };
          if (type === 'target_display') newComponent.value = 24;

          newGame.config.layout.components.push(newComponent);
          return newGame;
        });
      }
    } else {
      // Reordering existing components
      if (active.id !== over.id) {
        setGame((prev) => {
          const oldIndex = prev.config.layout.components.findIndex((c) => c.id === active.id);
          const newIndex = prev.config.layout.components.findIndex((c) => c.id === over.id);

          return {
            ...prev,
            config: {
              ...prev.config,
              layout: {
                components: arrayMove(prev.config.layout.components, oldIndex, newIndex)
              }
            }
          };
        });
      }
    }
  };

  const handleDelete = (id: string) => {
    setGame(prev => {
      const newGame = JSON.parse(JSON.stringify(prev)) as MatiksGame;
      newGame.config.layout.components = newGame.config.layout.components.filter(c => c.id !== id);
      if (newGame.config.rule_sheet.inputs[id]) {
        delete newGame.config.rule_sheet.inputs[id];
      }
      return newGame;
    });
    if (selectedComponentId === id) setSelectedComponentId(null);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(game, null, 2);
    alert('Game Config exported to console!\n\n' + jsonStr.slice(0, 200) + '...');
    console.log(jsonStr);
  };

  if (!splashDone) {
    return <MatiksSplash onComplete={() => setSplashDone(true)} />;
  }

  if (appState === 'menu') {
    return (
      <div style={{
        height: '100%',
        backgroundColor: '#111',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        padding: '24px'
      }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '60px' }}>
          <button 
            onClick={() => setShowRules(true)}
            style={{ 
            padding: '12px 16px', 
            borderRadius: '12px', 
            backgroundColor: '#1a1a1a', 
            border: '1px solid #333', 
            color: '#fff', 
            fontSize: '0.875rem',
            fontFamily: 'Inter',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.05em'
          }}>
            HOW TO PLAY?
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: '8px' }}>
          {/* Tags */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <div style={{
              backgroundColor: '#1a1a1a',
              color: 'var(--matiks-yellow)',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: 'Inter',
              letterSpacing: '0.05em'
            }}>MATH</div>
            <div style={{
              backgroundColor: '#333',
              color: '#d1d5db',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: 'Inter',
              letterSpacing: '0.05em'
            }}>3 MIN ROUND</div>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'Bebas Neue',
            fontSize: '5.5rem',
            color: '#fff',
            lineHeight: 0.9,
            margin: '0 0 32px 0',
            letterSpacing: '0.02em'
          }}>
            EQUATE<br />RACE
          </h1>

          {/* Subtitle */}
          <p style={{
            color: '#6b7280',
            fontFamily: 'Inter',
            fontSize: '0.875rem',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}>
            RACE TO SOLVE THE MOST IN 3 MINUTES
          </p>
        </div>

        {/* Bottom Button */}
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={() => setAppState('equate')}
            style={{
              width: '100%',
              backgroundColor: 'var(--matiks-yellow)',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              padding: '20px',
              fontSize: '1.125rem',
              fontFamily: 'Inter',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 6px 0 #b39700',
              transition: 'transform 0.1s, box-shadow 0.1s'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(4px)';
              e.currentTarget.style.boxShadow = '0 2px 0 #b39700';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 0 #b39700';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 0 #b39700';
            }}
          >
            PLAY A ROUND
          </button>
        </div>

        {/* Rules Bottom Sheet */}
        <div className={`bottom-sheet ${showRules ? 'open' : ''}`}>
          <div className="bottom-sheet-handle" onClick={() => setShowRules(false)}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>HOW TO PLAY</h3>
            <button onClick={() => setShowRules(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <ul style={{ color: '#9ca3af', fontFamily: 'Inter', fontSize: '1rem', lineHeight: 1.6, margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>Place operators (+, -, ×, ÷) into the slots to equal the target number.</li>
            <li>You can drag the operators, or tap to select and place them.</li>
            <li>Score as many points as possible before the 3-minute timer runs out!</li>
          </ul>
        </div>
        {/* Overlay */}
        {showRules && (
          <div 
            onClick={() => setShowRules(false)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          />
        )}
      </div>
    );
  }

  if (appState === 'equate') {
    return <EquateGame onExit={() => setAppState('menu')} />;
  }

  return (
    <div className="min-h-screen matiks-grid-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: 'var(--matiks-surface)', borderBottom: '1px solid var(--matiks-border)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="matiks-card" style={{ padding: '8px', border: 'none', cursor: 'pointer' }} onClick={() => setAppState('menu')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="heading-lg" style={{ margin: 0, fontSize: '2rem' }}>{game.meta.name}</h2>
          {mode === 'build' && (
            <button className="matiks-card" style={{ padding: '8px', border: 'none', cursor: 'pointer', display: 'flex' }} onClick={() => setIsGlobalSettingsOpen(true)}>
              <SettingsIcon size={20} color="var(--matiks-text-secondary)" />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {mode === 'build' && (
            <button className="matiks-pill" style={{ background: 'transparent', color: 'var(--matiks-text-secondary)', border: '1px solid var(--matiks-border)' }} onClick={handleExportJSON}>
              Export JSON
            </button>
          )}
          <button className="matiks-pill matiks-pill-yellow" onClick={() => setMode(mode === 'build' ? 'preview' : 'build')}>
            {mode === 'build' ? 'Preview' : 'Back to Builder'}
          </button>
          {mode === 'build' && (
            <button className="matiks-pill matiks-pill-yellow-solid">
              Publish
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {mode === 'build' ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {/* LEFT PANE - Canvas */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                  <Canvas
                    components={game.config.layout.components}
                    selectedId={selectedComponentId}
                    onSelect={setSelectedComponentId}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
              <ComponentTray />
            </div>

            {/* RIGHT PANE - Rule Sheet */}
            <RuleSheet game={game} onUpdate={setGame} />

            <DragOverlay>
              {activeDragType ? (
                <div style={{ padding: '12px', background: 'var(--matiks-surface)', border: '2px solid var(--matiks-yellow)', borderRadius: '8px', color: '#fff' }}>
                  {activeDragType.replace('_', ' ').toUpperCase()}
                </div>
              ) : null}
            </DragOverlay>

            <GlobalSettings
              game={game}
              isOpen={isGlobalSettingsOpen}
              onClose={() => setIsGlobalSettingsOpen(false)}
              onUpdate={setGame}
            />
          </DndContext>
        ) : (
          <PreviewMode gameConfig={game} onExit={() => setMode('build')} />
        )}
      </main>
    </div>
  );
}

export default App;

