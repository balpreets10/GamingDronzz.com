# Gaming Dronzz Website Development Instructions

## CSS Organization Requirements

### Core CSS Structure
- Each page/section must have its own dedicated CSS file
- All CSS selectors must use chained selectors following BEM methodology
- CSS files should be organized by component/page structure

### BEM Naming Convention
- **Block**: The standalone entity that is meaningful on its own (e.g., `header`, `menu`, `button`)
- **Element**: A part of a block that has no standalone meaning (e.g., `header__logo`, `menu__item`)
- **Modifier**: A flag on a block or element used to change appearance or behavior (e.g., `button--primary`, `menu__item--active`)

### CSS File Placement
- CSS files should be placed directly alongside their corresponding components
- No centralized styles folder - each component's CSS stays with the component
- Example structure:
```
components/
├── Header/
│   ├── Header.jsx
│   └── Header.css
├── Navigation/
│   ├── Navigation.jsx
│   └── Navigation.css
pages/
├── Home/
│   ├── Home.jsx
│   └── Home.css
├── About/
│   ├── About.jsx
│   └── About.css
```

### Selector Chaining Requirements
- Use chained selectors for specificity
- Follow BEM structure consistently
- Example: `.page-home .hero__title--large` instead of just `.hero__title--large`

### Implementation Guidelines
- Create separate CSS files for each distinct page or component
- Import/link CSS files only where needed
- Maintain consistent BEM naming across all components
- Use CSS custom properties for theming and consistency

### Interactive Element Guidelines
- **Hover Effects**: Only clickable elements (buttons, links, interactive components) should have hover effects
- **Non-Interactive Labels**: Text labels that are not clickable should NOT have hover effects - this prevents user confusion about interactivity

## Development Standards
- Follow existing code conventions in the project
- Test all styling changes across different screen sizes
- Ensure accessibility compliance in all CSS implementations

## SOLID Design Principles & Data Management

### SOLID Principles Adherence
The website must strictly follow SOLID design principles in all coding practices:

- **Single Responsibility Principle (SRP)**: Each component, function, and module should have only one reason to change
- **Open/Closed Principle (OCP)**: Software entities should be open for extension but closed for modification
- **Liskov Substitution Principle (LSP)**: Objects of a superclass should be replaceable with objects of a subclass without breaking functionality
- **Interface Segregation Principle (ISP)**: Clients should not be forced to depend on interfaces they do not use
- **Dependency Inversion Principle (DIP)**: Depend on abstractions, not concretions

### Data Management Requirements
- **Single Source of Truth**: All data must have one authoritative source - avoid data duplication across components
- **Data Separation**: Business logic and data management must be completely separated from presentation components
- **Centralized State Management**: Use proper state management patterns (Context API, Redux, or similar) for shared data
- **Data Layer Abstraction**: Implement a clear data access layer that abstracts data sources from business logic
- **Immutable Data Patterns**: Treat data as immutable where possible to prevent unintended side effects