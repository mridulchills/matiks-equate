Here is the complete, detailed Product Requirements Document (PRD) tailored specifically for a **React \+ Pyodide (WebAssembly)** architecture.

# **MATIKS: Generative Math Engine (WebAssembly Architecture)**

## **Product Requirements Document (PRD) v1.0**

### **Document Metadata**

| Metadata | Details |
| :---- | :---- |
| **Product** | Standalone Math Puzzle Game |
| **Architecture** | Client-Side Serverless (React \+ Pyodide) |
| **Engine Focus** | Forward Permutation Generation |
| **Hosting** | Static Edge (Vercel / GitHub Pages) |

## **1\. Executive Summary**

**The Concept:** A fast, addictive arithmetic puzzle. The game generates a unique target number and four base numbers. The player must drag and drop the four basic operators ($+$, $-$, $\\times$, $\\div$) into three slots to create an equation that equals the target, following strict mathematical order of operations (PEMDAS) without using parentheses.

**The Engineering Edge:** Instead of spinning up a backend API, the mathematical generator is written in Python and executed directly inside the user's browser using Pyodide (Python compiled to WebAssembly). The React frontend handles the UI and real-time drag-and-drop interactions, resulting in a zero-latency, server-free application.

## **2\. Core Gameplay Loop**

1. **App Load:** Pyodide initializes in the background via a Web Worker.  
2. **Generation:** The React app requests a puzzle. The Pyodide Web Worker computes all valid PEMDAS permutations for a random set of numbers, selects a valid integer target, and returns the payload to React.  
3. **The Board:** The user sees four number tiles and an empty equation template.  
4. **Interaction:** The user drags operators from the tray into the slots.  
5. **Real-Time Feedback:** React evaluates the user's current equation instantly on every drop and displays the live total.  
6. **Win State:** If the live total matches the target, the UI triggers a success animation and instantly fetches the next puzzle.

## **3\. System Architecture & Tech Stack**

This architecture is entirely stateless and client-heavy.

| Layer | Technology | Purpose |
| :---- | :---- | :---- |
| **Frontend Framework** | React (Vite) | Fast compilation, component state management, and DOM updates. |
| **Drag and Drop** | @dnd-kit/core | Lightweight, accessible drag-and-drop primitives for the operator tiles. |
| **Game Engine** | Python (Pyodide) | Handles the complex permutation math, division-remainder checks, and target selection in WebAssembly. |
| **Concurrency** | Web Workers API | Runs the Pyodide Python engine on a background thread so the 8MB runtime load doesn't freeze the React UI. |
| **Client Evaluator** | JavaScript | Evaluates the user's input instantly. (Calling Python for every UI drop is too slow; JS handles the live validation). |

## **4\. The Python Engine (Pyodide Integration)**

The engine does not guess; it calculates every possible outcome. Because Python handles the heavy algorithmic lifting, the script must be self-contained so Pyodide can evaluate it.

### **4.1 The Python Script (generator.py)**

This script will be loaded into the browser memory. It performs a **Forward Computation Match**:

1. Picks 4 random integers (e.g., 2–12).  
2. Generates all $4^3 \= 64$ operator permutations.  
3. Evaluates them linearly but respects multiplication/division first.  
4. Discards fractional or negative results.  
5. Returns a JSON string of the valid puzzle.

### **4.2 The Engine Output Payload**

When the Web Worker calls the Python function, it returns a strictly formatted JSON payload to React:

JSON  
{  
  "tiles": \[7, 2, 8, 3\],  
  "target": 31,  
  "hint": \["+", "×", "+"\]   
}

*(The hint sequence is stored in React state in case the user clicks a "Help" button, but is otherwise hidden).*

## **5\. The React Frontend**

React acts as the presentation and immediate validation layer.

### **5.1 Component Hierarchy**

* **\<GameContainer /\>**: Manages the global state (current puzzle, score, streak).  
* **\<PyodideLoader /\>**: A visual loading screen ("Initializing Math Engine...") while the Web Worker downloads the Python WASM binary on initial load.  
* **\<PuzzleBoard /\>**: The main drag-and-drop context.  
  * **\<NumberTile /\>**: Fixed position, non-draggable.  
  * **\<OperatorDropZone /\>**: The three slots between the numbers.  
* **\<OperatorTray /\>**: The fixed bank of draggable $+$, $-$, $\\times$, $\\div$ symbols.  
* **\<LiveEvaluator /\>**: Reads the current contents of the Drop Zones and computes the math in real-time.

### **5.2 The Real-Time Evaluation Trick**

To ensure the UI feels instantly tactile, **do not use Python to check the user's answer**.

When the user drops an operator into a slot, React builds an array: \[7, "+", 2, "×", 8, "+", 3\]. You will write a simple JavaScript function to calculate this using PEMDAS. Because the array is tiny, JavaScript executes it in less than a millisecond, updating the \<LiveEvaluator /\> display flawlessly.

## **6\. Development Phasing (The Build Plan)**

### **Phase 1: Engine Prototyping (Python)**

* **Goal:** Nail the math.  
* **Action:** Write the generator.py script locally on your machine. Ensure it only produces whole-number, positive targets that can be reached using strict mathematical order of operations without parentheses.  
* **Output:** A working Python function that returns a JSON string.

### **Phase 2: The Pyodide Web Worker Bridge (Crucial Step)**

* **Goal:** Run Python in the browser without lagging the UI.  
* **Action:** Set up a Vite \+ React project. Install pyodide. Create a standard JavaScript WebWorker. Have the worker download Pyodide, load your generator.py script as a string, and set up a message listener to trigger puzzle generation.

### **Phase 3: Building the React UI**

* **Goal:** Create the drag-and-drop board.  
* **Action:** Implement @dnd-kit. Hardcode a dummy puzzle payload (e.g., tiles: \[1,2,3,4\], target: 10) to perfect the dropping mechanics, snap animations, and slot state management.

### **Phase 4: Integration & Client-Side Validation**

* **Goal:** Tie the Worker to the UI.  
* **Action:** Connect the "Next Puzzle" button to post a message to the Web Worker. When the worker replies with the Python JSON, update the React state. Write the JS PEMDAS function to read the active slots and compare the result against the target.

### **Phase 5: Polish & Edge Deploy**

* **Goal:** Make it feel like a premium game.  
* **Action:** Add CSS animations (confetti on win, shake on wrong answer). Deploy the static bundle to Vercel.

## **7\. Edge Cases & UX Solutions**

| Risk / Edge Case | Engineering Solution |
| :---- | :---- |
| **Initial Load Time:** Pyodide takes 2-4 seconds to download the WASM binary on first visit. | Build an engaging CSS loader screen. Once cached by the browser, subsequent visits to the site will be instant. |
| **Impossible Math:** A user places a division sign where it causes a fraction (e.g., $7 \\div 2$). | The JS live evaluator should gracefully display "..." or a red warning icon instead of crashing or showing long decimals. |
| **No Solution:** Generating a totally random set of numbers might yield zero whole-number targets. | The Python engine uses a while True: loop. If a specific set of 4 random numbers yields zero valid PEMDAS combinations, it discards them and tries a new set of 4 until it finds a valid puzzle to return. |

