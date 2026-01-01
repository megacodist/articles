---
title: "From Prop Soup to Composition: Mastering Compound Components"
slug: "from-prop-soup-to-composition-mastering-compound-components"
created_on: 2025-12-24T20:23:31+03:30
authors: ["Megacodist"]
status: "published"
tags: []
---
# From Prop Soup to Composition: Mastering Compound Components

> **Prerequisites**: This article builds on React Context fundamentals. If you're new to Context, start with [Mitigating Prop Drilling: Understanding React Context API](https://megacodist.com/articles/React/Fmitigating-prop-drilling-understanding-react-context-api) first.

In React development, building complex components often leads to a frustrating problem: a component that accepts so many props it becomes unmanageable. The **Compound Component Pattern** solves this by favoring **composition over configuration**, creating flexible, intuitive component APIs.

---

## Part 1: The "Prop Soup" Problem

As UI requirements grow, developers often add more props to handle every possible configuration:

```tsx
// ❌ "Prop Soup": A component overwhelmed with props
<Card
  title="Product Title"
  subtitle="Product Description"
  showImage={true}
  imagePosition="top"
  imageSrc="/product.jpg"
  imageAlt="Product"
  showPrice={true}
  price={99.99}
  currency="USD"
  showRating={true}
  rating={4.5}
  maxRating={5}
  showReviews={true}
  reviewCount={128}
  showAddToCart={true}
  addToCartText="Add to Cart"
  onAddToCart={handleAddToCart}
  showFavorite={true}
  isFavorite={false}
  onToggleFavorite={handleFavorite}
  cardLayout="vertical"
  cardSize="medium"
  backgroundColor="#fff"
  borderRadius={8}
  showShadow={true}
  // ... and it keeps growing
/>
```

**Problems with this approach:**

1. **Bloated API**: 20+ props make the component intimidating and error-prone
2. **Rigid Structure**: Despite all these props, you can't truly customize the layout—the component still dictates element order
3. **Maintenance Nightmare**: Every feature request means adding more props and internal logic
4. **Testing Complexity**: Exponentially difficult to test all prop combinations
5. **Poor Reusability**: The component tries to be everything to everyone, succeeding at nothing

---

## Part 2: The Solution - Composition Over Configuration

Instead of one component with 20+ props, create a collection of smaller components that work together:

```tsx
// ✅ Compound Components: Flexible and composable
<Card>
  <Card.Image src="/product.jpg" alt="Product" />
  <Card.Title>Product Title</Card.Title>
  <Card.Subtitle>Product Description</Card.Subtitle>
  <Card.Rating value={4.5} max={5} reviews={128} />
  <Card.Price amount={99.99} currency="USD" />
  <Card.Actions>
    <Card.FavoriteButton isFavorite={false} onToggle={handleFavorite} />
    <Card.AddToCartButton onClick={handleAddToCart} />
  </Card.Actions>
</Card>
```

**Immediate benefits:**

- **Flexibility**: Rearrange elements freely (put the image at the bottom, price at the top)
- **Simplicity**: Each sub-component has a focused, clear purpose
- **Discoverability**: IDE autocomplete shows all available parts (`Card.`)
- **Customization**: Easily add custom elements between Card components
- **Conditional Rendering**: Omit parts you don't need without complex prop logic

---

## Part 3: Understanding Compound Components

### What Are They?

Compound Components are a collection of components that work together as a cohesive unit, **sharing implicit state** through Context.

Think of them like a **restaurant where you build your own plate**: Instead of ordering a fixed meal with no substitutions, you're given the ingredients—appetizers, mains, sides—and you decide how to arrange them, while the kitchen handles the cooking.

### The Architecture

**The Parent (The Manager)**  
- Manages shared state (e.g., "is the modal open?", "which tab is active?")
- Provides state to children via Context
- Coordinates behavior between sub-components

**The Children (The Workers)**  
- Handle specific rendering tasks (header, body, footer)
- Consume shared state from Context
- Remain focused on a single responsibility

**The API**  
- Children are exposed as properties of the parent (`Modal.Header`, `Modal.Body`)
- Creates a declarative, HTML-like feel (similar to `<select>` and `<option>`)

---

## Part 4: Building a Modal - Complete Example

Let's build a full Modal using the Compound Component pattern.

### Step 1: Create the Context

```tsx
import { createContext, useContext, ReactNode } from "react";

type ModalContextType = {
  isOpen: boolean;
  close: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("Modal components must be used within Modal.Root");
  }
  return context;
}
```

> **Refresher**: If Context feels unfamiliar, review  [Mitigating Prop Drilling: Understanding React Context API](https://megacodist.com/articles/React/Fmitigating-prop-drilling-understanding-react-context-api) for the fundamentals of Providers and Consumers.

### Step 2: Build the Parent Component

```tsx
function ModalRoot({ 
  isOpen, 
  onClose, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <ModalContext.Provider value={{ isOpen, close: onClose }}>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
}
```

### Step 3: Build the Child Components

```tsx
function ModalHeader({ children }: { children: ReactNode }) {
  return <div className="modal-header">{children}</div>;
}

function ModalBody({ children }: { children: ReactNode }) {
  return <div className="modal-body">{children}</div>;
}

function ModalFooter({ children }: { children: ReactNode }) {
  return <div className="modal-footer">{children}</div>;
}

function ModalCloseButton() {
  const { close } = useModalContext(); // Accesses shared state!
  return (
    <button onClick={close} className="modal-close">
      ✕
    </button>
  );
}
```

Notice how `ModalCloseButton` doesn't receive `onClose` via props—it gets it from Context automatically.

### Step 4: Export as Compound Component

```tsx
export const Modal = {
  Root: ModalRoot,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
  CloseButton: ModalCloseButton,
};
```

### Step 5: Usage Examples

**Standard layout:**

```tsx
function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>

      <Modal.Root isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Modal.Header>
          Confirm Action
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to proceed?
        </Modal.Body>
        <Modal.Footer>
          <button onClick={() => setIsOpen(false)}>Cancel</button>
          <button onClick={handleConfirm}>Confirm</button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
```

**Custom layout (close button in footer):**

```tsx
<Modal.Root isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <Modal.Header>Quick Question</Modal.Header>
  <Modal.Body>Do you like this pattern?</Modal.Body>
  <Modal.Footer>
    <button>Yes!</button>
    <Modal.CloseButton />
  </Modal.Footer>
</Modal.Root>
```

**Minimal version (no header or footer):**

```tsx
<Modal.Root isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <Modal.Body>
    <img src="/success.png" alt="Success" />
    <p>Operation completed!</p>
  </Modal.Body>
</Modal.Root>
```

**The beauty**: Same components, completely different structures—no prop changes needed.

---

## Part 5: More Real-World Examples

### Example 1: Tabs Component

```tsx
type TabsContextType = {
  activeTab: string;
  setActiveTab: (id: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tabs components must be used within Tabs.Root");
  return context;
}

function TabsRoot({ 
  defaultTab, 
  children 
}: { 
  defaultTab: string; 
  children: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ children }: { children: ReactNode }) {
  return <div className="tabs-list">{children}</div>;
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === id;

  return (
    <button
      className={`tab ${isActive ? "active" : ""}`}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
}

function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab } = useTabsContext();
  
  if (activeTab !== id) return null;

  return <div className="tab-panel">{children}</div>;
}

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Tab: Tab,
  Panel: TabPanel,
};
```

**Usage:**

```tsx
function ProductDetails() {
  return (
    <Tabs.Root defaultTab="description">
      <Tabs.List>
        <Tabs.Tab id="description">Description</Tabs.Tab>
        <Tabs.Tab id="specs">Specifications</Tabs.Tab>
        <Tabs.Tab id="reviews">Reviews</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel id="description">
        <p>This product is amazing...</p>
      </Tabs.Panel>

      <Tabs.Panel id="specs">
        <ul>
          <li>Weight: 1.2kg</li>
          <li>Dimensions: 30x20x10cm</li>
        </ul>
      </Tabs.Panel>

      <Tabs.Panel id="reviews">
        <p>⭐⭐⭐⭐⭐ "Best purchase ever!"</p>
      </Tabs.Panel>
    </Tabs.Root>
  );
}
```

### Example 2: Accordion Component

```tsx
type AccordionContextType = {
  openItems: string[];
  toggle: (id: string) => void;
};

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) throw new Error("Accordion components must be used within Accordion.Root");
  return context;
}

function AccordionRoot({ 
  allowMultiple = false,
  children 
}: { 
  allowMultiple?: boolean;
  children: ReactNode;
}) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggle = (id: string) => {
    setOpenItems(prev => {
      const isOpen = prev.includes(id);
      
      if (isOpen) {
        return prev.filter(item => item !== id);
      } else {
        return allowMultiple ? [...prev, id] : [id];
      }
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ 
  id, 
  children 
}: { 
  id: string; 
  children: ReactNode;
}) {
  return <div className="accordion-item">{children}</div>;
}

function AccordionTrigger({ 
  id, 
  children 
}: { 
  id: string; 
  children: ReactNode;
}) {
  const { openItems, toggle } = useAccordionContext();
  const isOpen = openItems.includes(id);

  return (
    <button 
      className="accordion-trigger"
      onClick={() => toggle(id)}
    >
      {children}
      <span>{isOpen ? "−" : "+"}</span>
    </button>
  );
}

function AccordionContent({ 
  id, 
  children 
}: { 
  id: string; 
  children: ReactNode;
}) {
  const { openItems } = useAccordionContext();
  const isOpen = openItems.includes(id);

  if (!isOpen) return null;

  return <div className="accordion-content">{children}</div>;
}

export const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
};
```

**Usage:**

```tsx
function FAQ() {
  return (
    <Accordion.Root allowMultiple>
      <Accordion.Item id="shipping">
        <Accordion.Trigger id="shipping">
          How long does shipping take?
        </Accordion.Trigger>
        <Accordion.Content id="shipping">
          Shipping typically takes 3-5 business days.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item id="returns">
        <Accordion.Trigger id="returns">
          What is your return policy?
        </Accordion.Trigger>
        <Accordion.Content id="returns">
          We accept returns within 30 days of purchase.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item id="warranty">
        <Accordion.Trigger id="warranty">
          Do you offer a warranty?
        </Accordion.Trigger>
        <Accordion.Content id="warranty">
          Yes, all products come with a 1-year warranty.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
```

### Example 3: Dropdown Menu

```tsx
type DropdownContextType = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
};

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) throw new Error("Dropdown components must be used within Dropdown.Root");
  return context;
}

function DropdownRoot({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(prev => !prev);
  const close = () => setIsOpen(false);

  return (
    <DropdownContext.Provider value={{ isOpen, toggle, close }}>
      <div className="dropdown">{children}</div>
    </DropdownContext.Provider>
  );
}

function DropdownTrigger({ children }: { children: ReactNode }) {
  const { toggle } = useDropdownContext();
  
  return (
    <button className="dropdown-trigger" onClick={toggle}>
      {children}
    </button>
  );
}

function DropdownMenu({ children }: { children: ReactNode }) {
  const { isOpen, close } = useDropdownContext();
  
  if (!isOpen) return null;

  return (
    <>
      <div className="dropdown-backdrop" onClick={close} />
      <div className="dropdown-menu">{children}</div>
    </>
  );
}

function DropdownItem({ 
  onClick, 
  children 
}: { 
  onClick: () => void; 
  children: ReactNode;
}) {
  const { close } = useDropdownContext();

  const handleClick = () => {
    onClick();
    close();
  };

  return (
    <button className="dropdown-item" onClick={handleClick}>
      {children}
    </button>
  );
}

function DropdownDivider() {
  return <div className="dropdown-divider" />;
}

export const Dropdown = {
  Root: DropdownRoot,
  Trigger: DropdownTrigger,
  Menu: DropdownMenu,
  Item: DropdownItem,
  Divider: DropdownDivider,
};
```

**Usage:**

```tsx
function UserMenu() {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger>
        My Account ▾
      </Dropdown.Trigger>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => navigate("/profile")}>
          👤 Profile
        </Dropdown.Item>
        <Dropdown.Item onClick={() => navigate("/settings")}>
          ⚙️ Settings
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={handleLogout}>
          🚪 Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown.Root>
  );
}
```

---

## Part 6: When to Use This Pattern

### Perfect Use Cases ✅

| Scenario | Why It Shines |
|----------|---------------|
| **Modals/Dialogs** | Layouts vary widely (simple confirmation vs complex forms) |
| **Tabs** | Tab order and panel content differ per use case |
| **Accordions** | Sections need custom triggers and content |
| **Dropdowns/Menus** | Menu structure varies (icons, dividers, nested menus) |
| **Data Tables** | Headers, sorting, pagination need customization |
| **Form Wizards** | Step order and content change per form |
| **Card Layouts** | Product cards, profile cards need different arrangements |

### When NOT to Use ❌

- **Simple components** with 2-3 props (overkill)
- **Performance-critical** lists with thousands of items (Context overhead)
- **Highly dynamic** structures determined at runtime (not at design time)
- **Tightly coupled logic** where sub-components can't work independently

---

## Part 7: Benefits and Trade-offs

### Benefits

1. **Flexibility**: Users control structure without modifying the component
2. **Clean API**: No prop soup—each sub-component has clear purpose
3. **Discoverability**: IDE autocomplete reveals available parts
4. **Separation of Concerns**: Logic (parent) separate from presentation (children)
5. **Progressive Enhancement**: Start simple, add parts as needed
6. **Better DX**: Feels like writing HTML, not configuring JavaScript

### Trade-offs

1. **Initial Complexity**: More files and boilerplate than a single component
2. **Learning Curve**: Users must understand the composition model
3. **Context Overhead**: Small performance cost (negligible in most cases)
4. **Documentation Needs**: Requires examples showing valid compositions

---

## Summary

| Concept | What It Solves |
|---------|---------------|
| **Prop Soup** | Components overwhelmed with configuration props |
| **Rigid Structure** | Inability to rearrange UI elements |
| **Compound Components** | Collection of components sharing implicit state |
| **Composition Over Configuration** | Building with pieces vs. configuring a monolith |
| **Context-Based State** | Implicit communication between parent and children |

**Key Takeaways:**

1. Compound Components favor **composition** (arranging pieces) over **configuration** (passing props)
2. They use **Context** to share state implicitly between parent and children
3. Create **Lego-like APIs** where users control structure while the parent manages state
4. Best for components with **variable layouts** and **complex configurations**
5. Trade initial complexity for long-term flexibility and maintainability

**Pattern Formula:**

1. Create Context for shared state
2. Build parent component (manages state, provides context)
3. Build child components (consume context, handle rendering)
4. Export as namespaced object (`Component.Part`)
5. Let users compose freely

This pattern transforms rigid, prop-heavy components into flexible, intuitive building blocks that feel natural to use.

## Bibliography

* "Beyond the Basics: Exploring React's Compound Components" by Melvin Prince, published on the DEV Community. This source provided the core definition of the pattern and the foundational restaurant analogy.

* "Compound Components and Advanced Composition" from Vercel Academy. This material detailed the anatomy of modern UI components and provided advanced composition strategies for scalable systems.

* "Compound Components: an elegant, robust, and simple way to avoid prop drilling in our React apps" by Gonzalo Ribera for Paradigma. This article focused on the pattern as a primary solution for avoiding deeply nested component trees and improving modularity.

* "How to Use the Compound Components Pattern in React: Prop Soup to Flexible UIs" by Tapas Adhikary for freeCodeCamp. This source explored the concept of "Prop Soup" and compared the pattern's flexibility to Lego blocks.

* "Mastering Compound Components for Scalable React Architecture" by Navidbarsalari on Medium. This source summarized the benefits of the pattern, emphasizing encapsulation and declarative APIs.

* "Mastering React Compound Components: Beyond Prop Explosion" by Md. Saddam Hossain on Medium. This guide addressed the problem of "prop explosion" and illustrated refactoring monolithic components into cohesive units.

* "The Most Common React Design Patterns" by Mensur Duraković. This overview placed compound components within the broader landscape of React architecture alongside Higher-Order Components and Render Props.

* "Compound components pattern in React" by Akilesh Rao. This tutorial provided insights into scaling issues and the importance of creating a suite of reusable, cooperative components.

* "MASTER the Provider Pattern in React || Context Made Simple! || Day 07" by Tapas Adhikary. This presentation demystified the React Context API, explaining how it serves as a "broadcast tower" to provide shared state without prop drilling.

* "Mastering Compound Components Design Pattern in React || Day 03" by Tapas Adhikary. This session detailed why "dumb" presentational components are often the best building blocks for flexible UIs.

* "The Magic Of Compound Components in React" by Youssef Benlemlih. This video demonstrated how to simplify complex interfaces by splitting them into subcomponents that share a common root context.

* "React - The constructor pattern for components" by Christian Alfoni. This presentation discussed managing code complexity and building mental models for how UI dependencies should be structured.

## AI Assistences

* Google NotebookLM

* Claude Sonnet 4.5