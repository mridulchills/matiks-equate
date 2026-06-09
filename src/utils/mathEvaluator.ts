export function evaluateMathExpression(tokens: (number | string)[]): number | null {
  if (tokens.length === 0) return null;

  // Pass 1: Multiplication and Division
  const pass1: (number | string)[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === '×' || token === '*' || token === '÷' || token === '/') {
      const prev = pass1.pop() as number;
      const next = tokens[++i];
      if (typeof next !== 'number') return null; // Invalid expression format
      
      if (token === '×' || token === '*') {
        pass1.push(prev * next);
      } else {
        if (next === 0) return null; // Divide by zero
        pass1.push(prev / next);
      }
    } else {
      pass1.push(token);
    }
  }

  if (pass1.length === 0) return null;

  // Pass 2: Addition and Subtraction
  let result = pass1[0] as number;
  for (let i = 1; i < pass1.length; i += 2) {
    const op = pass1[i] as string;
    const next = pass1[i + 1];
    if (typeof next !== 'number') return null;

    if (op === '+') {
      result += next;
    } else if (op === '-') {
      result -= next;
    }
  }

  return result;
}
