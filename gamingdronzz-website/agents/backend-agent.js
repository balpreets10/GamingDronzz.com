/**
 * Backend Agent - Specialized for server-side development and API management
 * Handles all backend-related tasks following SOLID principles and security best practices
 */

class BackendAgent {
  constructor() {
    this.name = 'BackendAgent';
    this.specialization = 'Server-side development, APIs, databases, authentication';
    this.responsibilities = [
      'Create and maintain API endpoints',
      'Implement authentication and authorization',
      'Design and manage database schemas',
      'Handle server-side business logic',
      'Implement security measures',
      'Manage data validation and sanitization',
      'Handle file uploads and processing',
      'Implement caching strategies',
      'Monitor performance and logging'
    ];
  }

  /**
   * Creates a new API endpoint following REST principles
   * @param {string} endpointName - Name of the endpoint
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
   * @param {Object} endpointSpec - Endpoint specifications
   */
  createAPIEndpoint(endpointName, method, endpointSpec) {
    const endpointContent = this.generateAPIEndpoint(endpointName, method, endpointSpec);
    
    return {
      action: 'create',
      file: `routes/${endpointName}.js`,
      content: endpointContent,
      method: method,
      authentication: endpointSpec.requiresAuth || false,
      validation: endpointSpec.validation || []
    };
  }

  /**
   * Generates API endpoint code with security and validation
   * @param {string} endpointName 
   * @param {string} method 
   * @param {Object} spec 
   */
  generateAPIEndpoint(endpointName, method, spec) {
    const { requiresAuth = false, validation = [], database = false, response = {} } = spec;
    
    let endpointCode = `const express = require('express');\n`;
    endpointCode += `const router = express.Router();\n`;
    
    // Add validation middleware if needed
    if (validation.length > 0) {
      endpointCode += `const { body, validationResult } = require('express-validator');\n`;
    }
    
    // Add authentication middleware if needed
    if (requiresAuth) {
      endpointCode += `const { authenticateToken } = require('../middleware/auth');\n`;
    }
    
    // Add database connection if needed
    if (database) {
      endpointCode += `const db = require('../config/database');\n`;
    }
    
    endpointCode += '\n';

    // Validation rules
    if (validation.length > 0) {
      endpointCode += `const validate${this.capitalize(endpointName)} = [\n`;
      validation.forEach(rule => {
        endpointCode += `  body('${rule.field}')${this.generateValidationChain(rule)},\n`;
      });
      endpointCode += `];\n\n`;
    }

    // Main endpoint handler
    const middlewares = [];
    if (requiresAuth) middlewares.push('authenticateToken');
    if (validation.length > 0) middlewares.push(`validate${this.capitalize(endpointName)}`);
    
    const middlewareString = middlewares.length > 0 ? `${middlewares.join(', ')}, ` : '';
    
    endpointCode += `router.${method.toLowerCase()}('/${endpointName}', ${middlewareString}async (req, res) => {\n`;
    
    // Validation error handling
    if (validation.length > 0) {
      endpointCode += `  const errors = validationResult(req);\n`;
      endpointCode += `  if (!errors.isEmpty()) {\n`;
      endpointCode += `    return res.status(400).json({\n`;
      endpointCode += `      success: false,\n`;
      endpointCode += `      message: 'Validation failed',\n`;
      endpointCode += `      errors: errors.array()\n`;
      endpointCode += `    });\n  }\n\n`;
    }

    // Try-catch block for error handling
    endpointCode += `  try {\n`;
    
    // Extract request data based on method
    if (method.toUpperCase() !== 'GET') {
      endpointCode += `    const { ${this.generateRequestExtraction(validation)} } = req.body;\n\n`;
    }

    // Database operations placeholder
    if (database) {
      endpointCode += `    // Database operations\n`;
      if (method.toUpperCase() === 'POST') {
        endpointCode += `    const result = await db.query(\n`;
        endpointCode += `      'INSERT INTO ${endpointName} (...) VALUES (...)',\n`;
        endpointCode += `      [...]\n    );\n\n`;
      } else if (method.toUpperCase() === 'GET') {
        endpointCode += `    const result = await db.query(\n`;
        endpointCode += `      'SELECT * FROM ${endpointName} WHERE ...',\n`;
        endpointCode += `      [...]\n    );\n\n`;
      }
    }

    // Success response
    endpointCode += `    res.json({\n`;
    endpointCode += `      success: true,\n`;
    endpointCode += `      message: '${this.capitalize(endpointName)} ${method.toLowerCase()} successful'`;
    if (database) {
      endpointCode += `,\n      data: result`;
    }
    endpointCode += `\n    });\n\n`;

    // Error handling
    endpointCode += `  } catch (error) {\n`;
    endpointCode += `    console.error('${endpointName} ${method} error:', error);\n`;
    endpointCode += `    res.status(500).json({\n`;
    endpointCode += `      success: false,\n`;
    endpointCode += `      message: 'Internal server error'\n`;
    endpointCode += `    });\n  }\n});\n\n`;

    endpointCode += `module.exports = router;`;
    
    return endpointCode;
  }

  /**
   * Generates validation chain for express-validator
   * @param {Object} rule 
   */
  generateValidationChain(rule) {
    let chain = '';
    
    if (rule.required) chain += '.notEmpty().withMessage("Field is required")';
    if (rule.type === 'email') chain += '.isEmail().withMessage("Invalid email format")';
    if (rule.type === 'string') chain += '.isString().withMessage("Must be a string")';
    if (rule.type === 'number') chain += '.isNumeric().withMessage("Must be a number")';
    if (rule.minLength) chain += `.isLength({ min: ${rule.minLength} }).withMessage("Minimum ${rule.minLength} characters")`;
    if (rule.maxLength) chain += `.isLength({ max: ${rule.maxLength} }).withMessage("Maximum ${rule.maxLength} characters")`;
    
    return chain;
  }

  /**
   * Generates request data extraction based on validation rules
   * @param {Array} validation 
   */
  generateRequestExtraction(validation) {
    return validation.map(rule => rule.field).join(', ');
  }

  /**
   * Creates authentication middleware
   * @param {string} type - Type of authentication (jwt, session, etc.)
   */
  createAuthMiddleware(type = 'jwt') {
    let middlewareCode = '';
    
    if (type === 'jwt') {
      middlewareCode = `const jwt = require('jsonwebtoken');\n\n`;
      middlewareCode += `const authenticateToken = (req, res, next) => {\n`;
      middlewareCode += `  const authHeader = req.headers['authorization'];\n`;
      middlewareCode += `  const token = authHeader && authHeader.split(' ')[1];\n\n`;
      middlewareCode += `  if (!token) {\n`;
      middlewareCode += `    return res.status(401).json({\n`;
      middlewareCode += `      success: false,\n`;
      middlewareCode += `      message: 'Access token required'\n`;
      middlewareCode += `    });\n  }\n\n`;
      middlewareCode += `  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {\n`;
      middlewareCode += `    if (err) {\n`;
      middlewareCode += `      return res.status(403).json({\n`;
      middlewareCode += `        success: false,\n`;
      middlewareCode += `        message: 'Invalid or expired token'\n`;
      middlewareCode += `      });\n    }\n`;
      middlewareCode += `    req.user = user;\n`;
      middlewareCode += `    next();\n  });\n};\n\n`;
      middlewareCode += `module.exports = { authenticateToken };`;
    }
    
    return middlewareCode;
  }

  /**
   * Creates database connection configuration
   * @param {string} dbType - Database type (mysql, postgresql, mongodb)
   * @param {Object} config - Database configuration
   */
  createDatabaseConfig(dbType, config) {
    let dbConfig = '';
    
    if (dbType === 'mysql') {
      dbConfig = `const mysql = require('mysql2/promise');\n\n`;
      dbConfig += `const dbConfig = {\n`;
      dbConfig += `  host: process.env.DB_HOST || '${config.host || 'localhost'}',\n`;
      dbConfig += `  user: process.env.DB_USER || '${config.user || 'root'}',\n`;
      dbConfig += `  password: process.env.DB_PASSWORD || '',\n`;
      dbConfig += `  database: process.env.DB_NAME || '${config.database}',\n`;
      dbConfig += `  port: process.env.DB_PORT || ${config.port || 3306},\n`;
      dbConfig += `  waitForConnections: true,\n`;
      dbConfig += `  connectionLimit: 10,\n`;
      dbConfig += `  queueLimit: 0\n};\n\n`;
      dbConfig += `const pool = mysql.createPool(dbConfig);\n\n`;
      dbConfig += `module.exports = pool;`;
    }
    
    return dbConfig;
  }

  /**
   * Capitalizes first letter of string
   * @param {string} str 
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Task handler for backend requests
   */
  handleTask(task) {
    const taskType = this.identifyTaskType(task);
    
    switch(taskType) {
      case 'create-api':
        return this.createAPI(task);
      case 'setup-auth':
        return this.setupAuthentication(task);
      case 'setup-database':
        return this.setupDatabase(task);
      case 'create-middleware':
        return this.createMiddleware(task);
      case 'implement-security':
        return this.implementSecurity(task);
      default:
        return this.genericBackendTask(task);
    }
  }

  identifyTaskType(task) {
    const taskLower = task.toLowerCase();
    if (taskLower.includes('api') || taskLower.includes('endpoint')) return 'create-api';
    if (taskLower.includes('auth') || taskLower.includes('login')) return 'setup-auth';
    if (taskLower.includes('database') || taskLower.includes('db')) return 'setup-database';
    if (taskLower.includes('middleware')) return 'create-middleware';
    if (taskLower.includes('security') || taskLower.includes('secure')) return 'implement-security';
    return 'generic';
  }

  /**
   * Validates API structure against security best practices
   * @param {string} apiCode 
   */
  validateSecurityCompliance(apiCode) {
    return {
      hasInputValidation: /validationResult|validator/.test(apiCode),
      hasErrorHandling: /try.*catch/.test(apiCode),
      hasAuthentication: /authenticateToken|auth/.test(apiCode),
      hasParameterSanitization: /sanitize|escape/.test(apiCode),
      hasRateLimiting: /rateLimit/.test(apiCode),
      hasSecureHeaders: /helmet|security/.test(apiCode),
      noHardcodedSecrets: !/password.*=.*['"]\w+['"]|secret.*=.*['"]\w+['"]/.test(apiCode)
    };
  }

  getCapabilities() {
    return {
      name: this.name,
      specialization: this.specialization,
      responsibilities: this.responsibilities,
      supports: [
        'RESTful API design',
        'Express.js routing',
        'Authentication (JWT, OAuth)',
        'Database integration (MySQL, PostgreSQL, MongoDB)',
        'Input validation and sanitization',
        'Error handling and logging',
        'Security middleware',
        'Rate limiting',
        'File upload handling',
        'Caching strategies',
        'Performance monitoring'
      ]
    };
  }
}

module.exports = BackendAgent;