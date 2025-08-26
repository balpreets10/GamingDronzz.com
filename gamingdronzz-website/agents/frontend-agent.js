/**
 * Frontend Agent - Specialized for React components and client-side development
 * Handles all frontend-related tasks following SOLID principles and Gaming Dronzz standards
 */

class FrontendAgent {
  constructor() {
    this.name = 'FrontendAgent';
    this.specialization = 'React components, state management, client-side logic';
    this.responsibilities = [
      'Create and maintain React components',
      'Implement SOLID design principles',
      'Manage component state and props',
      'Handle client-side routing',
      'Integrate with backend APIs',
      'Implement form handling and validation',
      'Manage authentication and authorization',
      'Optimize component performance'
    ];
  }

  /**
   * Creates a new React component following SOLID principles
   * @param {string} componentName - Name of the component
   * @param {string} componentPath - Path where component should be created
   * @param {Object} componentSpec - Component specifications
   */
  createReactComponent(componentName, componentPath, componentSpec) {
    const componentContent = this.generateReactComponent(componentName, componentSpec);
    
    return {
      action: 'create',
      file: `${componentPath}/${componentName}.jsx`,
      content: componentContent,
      framework: 'React',
      principles: 'SOLID',
      includes: ['PropTypes', 'CSS imports', 'Error boundaries']
    };
  }

  /**
   * Generates React component code following Gaming Dronzz standards
   * @param {string} componentName 
   * @param {Object} spec 
   */
  generateReactComponent(componentName, spec) {
    const { props = [], state = [], hooks = [], methods = [] } = spec;
    
    let componentCode = `import React`;
    if (state.length > 0 || hooks.includes('useState')) {
      componentCode += `, { useState, useEffect }`;
    }
    componentCode += ` from 'react';\n`;
    
    // Add PropTypes import
    componentCode += `import PropTypes from 'prop-types';\n`;
    
    // Add CSS import
    componentCode += `import './${componentName}.css';\n\n`;

    // Generate component
    componentCode += `/**\n * ${componentName} Component\n * Follows SOLID principles and BEM methodology\n */\n`;
    componentCode += `const ${componentName} = (${props.length > 0 ? `{ ${props.join(', ')} }` : ''}) => {\n`;
    
    // Add state hooks
    state.forEach(stateVar => {
      componentCode += `  const [${stateVar}, set${this.capitalize(stateVar)}] = useState(null);\n`;
    });
    
    if (state.length > 0) componentCode += '\n';

    // Add useEffect if specified
    if (hooks.includes('useEffect')) {
      componentCode += `  useEffect(() => {\n    // Component initialization logic\n  }, []);\n\n`;
    }

    // Add methods
    methods.forEach(method => {
      componentCode += `  const handle${this.capitalize(method)} = () => {\n    // ${method} logic\n  };\n\n`;
    });

    // Component render
    const bemClass = this.convertToBEMClass(componentName);
    componentCode += `  return (\n    <div className="${bemClass}">\n`;
    componentCode += `      {/* ${componentName} content */}\n`;
    componentCode += `    </div>\n  );\n};\n\n`;

    // PropTypes
    if (props.length > 0) {
      componentCode += `${componentName}.propTypes = {\n`;
      props.forEach(prop => {
        componentCode += `  ${prop}: PropTypes.any,\n`;
      });
      componentCode += `};\n\n`;
    }

    componentCode += `export default ${componentName};`;
    
    return componentCode;
  }

  /**
   * Converts component name to BEM class naming
   * @param {string} componentName 
   */
  convertToBEMClass(componentName) {
    return componentName.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '');
  }

  /**
   * Capitalizes first letter of string
   * @param {string} str 
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Creates a context provider following SOLID principles
   * @param {string} contextName 
   * @param {Object} contextSpec 
   */
  createContextProvider(contextName, contextSpec) {
    const { state = [], actions = [] } = contextSpec;
    
    let contextCode = `import React, { createContext, useContext, useReducer } from 'react';\n\n`;
    
    // Initial state
    contextCode += `const initial${contextName}State = {\n`;
    state.forEach(stateKey => {
      contextCode += `  ${stateKey}: null,\n`;
    });
    contextCode += `};\n\n`;

    // Reducer
    contextCode += `const ${contextName.toLowerCase()}Reducer = (state, action) => {\n`;
    contextCode += `  switch (action.type) {\n`;
    actions.forEach(action => {
      contextCode += `    case '${action.toUpperCase()}':\n`;
      contextCode += `      return { ...state, ...action.payload };\n`;
    });
    contextCode += `    default:\n      return state;\n  }\n};\n\n`;

    // Context
    contextCode += `const ${contextName}Context = createContext();\n\n`;

    // Provider component
    contextCode += `export const ${contextName}Provider = ({ children }) => {\n`;
    contextCode += `  const [state, dispatch] = useReducer(${contextName.toLowerCase()}Reducer, initial${contextName}State);\n\n`;
    
    // Action creators
    actions.forEach(action => {
      contextCode += `  const ${action} = (payload) => {\n`;
      contextCode += `    dispatch({ type: '${action.toUpperCase()}', payload });\n`;
      contextCode += `  };\n\n`;
    });

    contextCode += `  const contextValue = {\n    state,\n`;
    actions.forEach(action => {
      contextCode += `    ${action},\n`;
    });
    contextCode += `  };\n\n`;

    contextCode += `  return (\n    <${contextName}Context.Provider value={contextValue}>\n      {children}\n    </${contextName}Context.Provider>\n  );\n};\n\n`;

    // Hook
    contextCode += `export const use${contextName} = () => {\n`;
    contextCode += `  const context = useContext(${contextName}Context);\n`;
    contextCode += `  if (!context) {\n`;
    contextCode += `    throw new Error('use${contextName} must be used within ${contextName}Provider');\n`;
    contextCode += `  }\n  return context;\n};`;

    return contextCode;
  }

  /**
   * Task handler for frontend requests
   */
  handleTask(task) {
    const taskType = this.identifyTaskType(task);
    
    switch(taskType) {
      case 'create-component':
        return this.createComponent(task);
      case 'create-page':
        return this.createPage(task);
      case 'implement-routing':
        return this.implementRouting(task);
      case 'add-state-management':
        return this.addStateManagement(task);
      case 'integrate-api':
        return this.integrateAPI(task);
      default:
        return this.genericFrontendTask(task);
    }
  }

  identifyTaskType(task) {
    const taskLower = task.toLowerCase();
    if (taskLower.includes('component') && !taskLower.includes('page')) return 'create-component';
    if (taskLower.includes('page')) return 'create-page';
    if (taskLower.includes('routing') || taskLower.includes('route')) return 'implement-routing';
    if (taskLower.includes('state') || taskLower.includes('context')) return 'add-state-management';
    if (taskLower.includes('api') || taskLower.includes('fetch')) return 'integrate-api';
    return 'generic';
  }

  /**
   * Validates component structure against SOLID principles
   * @param {string} componentCode 
   */
  validateSOLIDCompliance(componentCode) {
    return {
      singleResponsibility: this.checkSingleResponsibility(componentCode),
      openClosed: this.checkOpenClosed(componentCode),
      dependencyInversion: this.checkDependencyInversion(componentCode),
      hasProperImports: /import.*from/.test(componentCode),
      hasPropTypes: /PropTypes/.test(componentCode),
      hasErrorHandling: /try.*catch|Error/.test(componentCode)
    };
  }

  checkSingleResponsibility(code) {
    // Simple heuristic: component should have focused responsibility
    const functionsCount = (code.match(/const \w+ = |function \w+/g) || []).length;
    return functionsCount <= 5; // Reasonable limit for single responsibility
  }

  checkOpenClosed(code) {
    // Check for extensibility patterns
    return /props\.children|\.\.\.props|defaultProps/.test(code);
  }

  checkDependencyInversion(code) {
    // Check for dependency injection patterns
    return /props\.\w+Function|useCallback|useMemo/.test(code);
  }

  getCapabilities() {
    return {
      name: this.name,
      specialization: this.specialization,
      responsibilities: this.responsibilities,
      supports: [
        'React functional components',
        'React hooks',
        'Context API',
        'State management',
        'Component lifecycle',
        'Event handling',
        'Form management',
        'API integration',
        'Authentication',
        'Routing',
        'Performance optimization'
      ]
    };
  }
}

module.exports = FrontendAgent;