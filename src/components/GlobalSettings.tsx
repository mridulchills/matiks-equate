import React from 'react';
import type { MatiksGame } from '../types';
import { X } from 'lucide-react';

interface GlobalSettingsProps {
  game: MatiksGame;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: MatiksGame) => void;
}

export const GlobalSettings: React.FC<GlobalSettingsProps> = ({ game, isOpen, onClose, onUpdate }) => {
  if (!isOpen) return null;

  const updateMeta = (field: string, value: string) => {
    onUpdate({
      ...game,
      meta: { ...game.meta, [field]: value }
    });
  };

  const updateConfig = (field: string, value: any) => {
    onUpdate({
      ...game,
      config: { ...game.config, [field]: value }
    });
  };

  const updateTimeLimit = (field: string, value: any) => {
    onUpdate({
      ...game,
      config: {
        ...game.config,
        time_limit: { ...game.config.time_limit, [field]: value }
      }
    });
  };

  return (
    <div className="bottom-sheet open" style={{ maxHeight: '80vh', overflowY: 'auto', zIndex: 100 }}>
      <div className="bottom-sheet-handle" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 className="heading-lg" style={{ margin: 0 }}>Global Settings</h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--matiks-text-primary)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--matiks-text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Game Name</label>
          <input 
            type="text" 
            className="matiks-input" 
            value={game.meta.name} 
            onChange={(e) => updateMeta('name', e.target.value)} 
            maxLength={40}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--matiks-text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Category</label>
          <select className="matiks-input" value={game.meta.category} onChange={(e) => updateMeta('category', e.target.value)}>
            <option value="arithmetic">Arithmetic</option>
            <option value="logic">Logic</option>
            <option value="speed">Speed</option>
            <option value="memory">Memory</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--matiks-text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Difficulty</label>
          <select className="matiks-input" value={game.meta.difficulty} onChange={(e) => updateMeta('difficulty', e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--matiks-text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Number of Rounds</label>
          <select className="matiks-input" value={game.config.rounds} onChange={(e) => updateConfig('rounds', parseInt(e.target.value))}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--matiks-text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Time Mode</label>
          <select className="matiks-input" value={game.config.time_limit.type} onChange={(e) => updateTimeLimit('type', e.target.value)}>
            <option value="per_question">Per Question</option>
            <option value="per_game">Per Game</option>
            <option value="none">None</option>
          </select>
        </div>

        {game.config.time_limit.type !== 'none' && (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--matiks-text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Time Limit (Seconds)</label>
            <select className="matiks-input" value={game.config.time_limit.seconds} onChange={(e) => updateTimeLimit('seconds', parseInt(e.target.value))}>
              <option value="5">5s</option>
              <option value="10">10s</option>
              <option value="15">15s</option>
              <option value="30">30s</option>
              <option value="60">1m</option>
              <option value="120">2m</option>
            </select>
          </div>
        )}

        <button 
          className="matiks-pill matiks-pill-yellow-solid" 
          style={{ width: '100%', marginTop: '16px' }}
          onClick={onClose}
        >
          DONE
        </button>
      </div>
    </div>
  );
};
