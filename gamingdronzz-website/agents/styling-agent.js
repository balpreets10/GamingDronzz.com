/**
 * Styling Agent - Specialized for CSS/BEM methodology and theming
 * Handles all styling-related tasks following Gaming Dronzz CSS organization requirements
 */

class StylingAgent {
  constructor() {
    this.name = 'StylingAgent';
    this.specialization = 'CSS/BEM styling, theming, responsive design';
    this.responsibilities = [
      'Create and maintain CSS files using BEM methodology',
      'Implement chained selectors for specificity',
      'Organize CSS files alongside components',
      'Handle responsive design and cross-browser compatibility',
      'Manage themes and CSS custom properties',
      'Ensure proper hover states only on interactive elements',
      'Maintain accessibility compliance in styling'
    ];
  }

  /**
   * Creates a new CSS file following BEM methodology
   * @param {string} componentName - Name of the component
   * @param {string} componentPath - Path where the CSS should be created
   * @param {Object} styles - Style definitions
   */
  createCSSFile(componentName, componentPath, styles) {
    const bemBlock = this.convertToBEMBlock(componentName);
    const cssContent = this.generateBEMCSS(bemBlock, styles);
    
    return {
      action: 'create',
      file: `${componentPath}/${componentName}.css`,
      content: cssContent,
      methodology: 'BEM',
      chainedSelectors: true
    };
  }

  /**
   * Converts component name to BEM block naming convention
   * @param {string} componentName 
   */
  convertToBEMBlock(componentName) {
    return componentName.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '');
  }

  /**
   * Generates BEM-compliant CSS with chained selectors
   * @param {string} blockName 
   * @param {Object} styles 
   */
  generateBEMCSS(blockName, styles) {
    let css = `/* ${blockName} Component Styles - BEM Methodology */\n\n`;
    
    // Generate block styles
    css += `.${blockName} {\n`;
    if (styles.block) {
      Object.entries(styles.block).forEach(([prop, value]) => {
        css += `  ${prop}: ${value};\n`;
      });
    }
    css += `}\n\n`;

    // Generate element styles
    if (styles.elements) {
      Object.entries(styles.elements).forEach(([elementName, elementStyles]) => {
        css += `.${blockName}__${elementName} {\n`;
        Object.entries(elementStyles).forEach(([prop, value]) => {
          css += `  ${prop}: ${value};\n`;
        });
        css += `}\n\n`;
      });
    }

    // Generate modifier styles
    if (styles.modifiers) {
      Object.entries(styles.modifiers).forEach(([modifierName, modifierStyles]) => {
        css += `.${blockName}--${modifierName} {\n`;
        Object.entries(modifierStyles).forEach(([prop, value]) => {
          css += `  ${prop}: ${value};\n`;
        });
        css += `}\n\n`;
      });
    }

    return css;
  }

  /**
   * Validates CSS structure against Gaming Dronzz requirements
   * @param {string} cssContent 
   */
  validateCSSStructure(cssContent) {
    const validation = {
      hasBEMNaming: /\.[a-z-]+(__[a-z-]+)?(--[a-z-]+)?/.test(cssContent),
      hasChainedSelectors: /\.[a-z-]+\s+\.[a-z-]+/.test(cssContent),
      noGlobalSelectors: !/^[a-zA-Z]+\s*\{/.test(cssContent),
      hasCustomProperties: /--[a-z-]+/.test(cssContent)
    };

    return validation;
  }

  /**
   * Task handler for styling requests
   */
  handleTask(task) {
    const taskType = this.identifyTaskType(task);
    
    switch(taskType) {
      case 'create-component-styles':
        return this.createComponentStyles(task);
      case 'update-theme':
        return this.updateTheme(task);
      case 'fix-responsive':
        return this.fixResponsiveIssues(task);
      case 'implement-hover-states':
        return this.implementHoverStates(task);
      default:
        return this.genericStylingTask(task);
    }
  }

  identifyTaskType(task) {
    const taskLower = task.toLowerCase();
    if (taskLower.includes('component') && taskLower.includes('style')) return 'create-component-styles';
    if (taskLower.includes('theme')) return 'update-theme';
    if (taskLower.includes('responsive') || taskLower.includes('mobile')) return 'fix-responsive';
    if (taskLower.includes('hover')) return 'implement-hover-states';
    return 'generic';
  }

  getCapabilities() {
    return {
      name: this.name,
      specialization: this.specialization,
      responsibilities: this.responsibilities,
      supports: [
        'BEM methodology',
        'CSS custom properties',
        'Responsive design',
        'Theme management',
        'Accessibility compliance',
        'Cross-browser compatibility',
        'Performance optimization'
      ]
    };
  }
}

module.exports = StylingAgent;