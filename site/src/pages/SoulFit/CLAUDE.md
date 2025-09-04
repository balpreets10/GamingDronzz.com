# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a standalone React page directory for the "SoulFit" fitness center landing page. It operates independently from any parent application and contains a self-contained React component with CSS styling for Jammu's premier fitness destination.

## File Structure

- `SoulFit/SoulFit.tsx` - Main React component with TypeScript
- `SoulFit/SoulFit.css` - Component-specific CSS styling

## Architecture

### Component Structure
The main component (`SoulFit.tsx`) is a single-page application featuring:

- **CSS Isolation**: Uses `soulfit-page` body class for CSS scoping
- **Scroll-based Navigation**: Dynamic navbar that shows/hides based on scroll direction
- **Intersection Observer Animations**: Cards animate into view as user scrolls
- **Smooth Scrolling**: Internal navigation using `scrollIntoView` API
- **Responsive Design**: Mobile-first approach with CSS Grid layouts

### Key Features
- Fitness center showcase with multiple training programs
- Hero section with program previews (Strength Training, Cardio Fitness, Personal Training)
- About section with facility highlights and mission/values
- Detailed program cards with features and descriptions
- Contact section with location and membership information
- Social media integration (Facebook, Instagram)
- Animation system using Intersection Observer API

## Development Guidelines

### CSS Class Naming
All CSS classes use the `soulfit-` prefix to avoid conflicts:
- Layout: `soulfit-hero`, `soulfit-programs-section`, `soulfit-about-section`
- Components: `soulfit-program-card`, `soulfit-navbar`, `soulfit-contact-card`
- States: `soulfit-cta-primary`, `soulfit-cta-secondary`
- Animations: `soulfit-program-card`, `soulfit-feature-card`, `soulfit-about-highlight-card`

### Animation System
The component implements a custom animation system:
- Cards start with `opacity: 0` and `translateY(30px)`
- Intersection Observer triggers animations with staggered delays (0.1s increments)
- Animated elements include: program cards, feature cards, contact cards, about highlights, story sections
- Cleanup properly handled in useEffect return functions

### Scroll Management
- Navbar visibility controlled by scroll direction detection (shows when scrolling up, hides when scrolling down)
- Navbar appears after scrolling past 100px from top
- Smooth scrolling navigation between sections
- Scroll event listeners properly cleaned up

## Styling Approach

The CSS follows a component-scoped approach:
- All styles prefixed with `soulfit-` to prevent conflicts
- CSS isolation using `body.soulfit-page` class selector
- CSS Grid used for responsive layouts
- Glass-morphism design with backdrop filters and rgba backgrounds
- Gradient backgrounds and hover effects
- Custom color scheme: Primary blue gradient (#1e3c72 to #2a5298), Accent orange (#ff6b35)

## Color Scheme
- **Primary Background**: Linear gradient from #1e3c72 to #2a5298
- **Accent Color**: #ff6b35 (orange) for highlights, buttons, and important text
- **Text Colors**: #fff (primary), #e0e8f0 (secondary), #ff6b35 (accent)
- **Card Backgrounds**: rgba(255, 255, 255, 0.1) with backdrop blur effects

## External Dependencies

The component uses only React built-in hooks:
- `useState` for component state management
- `useEffect` for lifecycle management and DOM manipulation
- Standard DOM APIs (Intersection Observer, scrollIntoView)

## Images and Assets

All images are hosted externally via Unsplash URLs:
- Hero logo and gym interior images
- Program preview images (strength training, cardio, personal training)
- Program card images with specific fitness themes
- No local asset management required for this standalone page

## Social Media Integration

The page includes external links to:
- Facebook: https://www.facebook.com/soul.fit.jammu/
- Instagram: https://www.instagram.com/soul.fit.jammu/

## Responsive Breakpoints

Mobile responsiveness handled at 768px breakpoint:
- Hero section converts from 2-column to single column layout
- Program previews convert from 3-column to single column
- Navigation adapts to vertical layout with centered links
- Contact grid converts to single column
- Social links stack vertically

## Animation Classes

The following elements are animated on scroll:
- `.soulfit-program-card` - Main program cards
- `.soulfit-feature-card` - Feature highlight cards  
- `.soulfit-contact-card` - Contact section cards
- `.soulfit-about-highlight-card` - About section highlights
- `.soulfit-about-story` - About story section
- `.soulfit-about-vision` - About vision/mission section