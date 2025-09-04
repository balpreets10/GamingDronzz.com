# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a standalone React page directory for the "Terrace On 3" restaurant landing page. It operates independently from any parent application and contains a self-contained React component with CSS styling.

## File Structure

- `Terraceon3/Terraceon3.tsx` - Main React component with TypeScript
- `Terraceon3/Terraceon3.css` - Component-specific CSS styling
- `Terraceon3/terraceon3.html` - Standalone HTML version (if needed)

## Architecture

### Component Structure
The main component (`Terraceon3.tsx`) is a single-page application featuring:

- **CSS Isolation**: Uses `terrace-page` body class for CSS scoping
- **Scroll-based Navigation**: Dynamic navbar that shows/hides based on scroll direction
- **Intersection Observer Animations**: Cards animate into view as user scrolls
- **Smooth Scrolling**: Internal navigation using `scrollIntoView` API
- **Responsive Design**: Mobile-first approach with CSS Grid layouts

### Key Features
- Rooftop restaurant showcase with three dining concepts
- Hero section with restaurant previews
- Detailed restaurant cards with features
- Contact section with multiple locations
- Animation system using Intersection Observer API

## Development Guidelines

### CSS Class Naming
All CSS classes use the `terrace-` prefix to avoid conflicts:
- Layout: `terrace-hero`, `terrace-restaurants-section`  
- Components: `terrace-restaurant-card`, `terrace-navbar`
- States: `terrace-cta-primary`, `terrace-cta-secondary`

### Animation System
The component implements a custom animation system:
- Cards start with `opacity: 0` and `translateY(30px)`
- Intersection Observer triggers animations with staggered delays
- Cleanup properly handled in useEffect return functions

### Scroll Management
- Navbar visibility controlled by scroll direction detection
- Smooth scrolling navigation between sections
- Scroll event listeners properly cleaned up

## Styling Approach

The CSS follows a component-scoped approach:
- All styles prefixed with `terrace-` to prevent conflicts
- CSS Grid used for responsive layouts
- Custom properties likely used for consistent theming
- Background patterns and overlays for visual depth

## External Dependencies

The component uses only React built-in hooks:
- `useState` for component state
- `useEffect` for lifecycle management and DOM manipulation
- Standard DOM APIs (Intersection Observer, scrollIntoView)

## Images and Assets

All images are hosted externally via URLs. No local asset management required for this standalone page.