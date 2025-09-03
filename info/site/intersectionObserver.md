# Intersection Observer API - Comprehensive Guide

## Overview
The Intersection Observer API provides a way to asynchronously observe changes in the intersection of a target element with an ancestor element or with a top-level document's viewport. This modern web API eliminates the need for expensive scroll event listeners and provides better performance for detecting element visibility.

## Core Concepts

### What is Intersection Observer?
Intersection Observer is a browser API that allows you to efficiently track when elements enter or leave the viewport (or any other ancestor element). It's particularly useful for:

- **Lazy loading images and content**
- **Implementing infinite scroll**
- **Triggering animations when elements become visible**
- **Performance monitoring and analytics**
- **Implementing "sticky" headers or navigation**

### Key Benefits
1. **Performance**: No need for scroll event listeners that fire continuously
2. **Asynchronous**: Non-blocking, runs off the main thread
3. **Flexible**: Configurable thresholds and root margins
4. **Battery Efficient**: Reduces CPU usage compared to scroll-based solutions

## API Structure

### Basic Syntax
```javascript
const observer = new IntersectionObserver(callback, options);
observer.observe(targetElement);
```

### Callback Function
```javascript
const callback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Element is visible
      console.log('Element entered viewport');
    } else {
      // Element is not visible
      console.log('Element left viewport');
    }
  });
};
```

### Configuration Options
```javascript
const options = {
  root: null,           // null = viewport, or specify ancestor element
  rootMargin: '0px',    // Margin around root (CSS margin syntax)
  threshold: 0.1        // 0-1 or array, percentage of element visible
};
```

## Configuration Options Explained

### `root`
- **Default**: `null` (viewport)
- **Purpose**: Defines the element used as the viewport for checking visibility
- **Use cases**: 
  - `null`: Track visibility relative to browser viewport
  - `element`: Track visibility relative to a scrollable container

### `rootMargin`
- **Default**: `'0px'`
- **Purpose**: Margin around the root, effectively growing/shrinking the root's bounding box
- **Syntax**: CSS margin syntax (`'10px 20px 30px 40px'`)
- **Use cases**:
  - `'50px'`: Trigger 50px before element enters viewport
  - `'-20px'`: Trigger only when element is 20px inside viewport

### `threshold`
- **Default**: `0`
- **Purpose**: Percentage of element that must be visible to trigger callback
- **Values**: 
  - Single number: `0.5` (50% visible)
  - Array: `[0, 0.25, 0.5, 0.75, 1]` (trigger at multiple visibility levels)

## Gaming Dronzz Implementation

### Custom Hook: `useIntersectionObserver`
Located: `site/src/hooks/useIntersectionObserver.ts`

```typescript
interface UseIntersectionObserverOptions {
    threshold?: number | number[];
    rootMargin?: string;
    triggerOnce?: boolean;  // Gaming Dronzz specific feature
}

export const useIntersectionObserver = <T extends HTMLElement = HTMLElement>(
    options: UseIntersectionObserverOptions = {}
) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);  // Track first intersection
    const elementRef = useRef<T>(null);

    // Returns: { elementRef, isIntersecting, hasIntersected }
};
```

**Key Features**:
- **Generic Type Support**: `<T extends HTMLElement>` for type safety
- **Trigger Once**: `triggerOnce` option prevents re-triggering after first intersection
- **State Tracking**: Both current intersection and historical intersection states
- **Memory Management**: Automatic cleanup and unobserving

### Lazy Loading Hook: `useLazyLoad`
Located: `site/src/hooks/useLazyLoad.ts`

```typescript
interface LazyLoadOptions {
    rootMargin?: string;
    threshold?: number;
}

export const useLazyLoad = (options: LazyLoadOptions = {}) => {
    // Handles image lazy loading with data attributes
    // Returns: { observeImage, unobserveImage }
};
```

**Key Features**:
- **Image-Specific**: Specialized for lazy loading images
- **Data Attribute Support**: Uses `data-src` and `data-srcset`
- **Fallback Detection**: Checks for IntersectionObserver support
- **Class Management**: Adds 'loaded' class for CSS transitions

## Usage Examples

### Basic Visibility Detection
```typescript
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const MyComponent = () => {
  const { elementRef, isIntersecting, hasIntersected } = useIntersectionObserver({
    threshold: 0.5,
    triggerOnce: true
  });

  return (
    <div ref={elementRef}>
      {isIntersecting ? 'Visible!' : 'Hidden'}
      {hasIntersected && <p>This element was seen before</p>}
    </div>
  );
};
```

### Lazy Loading Images
```typescript
import { useLazyLoad } from '@/hooks/useLazyLoad';

const ImageGallery = () => {
  const { observeImage } = useLazyLoad({
    rootMargin: '100px',
    threshold: 0.1
  });

  return (
    <img
      ref={observeImage}
      data-src="/path/to/image.jpg"
      alt="Lazy loaded image"
      className="lazy-image"
    />
  );
};
```

### Animation Triggers
```typescript
const AnimatedSection = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: '-50px'
  });

  return (
    <section
      ref={elementRef}
      className={`fade-in ${isIntersecting ? 'animate' : ''}`}
    >
      <h2>This animates when 30% visible</h2>
    </section>
  );
};
```

## Performance Considerations

### Best Practices
1. **Use appropriate thresholds**: Don't use too many threshold values
2. **Set reasonable rootMargin**: Avoid triggering too early/late
3. **Clean up observers**: Always disconnect observers when components unmount
4. **Batch DOM operations**: Group DOM changes triggered by intersection

### Memory Management
```javascript
// Good: Automatic cleanup in useEffect
useEffect(() => {
  const observer = new IntersectionObserver(callback, options);
  observer.observe(element);

  return () => {
    observer.unobserve(element);  // Clean up specific element
    observer.disconnect();        // Clean up entire observer
  };
}, []);
```

### Browser Support
- **Modern browsers**: Full support in Chrome 58+, Firefox 55+, Safari 12.1+
- **Fallback strategy**: Check for support with `'IntersectionObserver' in window`
- **Polyfill available**: For older browsers if needed

## Common Patterns

### Infinite Scroll
```javascript
const { elementRef, isIntersecting } = useIntersectionObserver({
  threshold: 1.0,
  rootMargin: '100px'
});

useEffect(() => {
  if (isIntersecting) {
    loadMoreContent();
  }
}, [isIntersecting]);

return <div ref={elementRef} className="scroll-trigger" />;
```

### Sticky Navigation
```javascript
const { elementRef: headerRef, isIntersecting } = useIntersectionObserver({
  threshold: 0,
  rootMargin: '-60px 0px 0px 0px'
});

return (
  <>
    <div ref={headerRef} className="header-sentinel" />
    <nav className={`navigation ${!isIntersecting ? 'sticky' : ''}`}>
      Navigation content
    </nav>
  </>
);
```

### Progress Tracking
```javascript
const { elementRef, isIntersecting } = useIntersectionObserver({
  threshold: [0, 0.25, 0.5, 0.75, 1.0]
});

const callback = (entries) => {
  entries.forEach(entry => {
    const progress = Math.round(entry.intersectionRatio * 100);
    updateProgress(progress);
  });
};
```

## CSS Integration

### Lazy Loading Styles
```css
.lazy-image {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lazy-image.loaded {
  opacity: 1;
}
```

### Animation Classes
```css
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in.animate {
  opacity: 1;
  transform: translateY(0);
}
```

## Debugging Tips

### Console Logging
```javascript
const callback = (entries) => {
  entries.forEach(entry => {
    console.log({
      element: entry.target,
      isIntersecting: entry.isIntersecting,
      intersectionRatio: entry.intersectionRatio,
      boundingClientRect: entry.boundingClientRect,
      rootBounds: entry.rootBounds
    });
  });
};
```

### Visual Debugging
```javascript
// Add visual indicators for debugging
const callback = (entries) => {
  entries.forEach(entry => {
    entry.target.style.border = entry.isIntersecting 
      ? '2px solid green' 
      : '2px solid red';
  });
};
```

## Advanced Techniques

### Multiple Observers
```javascript
// Different observers for different behaviors
const animationObserver = useIntersectionObserver({
  threshold: 0.3,
  triggerOnce: true
});

const trackingObserver = useIntersectionObserver({
  threshold: 0.5,
  rootMargin: '0px'
});
```

### Dynamic Threshold Adjustment
```javascript
const [threshold, setThreshold] = useState(0.1);

const { elementRef, isIntersecting } = useIntersectionObserver({
  threshold,
  rootMargin: '50px'
});

// Adjust threshold based on element size or other factors
useEffect(() => {
  const element = elementRef.current;
  if (element) {
    const height = element.offsetHeight;
    setThreshold(height > 500 ? 0.3 : 0.1);
  }
}, []);
```

## Current Usage in Gaming Dronzz

The Gaming Dronzz website currently uses Intersection Observer in multiple locations:

1. **Scroll-based animations** in section components
2. **Lazy loading** for performance optimization
3. **Navigation triggers** for UI state changes
4. **Content managers** for dynamic loading
5. **Hero section** for entrance animations

Files utilizing Intersection Observer:
- `site/src/hooks/useIntersectionObserver.ts` - Main hook
- `site/src/hooks/useLazyLoad.ts` - Lazy loading hook
- `site/src/components/sections/*.tsx` - Section animations
- `site/src/managers/*.ts` - Content and scroll management

This implementation provides a robust, performant foundation for modern web interactions while maintaining clean, reusable code patterns.