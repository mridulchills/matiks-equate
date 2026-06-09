import React from 'react';
import type { MatiksGame, RuleSheetInput } from '../types';

interface RuleSheetProps {
  game: MatiksGame;
  onUpdate: (updated: MatiksGame) => void;
}

export const RuleSheet: React.FC<RuleSheetProps> = ({ game, onUpdate }) => {
  const { rule_sheet } = game.config;

  const updateInput = (id: string, updates: Partial<RuleSheetInput>) => {
    onUpdate({
      ...game,
      config: {
        ...game.config,
        rule_sheet: {
          ...rule_sheet,
          inputs: {
            ...rule_sheet.inputs,
            [id]: { ...rule_sheet.inputs[id], ...updates }
          }
        }
      }
    });
  };

  const updateExpression = (expr: string) => {
    onUpdate({
      ...game,
      config: { ...game.config, rule_sheet: { ...rule_sheet, expression: expr } }
    });
  };

  const updateWinCondition = (target: number | string) => {
    onUpdate({
      ...game,
      config: { ...game.config, rule_sheet: { ...rule_sheet, win_condition: { ...rule_sheet.win_condition, target } } }
    });
  };

  return (
    <div style={{
      width: '400px',
      backgroundColor: 'var(--matiks-surface)',
      borderLeft: '1px solid var(--matiks-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflowY: 'auto'
    }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--matiks-border)' }}>
        <h3 style={{ margin: 0, fontFamily: 'Inter', fontSize: '1.25rem', color: '#fff' }}>Rule Sheet</h3>
        <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--matiks-text-secondary)' }}>
          Configure game logic and evaluations.
        </p>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* INPUT DEFINITIONS */}
        <section>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--matiks-yellow)' }}>INPUT DEFINITIONS</h4>
          {Object.entries(rule_sheet.inputs).length === 0 ? (
            <div style={{ color: 'var(--matiks-text-secondary)', fontSize: '0.875rem' }}>No inputs registered. Drag a Number Tile to the canvas.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(rule_sheet.inputs).map(([id, input]) => (
                <div key={id} style={{ padding: '12px', backgroundColor: 'var(--matiks-bg)', borderRadius: '8px', border: '1px solid var(--matiks-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#fff' }}>Variable [{id}]</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--matiks-text-secondary)', fontSize: '0.875rem' }}>Range:</span>
                    <input
                      type="number"
                      value={input.min ?? 1}
                      onChange={(e) => updateInput(id, { min: parseInt(e.target.value) })}
                      style={{ width: '60px', background: 'var(--matiks-surface)', color: '#fff', border: '1px solid var(--matiks-border)', borderRadius: '4px', padding: '4px 8px' }}
                    />
                    <span style={{ color: 'var(--matiks-text-secondary)' }}>to</span>
                    <input
                      type="number"
                      value={input.max ?? 9}
                      onChange={(e) => updateInput(id, { max: parseInt(e.target.value) })}
                      style={{ width: '60px', background: 'var(--matiks-surface)', color: '#fff', border: '1px solid var(--matiks-border)', borderRadius: '4px', padding: '4px 8px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* EXPRESSION BUILDER */}
        <section>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--matiks-yellow)' }}>EXPRESSION BUILDER</h4>
          <div style={{ padding: '16px', backgroundColor: 'var(--matiks-bg)', borderRadius: '8px', border: '1px solid var(--matiks-border)' }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.875rem', color: 'var(--matiks-text-secondary)' }}>
              Write the expression using variables and operator IDs (e.g. A op1 B).
            </p>
            <input
              type="text"
              value={rule_sheet.expression}
              onChange={(e) => updateExpression(e.target.value)}
              placeholder="A op1 B op2 C op3 D"
              style={{
                width: '100%',
                background: 'var(--matiks-surface)',
                color: '#fff',
                border: '1px solid var(--matiks-border)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '1rem',
                fontFamily: 'monospace'
              }}
            />
          </div>
        </section>

        {/* WIN CONDITION */}
        <section>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--matiks-yellow)' }}>WIN CONDITION</h4>
          <div style={{ padding: '16px', backgroundColor: 'var(--matiks-bg)', borderRadius: '8px', border: '1px solid var(--matiks-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ color: '#fff' }}>Expression</span>
              <select style={{ background: 'var(--matiks-surface)', color: '#fff', border: '1px solid var(--matiks-border)', borderRadius: '4px', padding: '4px 8px' }}>
                <option value="equals">equals</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--matiks-text-secondary)', fontSize: '0.875rem' }}>Target:</span>
              <input
                type="number"
                value={rule_sheet.win_condition.target as number ?? 24}
                onChange={(e) => updateWinCondition(parseInt(e.target.value))}
                style={{ width: '80px', background: 'var(--matiks-surface)', color: '#fff', border: '1px solid var(--matiks-border)', borderRadius: '4px', padding: '4px 8px' }}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
