---
authors: ["Megacodist"]
status: "wip"
---
# Who's the Boss? The 5 Levels of React Data Mastery

Every React developer eventually hits the same wall. Your form works... until it doesn't. Your components sync perfectly... until they mysteriously fall out of step. You sprinkle `useState` everywhere hoping something sticks.

The problem isn't your code—it's a missing mental model.

This guide presents a five-level framework for understanding data management in React. By the end, you'll have a clear mental map that scales from simple forms to professional library-grade patterns.

---

## Table of Contents

- [Level 1: Understanding Component Memory](#level-1-understanding-component-memory-the-three-buckets)
- [Level 2: Who's the Boss?](#level-2-whos-the-boss-controlled-vs-uncontrolled)
- [Level 3: Sharing Data Between Components](#level-3-sharing-data-between-components-lifting-state-up)
- [Level 4: Building Flexible Components](#level-4-building-flexible-components-the-control-props-pattern)
- [Level 5: Mixing Strategies for Performance](#level-5-mixing-strategies-for-performance)
- [The Teacher's Ledger Analogy](#the-teachers-ledger-analogy)
- [Cheat Sheet](#cheat-sheet)

---

## Level 1: Understanding Component Memory (The Three Buckets)

Every variable inside a React component belongs to one of three buckets. Choosing the wrong bucket causes mysterious bugs—values that reset unexpectedly, infinite loops, or wasted re-renders.

---

### The Problem

```tsx
function BrokenCounter(): JSX.Element {
  let count = 0;

  const handleClick = (): void => {
    count += 1;
    console.log(count); // Logs 1, 2, 3, 4 ... after an external re-render 1, 2, 3, ...
  };

  return (
    <button onClick={handleClick}>
      Clicked {count} times {/* Always shows 0 */}
    </button>
  );
}
```

Any changes to `count` do not trigger a re-render, so the button text remains the same (`Clicked 0 times`) while the log continues to increment (1, 2, 3...) because the variable persists in memory.

However, upon any **external re-render** (parent state change, prop update, context changes, hook updates etc.), the component function runs again from the top. This executes `let count = 0` again, wiping out your progress. The next click starts from `0 + 1`, so the log goes back to starting from 1.

---

## The Three Buckets

| Bucket | Syntax | Persists? | Triggers Re-render? | Use For |
|--------|--------|-----------|---------------------|---------|
| Regular Variables | `const` / `let` | ❌ No | — | Derived values, calculations |
| Private State<br>Non-rendering state | `useRef` | ✅ Yes | ❌ No | DOM refs, timers, silent counters |
| Public State | `useState` | ✅ Yes | ✅ Yes | Anything the UI displays |

---

## The Decision Flowchart

```
Does it need to persist between renders?
│
├─ NO  → Regular variable (const/let)
│
└─ YES → Does changing it need to update the UI?
         │
         ├─ NO  → useRef
         │
         └─ YES → useState
```

---

## Example 1

In this example, we track the time, manage the timer's technical ID, and calculate the display string—all using the three different memory types.

```tsx
import { useState, useRef } from 'react';

const Stopwatch = () => {
  // --- BUCKET 1: Public State (The UI Driver) ---
  // When 'now' updates, the clock on the screen ticks.
  const [startTime, setStartTime] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);

  // --- BUCKET 2: Private State (The Logic Manager) ---
  // This persists so we can stop the timer, but changing it 
  // doesn't trigger a re-render. The user never sees this ID.
  const timerRef = useRef<number | null>(null);

  // --- BUCKET 3: Regular Variable (The Transient Snapshot) ---
  // This is recalculated from scratch every single time the component renders.
  // It doesn't "survive"; it is simply a byproduct of the current state.
  const secondsElapsed = (now !== null && startTime !== null) 
    ? (now - startTime) / 1000 
    : 0;

  const handleStart = () => {
    const start = Date.now();
    setStartTime(start);
    setNow(start);

    if (timerRef.current) clearInterval(timerRef.current);

    // Saving to Bucket 2 (Ref)
    timerRef.current = window.setInterval(
      () => {
        // Updating Bucket 1 (State) -> Triggers Re-render
        setNow(Date.now());
      },
      10  // Every 10 milliseconds
    );
  };

  const handleStop = () => {
    // Accessing Bucket 2 to stop the logic
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {/* Displaying Bucket 3 (Calculated on the fly) */}
      <h1>{secondsElapsed.toFixed(3)}s</h1>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={handleStart}>Start</button>
        <button onClick={handleStop}>Stop</button>
      </div>

      <p style={{ fontSize: '12px', color: 'gray' }}>
        Timer ID (Ref): {timerRef.current ?? 'None'} 
        <br />
        (Notice: The ID above won't update on screen until the next state render!)
      </p>
    </div>
  );
};

export default Stopwatch;
```

**The State (`now`)**

*   **Why it's here:** We need the numbers on the screen to change every 10ms.

*   **What happens if we used a Ref instead?** The internal number would change, but the screen would look "frozen" at 0.000s.

**The Ref (`timerRef`)**

*   **Why it's here:** We need to remember the `intervalID` so `handleStop` can find it later.

*   **What happens if we used a Regular Variable instead?** As soon as the timer ticked once (triggering a re-render), the variable would be reset to `null`, and we would "lose" the ID. We'd never be able to stop the timer!

*   **What happens if we used State instead?** It would work, but it’s wasteful. Updating the state just to store an ID would trigger an *extra* unnecessary render every time the timer starts/stops.

**The Regular Variable (`secondsElapsed`)**

*   **Why it's here:** It’s a "derived value." We don't need to store it in memory because we can calculate it instantly using the `now` and `startTime` states.

*   **Why not use State?** If you put this in state, you'd be managing "Redundant State." If `now` changes, `secondsElapsed` *must* change. Keeping them both in state makes the component harder to debug and can lead to "out-of-sync" bugs.

## Example 2

The following component demonstrating all three buckets as well:

```tsx
import { useState, useRef } from 'react';

/**
 * Demonstrates the three buckets of React component memory.
 */
function Counter(): JSX.Element {
  // ═══════════════════════════════════════════════════════════
  // BUCKET 1: PUBLIC STATE (useState)
  // Persists across renders. Changes TRIGGER re-renders.
  // ═══════════════════════════════════════════════════════════

  /** The count value — displayed to the user */
  const [count, setCount] = useState<number>(0);

  // ═══════════════════════════════════════════════════════════
  // BUCKET 2: PRIVATE STATE (useRef)
  // Persists across renders. Changes are SILENT.
  // ═══════════════════════════════════════════════════════════

  /** 
   * Tracks total clicks including double-clicks.
   * Internal bookkeeping — not displayed, so no re-render needed.
   */
  const totalClicksRef = useRef<number>(0);

  /** Tracks render count. If this were useState, it would infinite loop! */
  const renderCountRef = useRef<number>(0);
  renderCountRef.current += 1;

  // ═══════════════════════════════════════════════════════════
  // BUCKET 3: REGULAR VARIABLES (const/let)
  // Recalculated fresh each render. Transient.
  // ═══════════════════════════════════════════════════════════

  /** Derived from count — no need to store separately */
  const doubled = count * 2;
  const isEven = count % 2 === 0;
  const label = count === 1 ? 'time' : 'times';

  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════

  const handleClick = (): void => {
    totalClicksRef.current += 1; // Silent — no re-render
    setCount(c => c + 1);        // Loud — triggers re-render
  };

  const handleDoubleClick = (): void => {
    totalClicksRef.current += 1; // Still counts!
    setCount(c => c + 2);
  };

  return (
    <div>
      <p>Count: {count} (doubled: {doubled})</p>
      <p>Clicked {count} {label}</p>
      <p>{isEven ? 'Even' : 'Odd'}</p>
      
      <button onClick={handleClick} onDoubleClick={handleDoubleClick}>
        Increment
      </button>

      {/* Peek at the "invisible" values */}
      <p style={{ color: '#888', fontSize: '12px' }}>
        Total clicks: {totalClicksRef.current} | 
        Renders: {renderCountRef.current}
      </p>
    </div>
  );
}

export default Counter;
```

### What Each Variable Demonstrates

| Variable | Bucket | Why? |
|----------|--------|------|
| `count` | Public State | User sees it; changes must update the screen |
| `totalClicksRef` | Private State | Tracks all clicks silently (including double-clicks) |
| `renderCountRef` | Private State | If this were state, incrementing would cause infinite loops |
| `doubled`, `isEven`, `label` | Regular Variables | Computed from `count`—just derive them fresh |

---

## Common Mistakes

**Using regular variables for persistent data:**
```tsx
// ❌ Resets every render
let count = 0;

// ✅ Persists
const [count, setCount] = useState(0);
```

**Using state for silent data:**
```tsx
// ❌ Causes unnecessary re-renders
const [timerId, setTimerId] = useState<number | null>(null);

// ✅ Silent storage
const timerRef = useRef<number | null>(null);
```

**Storing derived values in state:**
```tsx
// ❌ Redundant — must keep in sync manually
const [items, setItems] = useState<Item[]>([]);
const [total, setTotal] = useState<number>(0);

// ✅ Just compute it
const [items, setItems] = useState<Item[]>([]);
const total = items.reduce((sum, item) => sum + item.price, 0);
```

---

> **Level 1 Complete:** When adding a variable, ask: "Does it persist? Does it affect the UI?" Your answers lead directly to the right bucket.

---

## Level 2: Who's the Boss? (Controlled vs. Uncontrolled)

**Building on Level 1:** You now know that `useState` triggers re-renders while `useRef` stays silent. This explains why controlled components use state (React re-renders on every keystroke) and uncontrolled components use refs (React only reads the value when asked).

---

Every form input needs a boss—either **React** or the **browser**. This choice determines how data flows through your component.

---

## Uncontrolled: The Browser is the Boss

React steps back. The browser manages the input's value. React only "asks" for it when needed (via a ref).

```tsx
import { useRef, FormEvent } from 'react';

/**
 * Uncontrolled form — browser manages input values.
 * React reads them only on submit.
 */
function UncontrolledForm(): JSX.Element {
  /** Refs to "ask" the DOM for values later */
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    // Ask the DOM: "What's in there right now?"
    const name = nameRef.current?.value ?? '';
    const email = emailRef.current?.value ?? '';
    
    console.log({ name, email });
    e.currentTarget.reset(); // Native reset works!
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} defaultValue="" placeholder="Name" />
      <input ref={emailRef} defaultValue="" type="email" placeholder="Email" />
      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
    </form>
  );
}
```

**Key markers:** `defaultValue`, `ref`, no `onChange`, value read on submit.

---

## Controlled: React is the Boss

React tracks every keystroke. The input's value is bound to state.

```tsx
import { useState, ChangeEvent, FormEvent } from 'react';

/**
 * Controlled form — React manages input values.
 * Every keystroke flows through state.
 */
function ControlledForm(): JSX.Element {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  /** Derived values — recalculated each render */
  const isValid = name.length > 0 && email.includes('@');
  const charCount = name.length + email.length;

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log({ name, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        placeholder="Name"
      />
      
      <input
        value={email}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        type="email"
        placeholder="Email"
      />

      {/* Live feedback — impossible with uncontrolled */}
      <p>{charCount} characters entered</p>
      
      <button type="submit" disabled={!isValid}>
        Submit
      </button>
    </form>
  );
}
```

**Key markers:** `value`, `onChange`, state holds the truth, live UI updates.

---

## Comparison

| Aspect | Uncontrolled | Controlled |
|--------|--------------|------------|
| Value stored in | Browser (DOM) | React (state) |
| Access via | `ref.current.value` | State variable |
| Initial value | `defaultValue` | `useState(initial)` |
| Re-renders on typing | ❌ No | ✅ Yes |
| Live validation | ❌ Difficult | ✅ Easy |
| Input formatting | ❌ Not possible | ✅ Easy |
| Native reset | ✅ Automatic | ❌ Manual |

---

## When to Use Which

**Uncontrolled:**
- File inputs (required by browsers)
- Simple submit-only forms
- Performance-critical forms with many fields
- When native HTML validation suffices

**Controlled:**
- Live validation ("Password too short")
- Conditional UI (disable button until valid)
- Input formatting (phone numbers, credit cards)
- When one input affects another

---

> **Level 2 Complete:** For most React applications, **controlled components are recommended** because they provide predictable data flow. But now you know when uncontrolled is the right tool—and why it uses `useRef` instead of `useState`.

---

## Level 3: Sharing Data Between Components (Lifting State Up)

So far, we've managed data within a single component. But real applications have multiple components that need to share and synchronize data.

Consider this problem: you're building a temperature converter with two inputs—Celsius and Fahrenheit. When the user types in one, the other should update automatically.

### The Problem: Isolated State Can't Communicate

```tsx
import { useState, ChangeEvent } from 'react';

// ❌ This doesn't work!
function TemperatureConverter(): JSX.Element {
  return (
    <div>
      <CelsiusInput />
      <FahrenheitInput />
    </div>
  );
}

function CelsiusInput(): JSX.Element {
  const [celsius, setCelsius] = useState<string>('0');

  return (
    <input
      value={celsius}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setCelsius(e.target.value)}
    />
  );
}

function FahrenheitInput(): JSX.Element {
  const [fahrenheit, setFahrenheit] = useState<string>('32');

  return (
    <input
      value={fahrenheit}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setFahrenheit(e.target.value)}
    />
  );
}
```

Each input has its own isolated state. They can't see or affect each other. Typing in one does nothing to the other.

### The Solution: Lift State to the Closest Common Parent

The fix is to remove state from both children and move it to their shared parent. The parent becomes the **single source of truth**.

```tsx
import { useState, ChangeEvent } from 'react';

interface TemperatureInputProps {
  label: string;
  value: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

function TemperatureConverter(): JSX.Element {
  // The parent owns the data
  const [celsius, setCelsius] = useState<number>(0);

  // Fahrenheit is DERIVED, not stored separately
  const fahrenheit = (celsius * 9) / 5 + 32;

  const handleCelsiusChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setCelsius(parseFloat(e.target.value) || 0);
  };

  const handleFahrenheitChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const f = parseFloat(e.target.value) || 0;
    // Convert back to Celsius (our source of truth)
    setCelsius(((f - 32) * 5) / 9);
  };

  return (
    <div>
      <TemperatureInput
        label="Celsius"
        value={celsius}
        onChange={handleCelsiusChange}
      />
      <TemperatureInput
        label="Fahrenheit"
        value={fahrenheit}
        onChange={handleFahrenheitChange}
      />
    </div>
  );
}

// Child is now "dumb" — it just displays and reports
function TemperatureInput({ label, value, onChange }: TemperatureInputProps): JSX.Element {
  return (
    <label>
      {label}:
      <input
        type="number"
        value={value.toFixed(2)}
        onChange={onChange}
      />
    </label>
  );
}
```

Now both inputs are synchronized because they read from and write to the same state.

### A Practical Example: Accordion Component

Let's see another common use case—an accordion where only one panel can be open at a time:

```tsx
import { useState } from 'react';

interface PanelData {
  title: string;
  content: string;
}

interface AccordionPanelProps {
  title: string;
  content: string;
  isOpen: boolean;
  onToggle: () => void;
}

function Accordion(): JSX.Element {
  // Parent controls which panel is open
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const panels: PanelData[] = [
    { title: 'What is React?', content: 'A JavaScript library for building UIs.' },
    { title: 'What is JSX?', content: 'A syntax extension that looks like HTML.' },
    { title: 'What are hooks?', content: 'Functions that let you use state in functional components.' }
  ];

  return (
    <div className="accordion">
      {panels.map((panel, index) => (
        <AccordionPanel
          key={index}
          title={panel.title}
          content={panel.content}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  );
}

function AccordionPanel({ title, content, isOpen, onToggle }: AccordionPanelProps): JSX.Element {
  return (
    <div className="panel">
      <button onClick={onToggle}>
        {title} {isOpen ? '▼' : '▶'}
      </button>
      {isOpen && <div className="content">{content}</div>}
    </div>
  );
}
```

If each `AccordionPanel` managed its own `isOpen` state, you could open all panels simultaneously. By lifting state up, the parent enforces the "only one open" rule.

### The Pattern Summarized

```
┌─────────────────────────────────────┐
│           Parent Component          │
│  ┌─────────────────────────────┐    │
│  │   STATE (Single Source)     │    │
│  └─────────────────────────────┘    │
│         │              │            │
│    props & handlers    │            │
│         ▼              ▼            │
│  ┌──────────┐   ┌──────────┐        │
│  │  Child A │   │  Child B │        │
│  └──────────┘   └──────────┘        │
└─────────────────────────────────────┘
```

- **State lives in the parent** (the single source of truth)
- **Children receive data via props** (they read from the parent)
- **Children request changes via callbacks** (they don't modify directly)

> **Level 3 Complete:** You can now coordinate multiple components by lifting state to their common parent. This is the "single source of truth" pattern—one of React's most powerful architectural ideas.

---

## Level 4: Building Flexible Components (The Control Props Pattern)

Here's a scenario you'll encounter when building reusable components:

*Sometimes* you want the component to manage its own state. *Other times* you need to control it from outside. How do you support both without writing two separate components?

This is the **Control Props** pattern, used extensively in professional libraries like Radix UI, Headless UI, and Downshift.

### The Core Idea: Inversion of Control

The component asks: "Did the consumer provide a value? If yes, they're the boss. If no, I'm the boss."

```tsx
import { useState, CSSProperties } from 'react';

interface ToggleProps {
  on?: boolean;              // Control prop (optional)
  defaultOn?: boolean;       // Initial value if uncontrolled
  onChange?: (isOn: boolean) => void;  // Callback for either mode
}

function Toggle({
  on,
  defaultOn = false,
  onChange
}: ToggleProps): JSX.Element {
  // Internal state (only used if we're uncontrolled)
  const [internalOn, setInternalOn] = useState<boolean>(defaultOn);

  // Are we controlled? Check if `on` was explicitly provided
  const isControlled = on !== undefined;

  // Resolve the actual value
  const isOn = isControlled ? on : internalOn;

  const handleClick = (): void => {
    const nextValue = !isOn;

    // Always notify the consumer (if they're listening)
    onChange?.(nextValue);

    // Only update internal state if WE'RE the boss
    if (!isControlled) {
      setInternalOn(nextValue);
    }
  };

  const buttonStyle: CSSProperties = {
    padding: '10px 20px',
    backgroundColor: isOn ? '#4CAF50' : '#ccc',
    color: isOn ? 'white' : 'black',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer'
  };

  return (
    <button onClick={handleClick} style={buttonStyle}>
      {isOn ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  );
}
```

### Usage: Two Modes, One Component

**Mode 1: Uncontrolled (component is the boss)**

The simplest usage. The toggle manages itself; you just listen for changes if needed.

```tsx
function App(): JSX.Element {
  return (
    <div>
      <h2>Settings</h2>
      {/* Toggle handles its own state */}
      <Toggle
        defaultOn={false}
        onChange={(isOn) => console.log('Theme changed:', isOn)}
      />
    </div>
  );
}
```

**Mode 2: Controlled (parent is the boss)**

You need the toggle's state for other logic—maybe to sync with other components or persist to localStorage.

```tsx
import { useState } from 'react';

interface NavbarProps {
  darkMode: boolean;
}

interface SidebarProps {
  darkMode: boolean;
}

function Navbar({ darkMode }: NavbarProps): JSX.Element {
  return <nav className={darkMode ? 'dark' : 'light'}>Navbar</nav>;
}

function Sidebar({ darkMode }: SidebarProps): JSX.Element {
  return <aside className={darkMode ? 'dark' : 'light'}>Sidebar</aside>;
}

function App(): JSX.Element {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const handleChange = (isOn: boolean): void => {
    setDarkMode(isOn);
    localStorage.setItem('theme', isOn ? 'dark' : 'light');
  };

  return (
    <div className={darkMode ? 'dark-theme' : 'light-theme'}>
      <h2>Settings</h2>
      {/* Parent controls the toggle */}
      <Toggle on={darkMode} onChange={handleChange} />

      {/* Other components can also read/use darkMode */}
      <Navbar darkMode={darkMode} />
      <Sidebar darkMode={darkMode} />
    </div>
  );
}
```

### A More Complete Example: Expandable Panel

Let's apply this pattern to a collapsible panel component:

```tsx
import { useState, ReactNode } from 'react';

interface ExpandablePanelProps {
  title: string;
  children: ReactNode;
  isOpen?: boolean;              // Control prop
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

function ExpandablePanel({
  title,
  children,
  isOpen,
  defaultOpen = false,
  onOpenChange
}: ExpandablePanelProps): JSX.Element {
  const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen);

  const isControlled = isOpen !== undefined;
  const open = isControlled ? isOpen : internalOpen;

  const handleToggle = (): void => {
    const nextOpen = !open;
    onOpenChange?.(nextOpen);

    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
  };

  return (
    <div className="panel">
      <button onClick={handleToggle} className="panel-header">
        {title}
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && <div className="panel-content">{children}</div>}
    </div>
  );
}

// Usage examples:
function App(): JSX.Element {
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

  return (
    <div>
      {/* Usage 1: Self-managed (uncontrolled) */}
      <ExpandablePanel title="FAQ" defaultOpen={true}>
        <p>Content here manages itself!</p>
      </ExpandablePanel>

      {/* Usage 2: Parent-managed (controlled) */}
      <ExpandablePanel
        title="Details"
        isOpen={detailsOpen}
        onOpenChange={setDetailsOpen}
      >
        <p>Parent controls when this opens!</p>
      </ExpandablePanel>

      <button onClick={() => setDetailsOpen(true)}>
        Open Details Externally
      </button>
    </div>
  );
}
```

### Why This Pattern Matters

| Benefit | Explanation |
|---------|-------------|
| **Flexibility** | One component serves both simple and complex use cases |
| **Gradual adoption** | Start uncontrolled, switch to controlled when needed |
| **Library-grade API** | This is how professional component libraries work |
| **No breaking changes** | Adding control props doesn't break existing usage |

> **Level 4 Complete:** You can now build components that work in both controlled and uncontrolled modes. This pattern is essential for creating reusable, professional-quality components.

---

## Level 5: Mixing Strategies for Performance

The final level is about pragmatism. Real-world forms often require mixing controlled and uncontrolled patterns to balance **developer experience**, **user experience**, and **performance**.

### The Performance Problem with Controlled Forms

Controlled components re-render on every keystroke. For a simple form, this is fine. For a form with 50 fields, complex validation, or expensive rendering logic—it can become sluggish.

```tsx
import { useState, ChangeEvent } from 'react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  // ... 20 more fields
}

// ❌ Every keystroke re-renders the ENTIRE form
function SlowForm(): JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    // ... 20 more fields
  });

  const handleChange = (field: keyof FormData) => (
    e: ChangeEvent<HTMLInputElement>
  ): void => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // This triggers a re-render of everything!
  };

  return (
    <form>
      <input value={formData.firstName} onChange={handleChange('firstName')} />
      <input value={formData.lastName} onChange={handleChange('lastName')} />
      {/* ... 20 more fields, all re-rendering on every keystroke */}
    </form>
  );
}
```

### The Hybrid Approach: Refs for Values, State for UI

A powerful pattern: use **refs** to store form values (avoiding re-renders while typing) and **state** only for things that need to update the UI (like error messages).

```tsx
import { useState, useRef, FormEvent } from 'react';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface FormRefs {
  email: React.RefObject<HTMLInputElement>;
  password: React.RefObject<HTMLInputElement>;
  confirmPassword: React.RefObject<HTMLInputElement>;
}

interface FormData {
  email: string;
  password: string;
}

async function submitToAPI(data: FormData): Promise<void> {
  // Simulated API call
  console.log('Submitting:', data);
}

function RegistrationForm(): JSX.Element {
  // State: Only for UI that needs to update
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Refs: Store values without re-rendering
  const formRefs: FormRefs = {
    email: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    confirmPassword: useRef<HTMLInputElement>(null)
  };

  const validate = (): FormErrors => {
    const email = formRefs.email.current?.value ?? '';
    const password = formRefs.password.current?.value ?? '';
    const confirmPassword = formRefs.confirmPassword.current?.value ?? '';

    const newErrors: FormErrors = {};

    if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
    }

    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      // Focus the first invalid field — refs make this easy!
      const firstErrorField = Object.keys(newErrors)[0] as keyof FormRefs;
      formRefs[firstErrorField].current?.focus();
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Gather values from refs for submission
    const formData: FormData = {
      email: formRefs.email.current?.value ?? '',
      password: formRefs.password.current?.value ?? ''
    };

    await submitToAPI(formData);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          ref={formRefs.email}
          type="email"
          placeholder="Email"
          aria-invalid={!!errors.email}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <input
          ref={formRefs.password}
          type="password"
          placeholder="Password"
          aria-invalid={!!errors.password}
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <div>
        <input
          ref={formRefs.confirmPassword}
          type="password"
          placeholder="Confirm Password"
          aria-invalid={!!errors.confirmPassword}
        />
        {errors.confirmPassword && (
          <span className="error">{errors.confirmPassword}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Register'}
      </button>
    </form>
  );
}
```

**What we achieved:**
- ✅ No re-renders while typing (refs hold the values)
- ✅ Error messages update when needed (state for errors)
- ✅ Focus management on validation failure (refs enable direct DOM access)
- ✅ Clean separation of concerns

### Using Form Libraries: The Best of Both Worlds

Libraries like **React Hook Form** implement this pattern internally, giving you:
- Uncontrolled performance (refs under the hood)
- Controlled-like developer experience (feels like working with state)
- Built-in validation, error handling, and focus management

```tsx
import { useForm, SubmitHandler } from 'react-hook-form';

interface RegistrationFormData {
  email: string;
  password: string;
}

async function submitToAPI(data: RegistrationFormData): Promise<void> {
  console.log('Submitting:', data);
}

function RegistrationForm(): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegistrationFormData>();

  const onSubmit: SubmitHandler<RegistrationFormData> = async (data) => {
    await submitToAPI(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        })}
        placeholder="Email"
      />
      {errors.email && <span className="error">{errors.email.message}</span>}

      <input
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 8,
            message: 'Password must be at least 8 characters'
          }
        })}
        type="password"
        placeholder="Password"
      />
      {errors.password && <span className="error">{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Register'}
      </button>
    </form>
  );
}
```

### A Note on React 19

React 19 introduces new primitives that further simplify form handling:

- **`useActionState`**: Manages form state and submission in one hook
- **`useFormStatus`**: Lets child components know if a form is submitting
- **`<form action={...}>`**: Native support for async form actions

These tools are designed to reduce the need for manual state management in forms, but the mental model from this guide still applies.

> **Level 5 Complete:** You can now make informed decisions about when to use controlled components, when to reach for refs, and when to leverage form libraries. The goal is always the same: the right balance of performance and developer experience for your specific use case.

---

## The Teacher's Ledger Analogy

Let's crystallize everything with an analogy.

Imagine a classroom where grades need to be recorded.

**Uncontrolled Component = Student's Private Notebook**

The student writes grades in their own notebook. The teacher (React) doesn't know what's in there unless they walk over and ask (using a `ref`). It's simple and private, but the teacher can't use that information to update the report card in real-time.

**Controlled Component = Teacher's Ledger**

All grades go through the teacher. The student says, "I got a 95 on the test," but the **teacher reviews and writes it personally** into the master ledger. This ledger is the **single source of truth**. Every report card, every parent email, every honor roll list reads from this one ledger—so they're always in sync.

**Lifting State Up = The Principal's Office**

When multiple teachers need to coordinate (like combining grades from different subjects), the ledger moves up to the principal. Now the principal is the source of truth, and all teachers read from and report to that central record.

**Control Props = A Flexible Gradebook System**

A fancy digital gradebook might ask: "Do you want to manage grades yourself, or should I handle it?" Some teachers want full control (controlled mode); others just want it to work automatically (uncontrolled mode). The system supports both.

---

## Cheat Sheet

| Concept | When to Use | Key Indicator |
|---------|-------------|---------------|
| **Uncontrolled** | Simple forms, file inputs, quick prototypes | `defaultValue`, `ref`, value read on-demand |
| **Controlled** | Real-time validation, formatted inputs, most forms | `value`, `onChange`, state holds truth |
| **`useState`** | Data that affects UI rendering | Changing it should update something visible |
| **`useRef`** | DOM access, timers, values that don't need renders | Changing it should NOT update anything visible |
| **Lifting State** | Multiple components need the same data | Two+ components reading/writing shared state |
| **Control Props** | Building reusable components | Need to support both "managed" and "self-managing" |
| **Hybrid/Refs** | Large forms, performance-critical | Many fields, slow renders on keystroke |

---

## Conclusion

React data management isn't about memorizing when to use `useState` versus `useRef`. It's about having a mental model for **authority and data flow**.

Every time you build a form or coordinate components, ask yourself:

1. **Who's the boss?** → React (controlled) or DOM (uncontrolled)?
2. **Does this data need to trigger re-renders?** → `useState` or `useRef`?
3. **Do multiple components need this data?** → Lift it up.
4. **Should users of my component have a choice?** → Control props.
5. **Is performance suffering?** → Consider a hybrid approach.

With these five levels internalized, you'll navigate React forms and state with clarity—from simple inputs to library-grade components.

---

*Found this helpful? Consider bookmarking it for reference. The patterns here won't change even as React evolves.*

## AI Assistants

* Google NotebookLM
* Google Gemini 3 Flash Preview
* Anthropic Claude Sonnet 4.5