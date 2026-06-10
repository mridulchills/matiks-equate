import React, { useEffect, useState, useRef } from 'react';
import { 
  DndContext, 
  useDraggable, 
  useDroppable, 
  DragOverlay, 
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { evaluateMathExpression } from '../../utils/mathEvaluator';
import { X, Loader2, RotateCcw, Timer } from 'lucide-react';
import PyodideWorker from '../../workers/pyodide.worker.ts?worker';

interface EquateGameProps {
  onExit: () => void;
}

interface Puzzle {
  tiles: number[];
  target: number;
  hint: string[];
}

const DraggableOperator = ({ op, isTray = false, isSelected = false, onClick }: { op: string, isTray?: boolean, isSelected?: boolean, onClick?: () => void }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: isTray ? `tray-${op}` : `drag-${op}-${Math.random()}`,
    data: { op }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className="matiks-tile matiks-elevated"
      style={{
        color: 'var(--matiks-yellow)',
        borderColor: isSelected ? '#fff' : 'var(--matiks-yellow)',
        backgroundColor: 'var(--matiks-surface)',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        zIndex: isDragging ? 100 : 1,
        boxShadow: isSelected ? '0 0 12px rgba(255,255,255,0.5)' : undefined
      }}
    >
      {op}
    </div>
  );
};

const DroppableSlot = ({ id, op, onRemove, isSelected = false, onClick }: { id: string, op: string | null, onRemove: () => void, isSelected?: boolean, onClick?: () => void }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  let classNames = "matiks-slot";
  if (op) classNames += " filled";
  if (isOver) classNames += " is-over";

  return (
    <div
      ref={setNodeRef}
      onClick={onClick || (op ? onRemove : undefined)}
      className={classNames}
      style={{
        cursor: 'pointer',
        margin: '0 4px',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        borderColor: isSelected ? '#fff' : undefined,
        boxShadow: isSelected ? '0 0 12px rgba(255,255,255,0.3)' : undefined
      }}
    >
      {op || ''}
    </div>
  );
};

const GAME_DURATION_SECONDS = 180;

export const EquateGame: React.FC<EquateGameProps> = ({ onExit }) => {
  const [workerReady, setWorkerReady] = useState(false);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null]);
  const [liveTotal, setLiveTotal] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'won' | 'gameover'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const [activeDragOp, setActiveDragOp] = useState<string | null>(null);
  
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION_SECONDS);
  const [score, setScore] = useState<number>(0);

  const [selectedOp, setSelectedOp] = useState<string | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    const worker = new PyodideWorker();
    workerRef.current = worker;

    worker.onmessage = (e) => {
      if (e.data.type === 'PYODIDE_READY') {
        setWorkerReady(true);
        worker.postMessage({ type: 'GENERATE_PUZZLE' });
      } else if (e.data.type === 'PUZZLE_GENERATED') {
        setPuzzle(e.data.payload);
        setSlots([null, null, null]);
        setLiveTotal(null);
        setGameState(prev => prev === 'loading' || prev === 'won' ? 'playing' : prev);
      } else if (e.data.type === 'ERROR') {
        console.error("Pyodide Error: ", e.data.error);
        setErrorMsg(e.data.error);
      }
    };
    
    worker.onerror = (e) => {
      console.error("Worker error: ", e);
      setErrorMsg(e.message || "Failed to load Web Worker");
    };

    return () => worker.terminate();
  }, []);

  // Timer Effect
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameState('gameover');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Live Evaluator Effect
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (puzzle && !slots.includes(null)) {
      const tokens = [
        puzzle.tiles[0], slots[0]!,
        puzzle.tiles[1], slots[1]!,
        puzzle.tiles[2], slots[2]!,
        puzzle.tiles[3]
      ];
      const result = evaluateMathExpression(tokens);
      setLiveTotal(result);

      if (result === puzzle.target) {
        setGameState('won');
        setScore(s => s + 5);
        setTimeout(() => {
          if (timeLeft > 0) {
            workerRef.current?.postMessage({ type: 'GENERATE_PUZZLE' });
          }
        }, 1500);
      }
    } else {
      setLiveTotal(null);
    }
  }, [slots, puzzle, gameState, timeLeft]);

  const handleDragStart = (e: DragStartEvent) => {
    setActiveDragOp(e.active.data.current?.op);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragOp(null);
    const { active, over } = e;
    
    // pointerWithin will return the closest slot the pointer is actually inside
    if (over && over.id.toString().startsWith('slot-')) {
      const slotIndex = parseInt(over.id.toString().split('-')[1], 10);
      const op = active.data.current?.op;
      if (op) {
        setSlots(prev => {
          const newSlots = [...prev];
          newSlots[slotIndex] = op;
          return newSlots;
        });
      }
    }
  };

  const handleRemoveOperator = (index: number) => {
    if (gameState === 'won' || gameState === 'gameover') return;
    setSlots(prev => {
      const newSlots = [...prev];
      newSlots[index] = null;
      return newSlots;
    });
    if (selectedSlotIndex === index) setSelectedSlotIndex(null);
  };

  const handleTrayOpClick = (op: string) => {
    if (gameState === 'won' || gameState === 'gameover') return;
    
    if (selectedSlotIndex !== null) {
      setSlots(prev => {
        const newSlots = [...prev];
        newSlots[selectedSlotIndex] = op;
        return newSlots;
      });
      setSelectedSlotIndex(null);
      setSelectedOp(null);
    } else {
      setSelectedOp(prev => prev === op ? null : op);
    }
  };

  const handleSlotClick = (index: number) => {
    if (gameState === 'won' || gameState === 'gameover') return;

    if (slots[index]) {
      handleRemoveOperator(index);
    } else if (selectedOp !== null) {
      setSlots(prev => {
        const newSlots = [...prev];
        newSlots[index] = selectedOp;
        return newSlots;
      });
      setSelectedOp(null);
      setSelectedSlotIndex(null);
    } else {
      setSelectedSlotIndex(prev => prev === index ? null : index);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (gameState === 'loading') {
    return (
      <div className="flex-center matiks-grid-bg" style={{ minHeight: '100vh', flexDirection: 'column', gap: '24px', backgroundColor: 'var(--matiks-bg)' }}>
        <Loader2 size={64} className="animate-spin text-yellow" style={{ color: 'var(--matiks-yellow)' }} />
        <h2 className="heading-lg" style={{ color: '#fff', letterSpacing: '0.05em' }}>
          {workerReady ? "GENERATING PUZZLE..." : "INITIALIZING MATH ENGINE..."}
        </h2>
        {errorMsg && (
          <div style={{ color: 'var(--matiks-red)', marginTop: '16px', maxWidth: '400px', textAlign: 'center' }}>
            Error: {errorMsg}
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="flex-center matiks-grid-bg" style={{ minHeight: '100vh', flexDirection: 'column', gap: '32px', backgroundColor: 'var(--matiks-bg)' }}>
        <h1 className="heading-xl text-yellow" style={{ fontSize: '5rem', textShadow: '0 0 20px rgba(234, 179, 8, 0.3)' }}>TIME'S UP!</h1>
        <div className="matiks-card" style={{ padding: '32px 64px', textAlign: 'center', borderColor: 'var(--matiks-yellow)' }}>
          <div style={{ fontSize: '1.5rem', color: 'var(--matiks-text-secondary)', marginBottom: '8px' }}>FINAL SCORE</div>
          <div style={{ fontSize: '6rem', fontWeight: 'bold', color: '#fff', lineHeight: 1 }}>{score}</div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            className="matiks-pill matiks-pill-yellow-solid" 
            style={{ padding: '16px 32px' }}
            onClick={() => {
              setTimeLeft(GAME_DURATION_SECONDS);
              setScore(0);
              setGameState('loading');
              workerRef.current?.postMessage({ type: 'GENERATE_PUZZLE' });
            }}
          >
            <RotateCcw size={20} style={{ marginRight: '8px' }} /> PLAY AGAIN
          </button>
          <button className="matiks-pill" style={{ padding: '16px 32px', border: '2px solid #fff', color: '#fff', background: 'transparent' }} onClick={onExit}>
            MAIN MENU
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--matiks-bg)', position: 'relative', overflow: 'hidden' }}>
      <div className="matiks-equate-bg" />
      
      {/* Header */}
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <button className="matiks-btn-3d" onClick={onExit} style={{ borderRadius: '12px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        
        <div style={{ width: '48px' }}></div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="matiks-elevated" style={{ 
            background: 'var(--matiks-surface)', 
            borderRadius: '12px', 
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            minWidth: '110px'
          }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--matiks-text-secondary)', letterSpacing: '0.1em', fontWeight: 600 }}>SCORE</span>
            <span style={{ fontSize: '1.25rem', color: 'var(--matiks-yellow)', fontWeight: 'bold' }}>{score}</span>
          </div>

          {/* New Timer Box Top Right */}
          <div className="matiks-elevated" style={{ 
            background: 'var(--matiks-surface)', 
            borderRadius: '12px', 
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: timeLeft <= 30 ? 'var(--matiks-red)' : '#fff',
            fontVariantNumeric: 'tabular-nums',
            minWidth: '110px'
          }}>
            <Timer size={20} />
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'Inter', letterSpacing: '0.05em' }}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4vh', zIndex: 10 }}>
        
        {/* Equate Title Label Instead of Big Timer */}
        <div style={{ textAlign: 'center', marginBottom: '6vh' }}>
          <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--matiks-yellow)', fontFamily: 'Inter', letterSpacing: '0.1em', lineHeight: 1 }}>
            EQUATE
          </div>
        </div>

        {puzzle && (
          <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            
            {/* Target Display */}
            <div style={{ 
              fontSize: '5rem', 
              fontWeight: 800, 
              color: gameState === 'won' ? 'var(--matiks-green)' : '#fff', 
              fontFamily: 'Inter',
              marginBottom: '4vh',
              transition: 'color 0.3s',
              textShadow: gameState === 'won' ? '0 0 20px rgba(74,222,128,0.5)' : 'none'
            }}>
              {puzzle.target}
            </div>

            {/* Puzzle Board */}
            <div className="matiks-elevated" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: 'var(--matiks-surface)', 
              padding: '16px 12px', 
              borderRadius: '24px',
              border: `2px solid ${gameState === 'won' ? 'var(--matiks-green)' : liveTotal !== null && liveTotal !== puzzle.target ? 'var(--matiks-red)' : 'var(--matiks-border)'}`,
              marginBottom: '24px',
              transition: 'border-color 0.3s'
            }}>
              {puzzle.tiles.map((num, i) => (
                <React.Fragment key={`tile-${i}`}>
                  <div className="matiks-tile">
                    {num}
                  </div>
                  {i < 3 && (
                    <DroppableSlot 
                      id={`slot-${i}`} 
                      op={slots[i]} 
                      onRemove={() => handleRemoveOperator(i)}
                      isSelected={selectedSlotIndex === i}
                      onClick={() => handleSlotClick(i)}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Live Evaluator Output */}
            <div style={{ 
              height: '40px', 
              fontSize: '1.5rem', 
              fontWeight: 600, 
              color: liveTotal === puzzle.target ? 'var(--matiks-green)' : liveTotal !== null ? 'var(--matiks-red)' : 'var(--matiks-text-secondary)',
              letterSpacing: '0.05em'
            }}>
              {liveTotal !== null ? `= ${liveTotal}` : 'DRAG OPERATORS'}
            </div>

            {/* Operator Tray */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '6vh' }}>
              {['+', '-', '×', '÷'].map(op => (
                <DraggableOperator 
                  key={op} 
                  op={op} 
                  isTray 
                  isSelected={selectedOp === op}
                  onClick={() => handleTrayOpClick(op)}
                />
              ))}
            </div>

            <DragOverlay dropAnimation={null}>
              {activeDragOp ? (
                <div className="matiks-tile matiks-elevated" style={{
                  color: 'var(--matiks-yellow)',
                  borderColor: 'var(--matiks-yellow)',
                  backgroundColor: 'var(--matiks-surface)',
                  boxShadow: '0 8px 16px rgba(234, 179, 8, 0.3)'
                }}>
                  {activeDragOp}
                </div>
              ) : null}
            </DragOverlay>

          </DndContext>
        )}

      </div>
    </div>
  );
};
