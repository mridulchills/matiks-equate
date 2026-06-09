import { useState, useEffect } from 'react';
import type { MatiksGame } from '../types';
import { X, Timer as TimerIcon } from 'lucide-react';

interface PreviewModeProps {
  gameConfig: MatiksGame;
  onExit: () => void;
}

export const PreviewMode: React.FC<PreviewModeProps> = ({ gameConfig, onExit }) => {
  const [round, setRound] = useState(1);
  const totalRounds = gameConfig.config.rounds || 5;
  
  const globalTimer = gameConfig.config.time_limit?.type !== 'none' ? gameConfig.config.time_limit?.seconds : null;
  const baseTime = globalTimer || 30;

  const [timeLeft, setTimeLeft] = useState(baseTime);
  const [gameState, setGameState] = useState<'playing' | 'correct' | 'incorrect' | 'finished'>('playing');
  
  const [inputValues, setInputValues] = useState<Record<string, number>>({});
  const [operatorValues, setOperatorValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (gameState === 'playing') {
      const vals: Record<string, number> = {};
      const { inputs } = gameConfig.config.rule_sheet;
      for (const [key, input] of Object.entries(inputs)) {
        const min = input.min ?? 1;
        const max = input.max ?? 9;
        vals[key] = Math.floor(Math.random() * (max - min + 1)) + min;
      }
      setInputValues(vals);

      const ops: Record<string, string> = {};
      gameConfig.config.layout.components.forEach(c => {
        if (c.type === 'operator_input') {
          ops[c.id] = '+';
        }
      });
      setOperatorValues(ops);
      setTimeLeft(baseTime);
    }
  }, [round, gameState, gameConfig, baseTime]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('incorrect');
          setTimeout(() => handleNextRound(), 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  const handleNextRound = () => {
    if (round >= totalRounds) {
      setGameState('finished');
    } else {
      setRound(r => r + 1);
      setGameState('playing');
    }
  };

  const handleSubmit = () => {
    if (gameState !== 'playing') return;

    let exprStr = gameConfig.config.rule_sheet.expression;
    
    // Replace inputs
    Object.keys(inputValues).forEach(k => {
      exprStr = exprStr.replace(new RegExp(`\\b${k}\\b`, 'g'), inputValues[k].toString());
    });
    
    // Replace ops
    Object.keys(operatorValues).forEach(k => {
      const op = operatorValues[k];
      const jsOp = op === '×' ? '*' : op === '÷' ? '/' : op;
      exprStr = exprStr.replace(new RegExp(`\\b${k}\\b`, 'g'), jsOp);
    });

    try {
      // Evaluate left-to-right math
      const result = new Function(`return ${exprStr}`)();
      const target = gameConfig.config.rule_sheet.win_condition.target;
      
      // We can also parse win condition correctly here
      if (result === target) {
        setGameState('correct');
        setTimeout(() => handleNextRound(), 1000);
      } else {
        setGameState('incorrect');
        setTimeout(() => handleNextRound(), 1000);
      }
    } catch (e) {
      console.error("Evaluation error", e);
      setGameState('incorrect');
      setTimeout(() => handleNextRound(), 1000);
    }
  };

  if (gameState === 'finished') {
    return (
      <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: '24px', backgroundColor: 'var(--matiks-bg)' }}>
        <h1 className="heading-xl text-yellow">CHALLENGE COMPLETE</h1>
        <button className="matiks-pill matiks-pill-yellow-solid" onClick={onExit}>EXIT PREVIEW</button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--matiks-bg)', position: 'relative' }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', position: 'absolute', top: 0, left: 0, right: 0 }}>
        <button onClick={onExit} style={{ background: 'var(--matiks-surface)', border: 'none', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
          <X size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fff', borderRadius: '8px', padding: '6px 12px' }}>
          <TimerIcon size={16} />
          <span style={{ fontFamily: 'Inter', fontWeight: 600 }}>0:{timeLeft.toString().padStart(2, '0')}</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', paddingTop: '40px', fontSize: '1.25rem', color: 'var(--matiks-text-secondary)', fontFamily: 'Inter', fontWeight: 500 }}>
        {round}/{totalRounds}
      </div>

      {/* Gameplay Area */}
      <div className="flex-center" style={{ flex: 1, flexDirection: 'column' }}>
        
        <div 
          style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '16px', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '24px',
            backgroundColor: gameState === 'correct' ? 'rgba(74, 222, 128, 0.1)' : gameState === 'incorrect' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
            borderRadius: '24px',
            transition: 'background-color 0.3s'
          }}
        >
          {gameConfig.config.layout.components.map(comp => {
            if (comp.type === 'number_tile') {
              return (
                <div key={comp.id} className="matiks-card animate-fade-in" style={{ fontSize: '2.5rem', fontWeight: 600, padding: '16px 24px', backgroundColor: 'var(--matiks-surface)', color: '#fff', borderRadius: '16px', border: '1px solid var(--matiks-border)' }}>
                  {inputValues[comp.id]}
                </div>
              );
            }
            if (comp.type === 'operator_input') {
              return (
                <select 
                  key={comp.id} 
                  value={operatorValues[comp.id] || '+'} 
                  onChange={e => setOperatorValues(prev => ({ ...prev, [comp.id]: e.target.value }))}
                  style={{ 
                    fontSize: '2rem', 
                    padding: '16px', 
                    backgroundColor: 'var(--matiks-surface)', 
                    color: 'var(--matiks-yellow)', 
                    border: '1px solid var(--matiks-yellow)', 
                    borderRadius: '16px', 
                    outline: 'none', 
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                  disabled={gameState !== 'playing'}
                >
                  <option value="+">+</option>
                  <option value="-">-</option>
                  <option value="*">×</option>
                  <option value="/">÷</option>
                </select>
              );
            }
            if (comp.type === 'target_display') {
              return (
                <div key={comp.id} style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', marginLeft: '16px' }}>
                  = {comp.value}
                </div>
              );
            }
            if (comp.type === 'submit_button') {
              return (
                <button 
                  key={comp.id} 
                  onClick={handleSubmit} 
                  className="matiks-pill matiks-pill-yellow-solid" 
                  style={{ fontSize: '1.25rem', padding: '16px 32px', marginLeft: '24px' }}
                  disabled={gameState !== 'playing'}
                >
                  Submit
                </button>
              );
            }
            return null;
          })}
        </div>

        {gameState === 'correct' && <div style={{ color: 'var(--matiks-green)', fontSize: '1.5rem', fontWeight: 600, marginTop: '24px' }}>Correct!</div>}
        {gameState === 'incorrect' && <div style={{ color: 'var(--matiks-red)', fontSize: '1.5rem', fontWeight: 600, marginTop: '24px' }}>Incorrect</div>}
        
      </div>
    </div>
  );
};
