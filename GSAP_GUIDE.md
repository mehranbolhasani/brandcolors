# GSAP Integration Guide

## Why GSAP?

GSAP (GreenSock Animation Platform) is the industry-standard JavaScript animation library that provides:

✅ **Buttery smooth 60fps animations** - Better than CSS transitions
✅ **Automatic GPU acceleration** - Optimizes performance automatically
✅ **ScrollTrigger** - Best-in-class scroll-based animations
✅ **Better easing** - More natural motion with advanced easing functions
✅ **No jank** - Handles complex animations without stuttering
✅ **Cross-browser consistency** - Works perfectly everywhere

## Installation

```bash
npm install gsap
```

## Current Implementation: Sticky Header

### Before (CSS + React State)

**Problems:**

- Janky scroll performance
- React re-renders on every scroll
- CSS transitions not smooth enough
- Manual scroll event handling

### After (GSAP ScrollTrigger)

**Benefits:**

- Silky smooth 60fps animations
- No React re-renders during scroll
- GSAP handles all optimization
- Declarative scroll triggers

### Code Example

```tsx
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugin (only on client)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// In component
useEffect(() => {
  if (!mounted || !headerRef.current) return;

  const ctx = gsap.context(() => {
    ScrollTrigger.create({
      trigger: headerRef.current,
      start: "top 8px",
      end: "+=1",
      onEnter: () => {
        // Animate to stuck state
        gsap.to(headerRef.current, {
          height: "4rem",
          boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
          duration: 0.3,
          ease: "power2.out",
        });
      },
      onLeaveBack: () => {
        // Animate back to normal
        gsap.to(headerRef.current, {
          height: "auto",
          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
          duration: 0.3,
          ease: "power2.out",
        });
      },
    });
  });

  return () => ctx.revert(); // Clean up
}, [mounted]);
```

## Key GSAP Concepts

### 1. **gsap.to()** - Animate TO values

```tsx
gsap.to(element, {
  opacity: 0,
  x: 100,
  duration: 0.5,
  ease: "power2.out",
});
```

### 2. **gsap.from()** - Animate FROM values

```tsx
gsap.from(element, {
  opacity: 0,
  y: 50,
  duration: 0.5,
});
```

### 3. **gsap.fromTo()** - Explicit start and end

```tsx
gsap.fromTo(
  element,
  { opacity: 0, scale: 0.8 },
  { opacity: 1, scale: 1, duration: 0.5 }
);
```

### 4. **gsap.context()** - Scoped animations

```tsx
const ctx = gsap.context(() => {
  // All animations here are scoped
  gsap.to(".item", { x: 100 });
});

// Clean up all animations in this context
ctx.revert();
```

## ScrollTrigger Options

### Basic Setup

```tsx
ScrollTrigger.create({
  trigger: element, // Element to watch
  start: "top center", // When to start
  end: "bottom center", // When to end
  onEnter: () => {}, // Scrolling forward, entering
  onLeave: () => {}, // Scrolling forward, leaving
  onEnterBack: () => {}, // Scrolling backward, entering
  onLeaveBack: () => {}, // Scrolling backward, leaving
});
```

### Start/End Positions

```tsx
start: "top top"; // When trigger's top hits viewport's top
start: "top center"; // When trigger's top hits viewport's center
start: "top bottom"; // When trigger's top hits viewport's bottom
start: "top 100px"; // When trigger's top is 100px from viewport's top
start: "top 80%"; // When trigger's top is 80% down the viewport
```

### Scrub (Linked to scroll)

```tsx
ScrollTrigger.create({
  trigger: element,
  start: "top top",
  end: "bottom top",
  scrub: true, // Animation linked to scroll position
  animation: gsap.to(element, { x: 500 }),
});
```

## Common Use Cases

### 1. Fade In on Scroll

```tsx
gsap.from(".card", {
  scrollTrigger: {
    trigger: ".card",
    start: "top 80%",
  },
  opacity: 0,
  y: 50,
  duration: 0.8,
  stagger: 0.2, // Delay between multiple elements
});
```

### 2. Parallax Effect

```tsx
gsap.to(".background", {
  scrollTrigger: {
    trigger: ".section",
    start: "top top",
    end: "bottom top",
    scrub: true,
  },
  y: 200,
  ease: "none",
});
```

### 3. Pin Element While Scrolling

```tsx
ScrollTrigger.create({
  trigger: ".panel",
  start: "top top",
  end: "+=500",
  pin: true,
  pinSpacing: true,
});
```

### 4. Stagger Animations

```tsx
gsap.from(".brand-card", {
  scrollTrigger: {
    trigger: ".brand-grid",
    start: "top 80%",
  },
  opacity: 0,
  y: 30,
  duration: 0.6,
  stagger: {
    amount: 0.8, // Total time for all staggers
    from: "start", // or 'center', 'end', 'random'
  },
});
```

## Best Practices

### 1. Always Use gsap.context()

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    // Your animations
  });

  return () => ctx.revert(); // Essential cleanup
}, []);
```

### 2. Check for Client-Side

```tsx
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
```

### 3. Wait for Elements to Mount

```tsx
useEffect(() => {
  if (!mounted || !elementRef.current) return;
  // Your GSAP code
}, [mounted]);
```

### 4. Use Refs, Not State

```tsx
// ❌ Bad - causes re-renders
const [isAnimating, setIsAnimating] = useState(false);

// ✅ Good - direct DOM manipulation
const elementRef = useRef(null);
gsap.to(elementRef.current, { ... });
```

## Easing Functions

GSAP has the best easing functions:

```tsx
ease: "none"; // Linear
ease: "power1.out"; // Subtle ease out
ease: "power2.out"; // Medium ease out (recommended)
ease: "power3.out"; // Strong ease out
ease: "power4.out"; // Very strong ease out
ease: "back.out(1.7)"; // Overshoot effect
ease: "elastic.out"; // Bouncy effect
ease: "bounce.out"; // Bounce at end
ease: "circ.out"; // Circular easing
ease: "expo.out"; // Exponential easing
```

## Performance Tips

### 1. Animate Transform & Opacity (GPU)

```tsx
// ✅ Good - GPU accelerated
gsap.to(element, { x: 100, opacity: 0.5 });

// ❌ Avoid - CPU intensive
gsap.to(element, { left: "100px", width: "200px" });
```

### 2. Use will-change Sparingly

```tsx
gsap.set(element, { willChange: "transform" });
gsap.to(element, { x: 100 });
gsap.set(element, { willChange: "auto" }); // Reset after
```

### 3. Kill Animations When Done

```tsx
const tween = gsap.to(element, { x: 100 });
// Later...
tween.kill();
```

## Ideas for Your Brand Colors App

### 1. Card Entrance Animations

```tsx
gsap.from(".brand-card", {
  scrollTrigger: {
    trigger: ".brand-grid",
    start: "top 80%",
  },
  opacity: 0,
  scale: 0.9,
  y: 30,
  duration: 0.5,
  stagger: 0.05,
});
```

### 2. Color Swatch Hover

```tsx
const card = useRef(null);

const handleMouseEnter = () => {
  gsap.to(card.current, {
    scale: 1.05,
    duration: 0.3,
    ease: "back.out(1.7)",
  });
};
```

### 3. Search Results Transition

```tsx
useEffect(() => {
  gsap.from(".brand-card", {
    opacity: 0,
    y: 20,
    duration: 0.4,
    stagger: 0.03,
    ease: "power2.out",
  });
}, [filteredBrands]);
```

### 4. Category Filter Animation

```tsx
gsap.from(".badge", {
  scale: 0,
  duration: 0.3,
  stagger: 0.05,
  ease: "back.out(1.7)",
});
```

### 5. Smooth Page Transitions

```tsx
// On route change
gsap.to(".page", {
  opacity: 0,
  y: -20,
  duration: 0.3,
  onComplete: () => {
    // Navigate
    gsap.from(".page", { opacity: 0, y: 20, duration: 0.3 });
  },
});
```

## Resources

- [GSAP Docs](https://greensock.com/docs/)
- [ScrollTrigger Docs](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [GSAP Ease Visualizer](https://greensock.com/ease-visualizer/)
- [GSAP Cheat Sheet](https://greensock.com/cheatsheet/)

## Next Steps

Consider adding GSAP to:

1. ✅ Sticky header (done!)
2. Brand card entrance animations
3. Color swatch interactions
4. Search/filter transitions
5. Theme toggle animation
6. Modal/dialog animations
7. Loading states
8. Page transitions

GSAP will make your app feel incredibly polished and professional! 🚀
