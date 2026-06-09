export type ComponentType = 'number_tile' | 'operator_input' | 'target_display' | 'answer_input' | 'timer' | 'submit_button';

export interface GameComponent {
  id: string; // The label/id (e.g. A, B, op1)
  type: ComponentType;
  position: number;
  value?: number | string; // For static displays like target_display
}

export interface RuleSheetInput {
  type: 'random_int' | 'random_decimal' | 'static';
  min?: number;
  max?: number;
  value?: number;
}

export interface WinCondition {
  type: 'equals' | 'less_than' | 'greater_than' | 'closest_to';
  target?: number | string; // Target could be a number or a reference to a target_display ID
}

export interface RuleSheet {
  inputs: Record<string, RuleSheetInput>;
  expression: string; // e.g. "A op1 B op2 C op3 D"
  win_condition: WinCondition;
}

export interface GameConfig {
  rounds: number;
  time_limit: {
    type: 'per_question' | 'per_game' | 'none';
    seconds: number;
  };
  layout: {
    components: GameComponent[];
  };
  rule_sheet: RuleSheet;
}

export interface MatiksGame {
  game_id: string;
  creator: {
    user_id: string;
    username: string;
  };
  meta: {
    name: string;
    category: string;
    difficulty: string;
    visibility: string;
  };
  config: GameConfig;
}
