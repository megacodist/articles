---
title: "The Tricky JavaScript: Understanding Async/Await with forEach"
author: Megacodist
---

# The Tricky JavaScript: Understanding Async/Await with `forEach`

Take a look at the following code :

```javascript
const ratings = [5, 4, 5];
let sum = 0;

const sumFunction = async (a, b) => a + b;

ratings.forEach(async (rating) => {
  sum = await sumFunction(sum, rating);
});

console.log(sum);  // 0
```

It demonstrates a common JavaScript pitfall when using `async`/`await` with `forEach`:

1. We have an array `ratings = [5, 4, 5]`.
2. We want to sum them up using an async function.
3. We use `forEach` with an async callback.
4. The expected result is `14` (`5 + 4 + 5`).
5. But the actual output is `0`.

## The Problem

The issue is that `forEach` doesn't wait for promises. When you pass an async function to `forEach`, it does call the function, but it doesn't await the returned promise. It just fires off all the async callbacks and moves on immediately.

## Step-by-Step Execution

Let me trace through what happens:

1. `sum` starts at `0`.
2. `forEach` is called.
3. For the first element (`5`):
    - An async function is called: `async (5) => { sum = await sumFunction(sum, 5); }`.
    - This starts executing, hits `await sumFunction(0, 5)`, and returns a Promise.
    - The Promise is returned to `forEach`, but `forEach` ignores it and immediately moves to the next iteration.
4. For the second element (`4`):
    - Same thing happens - starts executing, returns a Promise immediately.
5. For the third element (`5`):
    - Same thing.
6. `forEach` completes (it has initiated 3 async operations but not waited for any of them)
7. `console.log(sum)` runs - at this point, none of the async operations have completed yet (or maybe some have, but it's a race condition).
8. Eventually, all three async operations complete, but by then the `console.log` has already happened.

Actually, let me think more carefully about the timing:

When `await sumFunction(sum, 5)` is called:

- `sumFunction(sum, 5)` returns a Promise that immediately resolves to `sum + 5`.

- Even though it resolves immediately, the `await` still "pauses" the async function and schedules the rest of the function body to run in a microtask.

- So each callback schedules its assignment (`sum = ...`) as a microtask, then returns control back to `forEach`.

- All three iterations complete synchronously, then `console.log(sum)` executes while `sum` is still `0`.

- Only after all synchronous code finishes do the microtasks run and update `sum`, but by then it's too late for the log statement.

*  `sum` is still `0` because all three callbacks have started but none have awaited yet. Each callback reads the current value of sum (which is `0`) before calling `sumFunction`, then they all await their promises. When the promises resolve, each callback assigns its result back to `sum`, but since they all read `0` initially, the assignments overwrite each other—first sum becomes `5`, then `4`, then `5` again. The final logged value ends up being `5`, not `14`. - `Promise(4)` resolves, `sum = 4`.

- `Promise(5)` resolves, `sum = 5`.

The final value is `5`, while `console.log` outputs `0` since it executes before any promises settle.

## Solutions

### 1. Use `for...of` loop (recommended)
```javascript
for (const rating of ratings) {
  sum = await sumFunction(sum, rating);
}
console.log(sum); // 14
```

### 2. Use `reduce` with promises
```javascript
const sum = await ratings.reduce(async (accPromise, rating) => {
  const acc = await accPromise;
  return sumFunction(acc, rating);
}, Promise.resolve(0));
console.log(sum); // 14
```

### 3. Use `for` loop
```javascript
for (let i = 0; i < ratings.length; i++) {
  sum = await sumFunction(sum, ratings[i]);
}
console.log(sum); // 14
```

## Key Takeaway

> **`forEach`, `map`, `filter`, etc. do not await async callbacks.** They simply invoke the callback and move on. For sequential async operations, use `for...of` or `for` loops.

## AI Assistence

1. Claude Sonnet 4.5