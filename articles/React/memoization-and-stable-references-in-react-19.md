---
title: Memoization and Stable References in React 19
created_on: 2025-12-21T18:25:44+03:30
author: Megacodist
---
# Memoization and Stable References in React 19

Understanding **memoization** and **stable function references** is essential for writing performant React applications. While distinct concepts, they work together—particularly through hooks like `useCallback` and `useMemo`—to prevent unnecessary work during re-renders.

This tutorial explains both concepts from the ground up, demonstrates their traditional usage, and shows how React 19's compiler changes the landscape.

---

## Part 1: The Re-Rendering Problem

Before diving into solutions, let's understand the problem they solve.

### How React Renders

Every time a component's state or props change, React re-runs the entire function body from top to bottom. This means:

1. **All variables are recalculated**—even if they depend on unchanged data.
2. **All functions are recreated**—producing new object references every time.
3. **All child components receive "new" props**—even if the values are logically identical.

This behavior is fine for simple apps, but as complexity grows, it leads to:

- **Wasted computation**: Expensive calculations run repeatedly without need.
- **Unnecessary re-renders**: Child components update even when their data hasn't changed.
- **Cascading effects**: Hooks like `useEffect` fire too often because their dependencies appear to change.

React provides three primary tools to solve these problems:

| Tool | What It Caches | Primary Use Case |
|------|----------------|------------------|
| `useMemo` | A computed **value** | Expensive calculations |
| `useCallback` | A **function reference** | Callbacks passed to children or used in dependencies |
| `memo` | A **component's output** | Preventing child re-renders |

---

## Part 2: Memoizing Values with `useMemo`

**Memoization** is a technique that caches the result of a function call. When the same inputs occur again, the cached result is returned instead of recalculating.

### The Problem: Repeated Expensive Work

```tsx
"use client";

import { useState } from "react";

function slowFibonacci(n: number): number {
  if (n <= 1) return n;
  return slowFibonacci(n - 1) + slowFibonacci(n - 2);
}

export function FibonacciCalculator() {
  const [n, setN] = useState(10);
  const [theme, setTheme] = useState("light");

  // This runs on EVERY render, even when only "theme" changes
  const result = slowFibonacci(n);

  return (
    <div className={theme}>
      <input
        type="number"
        value={n}
        onChange={(e) => setN(Number(e.target.value))}
      />
      <p>fib({n}) = {result}</p>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Toggle Theme
      </button>
    </div>
  );
}
```

Toggling the theme has nothing to do with the Fibonacci calculation, yet `slowFibonacci` runs every time.

### The Solution: Cache the Result

```tsx
"use client";

import { useMemo, useState } from "react";

function slowFibonacci(n: number): number {
  if (n <= 1) return n;
  return slowFibonacci(n - 1) + slowFibonacci(n - 2);
}

export function FibonacciCalculator() {
  const [n, setN] = useState(10);
  const [theme, setTheme] = useState("light");

  // Only recalculates when "n" changes
  const result = useMemo(
    () => slowFibonacci(n),
    [n]
  );

  return (
    <div className={theme}>
      <input
        type="number"
        value={n}
        onChange={(e) => setN(Number(e.target.value))}
      />
      <p>fib({n}) = {result}</p>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Toggle Theme
      </button>
    </div>
  );
}
```

Now toggling the theme is instant—the expensive calculation is skipped entirely.

> **Analogy**: `useMemo` is like a **pre-written answer sheet**. Instead of solving the same math problem repeatedly, you look up the answer you already computed.

---

## Part 3: The Function Reference Problem

Values aren't the only things recreated on each render—**functions are too**. This creates a subtle but significant performance issue.

### Understanding Object Identity in JavaScript

In JavaScript, functions are objects. Two functions with identical logic are still **different references**:

```js
const fn1 = () => console.log("hello");
const fn2 = () => console.log("hello");

console.log(fn1 === fn2); // false
```

This matters in React because when you pass a function as a prop, React uses reference equality to determine if the prop changed.

### The Problem: Memoized Children Still Re-render

```tsx
"use client";

import { memo, useState } from "react";

const ExpensiveButton = memo(function ExpensiveButton({ 
  onClick 
}: { 
  onClick: () => void 
}) {
  console.log("ExpensiveButton rendered");
  return <button onClick={onClick}>Click me</button>;
});

export function Parent() {
  const [count, setCount] = useState(0);
  const [unrelated, setUnrelated] = useState(0);

  // New function reference created on every render
  const handleClick = () => setCount((c) => c + 1);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setUnrelated((x) => x + 1)}>
        Unrelated: {unrelated}
      </button>
      
      {/* This re-renders on EVERY parent render, defeating memo */}
      <ExpensiveButton onClick={handleClick} />
    </div>
  );
}
```

Even though `ExpensiveButton` is wrapped in `memo`, it re-renders when `unrelated` changes. Why? Because `handleClick` is a **new reference** every time, so React sees it as a changed prop.

### The Solution: Stabilize the Reference with `useCallback`

```tsx
"use client";

import { memo, useCallback, useState } from "react";

const ExpensiveButton = memo(function ExpensiveButton({ 
  onClick 
}: { 
  onClick: () => void 
}) {
  console.log("ExpensiveButton rendered");
  return <button onClick={onClick}>Click me</button>;
});

export function Parent() {
  const [count, setCount] = useState(0);
  const [unrelated, setUnrelated] = useState(0);

  // Same function reference across renders (unless dependencies change)
  const handleClick = useCallback(
    () => setCount((c) => c + 1),
    []
  );

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setUnrelated((x) => x + 1)}>
        Unrelated: {unrelated}
      </button>
      
      {/* Now this only re-renders when handleClick actually changes */}
      <ExpensiveButton onClick={handleClick} />
    </div>
  );
}
```

Now changing `unrelated` no longer triggers a re-render of `ExpensiveButton`.

> **Analogy**: `useCallback` gives your function a **permanent phone number**. Even when you move houses (the component re-renders), people can reach you at the same number without updating their contacts.

---

## Part 4: Stable References in Hook Dependencies

Function references matter beyond child components—they also affect hooks like `useEffect`.

### The Problem: Effects Fire Too Often

```tsx
"use client";

import { useEffect, useState } from "react";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [theme, setTheme] = useState("light");

  // New function reference on every render
  const fetchResults = async () => {
    console.log("Fetching for:", query);
    const data = ["apple", "banana", "cherry"].filter(
      (item) => item.includes(query.toLowerCase())
    );
    setResults(data);
  };

  useEffect(
    () => fetchResults(),
    [fetchResults] // Fires on EVERY render because fetchResults changes
  );

  return (
    <div className={theme}>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Toggle Theme
      </button>
      <ul>
        {results.map((r) => <li key={r}>{r}</li>)}
      </ul>
    </div>
  );
}
```

Toggling the theme triggers a new fetch—completely unintended behavior.

### The Solution: Stabilize the Dependency

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [theme, setTheme] = useState("light");

  // Stable reference that only changes when "query" changes
  const fetchResults = useCallback(
    async () => {
      console.log("Fetching for:", query);
      const data = ["apple", "banana", "cherry"].filter(
        (item) => item.includes(query.toLowerCase())
      );
      setResults(data);
    },
    [query]
  );

  useEffect(
    () => fetchResults(),
    [fetchResults]  // Now only fires when "query" changes
  );

  return (
    <div className={theme}>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Toggle Theme
      </button>
      <ul>
        {results.map((r) => <li key={r}>{r}</li>)}
      </ul>
    </div>
  );
}
```

---

## Part 5: Memoizing Components with `memo`

We've seen `memo` in passing—now let's examine it directly.

### What `memo` Does

The `memo` higher-order component wraps a functional component and **skips re-rendering** if its props haven't changed (using shallow comparison).

```tsx
"use client";

import { memo, useState } from "react";

type ItemListProps = {
  items: string[];
  category: string;
};

const ItemList = memo(function ItemList({ items, category }: ItemListProps) {
  console.log(`ItemList [${category}] rendered`);
  return (
    <ul>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
});

export function Dashboard() {
  const [fruits] = useState(["apple", "banana"]);
  const [vegetables] = useState(["carrot", "broccoli"]);
  const [counter, setCounter] = useState(0);

  return (
    <div>
      <button onClick={() => setCounter((c) => c + 1)}>
        Counter: {counter}
      </button>
      
      {/* Neither list re-renders when counter changes */}
      <ItemList items={fruits} category="Fruits" />
      <ItemList items={vegetables} category="Vegetables" />
    </div>
  );
}
```

### When `memo` Breaks Down

`memo` relies on **reference equality**. If you create new arrays or objects inline, the optimization fails:

```tsx
// ❌ This defeats memo—new array reference every render
<ItemList items={["apple", "banana"]} category="Fruits" />

// ✅ This preserves memo—stable reference from useState
<ItemList items={fruits} category="Fruits" />
```

---

## Part 6: Putting It All Together

Here's a comprehensive example showing all three tools working in harmony:

```tsx
"use client";

import { memo, useCallback, useMemo, useState } from "react";

// Memoized child component
const FilteredList = memo(function FilteredList({
  items,
  onSelect,
}: {
  items: string[];
  onSelect: (item: string) => void;
}) {
  console.log("FilteredList rendered");
  return (
    <ul>
      {items.map((item) => (
        <li key={item} onClick={() => onSelect(item)}>
          {item}
        </li>
      ))}
    </ul>
  );
});

export function ProductSearch() {
  const [allProducts] = useState([
    "Apple iPhone",
    "Samsung Galaxy",
    "Google Pixel",
    "Apple MacBook",
    "Dell XPS",
  ]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // useMemo: Cache expensive filtering
  const filteredProducts = useMemo(
    () => {
      console.log("Filtering products...");
      return allProducts.filter((p) =>
        p.toLowerCase().includes(filter.toLowerCase())
      );
    },
    [allProducts, filter]
  );

  // useCallback: Stable function reference for child
  const handleSelect = useCallback(
    (item: string) => setSelected(item),
    []
  );

  return (
    <div style={{ background: darkMode ? "#333" : "#fff" }}>
      <button onClick={() => setDarkMode((d) => !d)}>
        Toggle Dark Mode
      </button>

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search products..."
      />

      {selected && <p>Selected: {selected}</p>}

      {/* memo + useCallback + useMemo = optimal performance */}
      <FilteredList items={filteredProducts} onSelect={handleSelect} />
    </div>
  );
}
```

**What happens when you toggle dark mode?**

- `ProductSearch` re-renders (state changed).
- `filteredProducts` is **not** recalculated (dependencies unchanged).
- `handleSelect` keeps the **same reference** (dependencies unchanged).
- `FilteredList` does **not** re-render (props unchanged).

---

## Part 7: React 19 and Automatic Memoization

React 19 introduces the **React Compiler** (codenamed "React Forget"), which fundamentally changes how we think about memoization.

### What the Compiler Does

The compiler analyzes your code at build time and **automatically inserts memoization** where beneficial. It:

- Identifies which values need caching.
- Stabilizes function references without explicit `useCallback`.
- Determines which components benefit from `memo`-like behavior.

### Before: Manual Optimization

```tsx
"use client";

import { memo, useCallback, useMemo, useState } from "react";

const ItemsList = memo(function ItemsList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
});

export function Dashboard() {
  const [filter, setFilter] = useState("");
  const [allItems] = useState(["apple", "banana", "cherry"]);

  const filteredItems = useMemo(
    () => allItems.filter((item) => item.includes(filter)),
    [allItems, filter]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value),
    []
  );

  return (
    <div>
      <input value={filter} onChange={handleChange} />
      <ItemsList items={filteredItems} />
    </div>
  );
}
```

### After: Let the Compiler Optimize

```tsx
import { useState } from "react";

function ItemsList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

export function Dashboard() {
  const [filter, setFilter] = useState("");
  const [allItems] = useState(["apple", "banana", "cherry"]);

  const filteredItems = allItems.filter((item) => item.includes(filter));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  return (
    <div>
      <input value={filter} onChange={handleChange} />
      <ItemsList items={filteredItems} />
    </div>
  );
}
```

The code is simpler, yet achieves the same optimizations. The compiler handles the complexity behind the scenes.

> **Analogy**: The React 19 compiler is like a **personal assistant** who automatically manages your answer sheets and phone book, so you can focus on solving problems rather than organizing paperwork.

---

## Part 8: When Manual Memoization Still Matters

Despite automatic optimization, manual tools remain valuable in specific scenarios:

### 1. Fine-Grained Control in Hot Paths

When rendering thousands of items (data grids, virtualized lists), you may need precise control over what gets memoized and when.

### 2. Third-Party Library Requirements

Some libraries (drag-and-drop, charting, animation) depend on stable references and may not work correctly with compiler-only optimization.

### 3. Documenting Performance Intent

Explicit memoization serves as documentation—it tells future developers "this is intentionally optimized because it's expensive."

### 4. Complex Dependency Relationships

When dependencies involve multiple interconnected values, manual control over the dependency array can be clearer than relying on compiler inference.

---

## Summary

| Concept | Tool | Purpose |
|---------|------|---------|
| Cache computed values | `useMemo` | Skip expensive recalculations |
| Stabilize function references | `useCallback` | Prevent prop changes / effect re-runs |
| Skip component re-renders | `memo` | Avoid rendering unchanged children |
| Automatic optimization | React 19 Compiler | Handle all of the above without manual work |

**Key Takeaways:**

1. React re-renders create new references for everything—values, functions, and objects.
2. New references trigger unnecessary work: recalculations, child re-renders, and effect executions.
3. `useMemo`, `useCallback`, and `memo` let you preserve references across renders.
4. React 19's compiler automates these optimizations, but understanding the fundamentals remains important for debugging and edge cases.