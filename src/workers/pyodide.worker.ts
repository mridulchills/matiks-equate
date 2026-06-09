/// <reference lib="webworker" />

declare const self: DedicatedWorkerGlobalScope;

let pyodideReadyPromise: Promise<any>;
let pyodideInstance: any = null;

async function initPyodide() {
  // Use dynamic import so Vite/Rollup doesn't try to bundle the external CDN URL during production build
  // @ts-ignore - TS cannot resolve URL modules natively
  const pyodideModule = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.mjs');
  const loadPyodide = pyodideModule.loadPyodide;

  // Load Pyodide
  const pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
  });
  
  // Fetch our python logic
  // The worker runs from the bundled JS, but /generator.py should be served from public
  const response = await fetch('/generator.py');
  if (!response.ok) {
    throw new Error('Failed to load generator.py');
  }
  const pythonCode = await response.text();
  
  // Execute the python definitions
  await pyodide.runPythonAsync(pythonCode);

  // Send ready signal
  self.postMessage({ type: 'PYODIDE_READY' });

  return pyodide;
}

pyodideReadyPromise = initPyodide();

self.onmessage = async (event) => {
  if (event.data.type === 'GENERATE_PUZZLE') {
    try {
      pyodideInstance = pyodideInstance || await pyodideReadyPromise;
      // Evaluate the Python function which returns a JSON string
      const result = await pyodideInstance.runPythonAsync('generate_puzzle()');
      self.postMessage({ type: 'PUZZLE_GENERATED', payload: JSON.parse(result) });
    } catch (e: any) {
      self.postMessage({ type: 'ERROR', error: e.message });
    }
  }
};
