# Sticky Header Styling Guide

## How It Works

The header now detects when it becomes "stuck" at the top of the page using the **Intersection Observer API**. When stuck, the header gets an `is-stuck` class that you can use to style it and its children.

## Implementation Details

### JavaScript Detection

- Uses `IntersectionObserver` to watch a sentinel element
- Updates `isStuck` state when header position changes
- Adds `is-stuck` class to header when stuck

### Current Styling Examples

#### 1. **Header Itself**

```tsx
className={`sticky top-4 z-50 w-full rounded-xl glass shadow-xl shadow-neutral-900/5 transition-smooth ${
  isStuck ? 'is-stuck' : ''
}`}
```

When stuck:

- Enhanced shadow (`.is-stuck` applies `shadow-2xl`)
- Increased background opacity (80% light, 95% dark)

#### 2. **Icon Scaling**

```tsx
<FolderOpen
  className={`h-6 w-6 transition-smooth ${
    isStuck ? "text-primary scale-95" : "text-primary"
  }`}
/>
```

When stuck: Icon scales down to 95%

#### 3. **Title Size**

```tsx
<h1
  className={`text-lg font-medium tracking-tight transition-smooth ${
    isStuck ? "text-sm" : ""
  }`}
>
  Brand×Colors · Directory
</h1>
```

When stuck: Title becomes smaller (text-sm)

## More Styling Options

### Option 1: Inline Conditional Classes (Current Approach)

```tsx
<div
  className={`some-base-classes ${
    isStuck ? "stuck-classes" : "normal-classes"
  }`}
>
  Content
</div>
```

**Pros:** Simple, explicit, easy to understand
**Cons:** Can get verbose with many elements

### Option 2: CSS-Only with `.is-stuck` Parent Selector

Add to `globals.css`:

```css
/* Style children when header is stuck */
.is-stuck h1 {
  @apply text-sm;
}

.is-stuck .header-icon {
  @apply scale-95;
}

.is-stuck .search-input {
  @apply h-10; /* Make search smaller */
}
```

Then in JSX:

```tsx
<FolderOpen className="h-6 w-6 header-icon transition-smooth" />
<Input className="search-input" ... />
```

**Pros:** Cleaner JSX, centralized styling
**Cons:** Less explicit, need to add class names

### Option 3: Tailwind Group Utilities

Use Tailwind's group feature:

```tsx
<header className={`group sticky ... ${isStuck ? "is-stuck" : ""}`}>
  <h1 className="text-lg group-[.is-stuck]:text-sm">Title</h1>
  <FolderOpen className="h-6 group-[.is-stuck]:scale-95" />
</header>
```

**Pros:** No extra CSS, all in JSX
**Cons:** Verbose class names

## Example Styling Ideas

### Compact Header When Stuck

```tsx
<div className={`container mx-auto px-4 ${isStuck ? 'py-2' : 'py-4'}`}>
```

### Hide Elements When Stuck

```tsx
<div className={`${isStuck ? "hidden" : "block"}`}>
  {/* Category badges - hide when stuck */}
</div>
```

### Change Colors When Stuck

```tsx
<h1 className={`${isStuck ? 'text-primary' : 'text-foreground'}`}>
```

### Animate Search Bar

```tsx
<Input className={`${isStuck ? "h-9 text-sm" : "h-11"} transition-smooth`} />
```

## CSS Utilities Available

### `.is-stuck`

- Automatically applied when header is stuck
- Adds `shadow-2xl` for enhanced shadow
- Increases glass background opacity

### `.transition-smooth`

- Smooth 300ms cubic-bezier transition
- Apply to any element that changes when stuck

## Tips

1. **Always add `transition-smooth`** to elements that change when stuck for smooth animations
2. **Test both states** - make sure styling looks good both stuck and unstuck
3. **Consider mobile** - stuck behavior might need different styling on mobile
4. **Performance** - IntersectionObserver is very performant, no scroll event listeners needed
5. **Accessibility** - Ensure stuck header doesn't cover important content

## Customization

To change what happens when stuck, modify:

1. **State-based classes** in `page.tsx` (lines 95-105)
2. **CSS utilities** in `globals.css` (lines 175-186)
