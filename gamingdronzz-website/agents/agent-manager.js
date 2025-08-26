/**
 * Agent Manager - Coordinates and manages specialized subagents
 * Routes tasks to appropriate agents based on task type and specialization
 */

const StylingAgent = require('./styling-agent');
const FrontendAgent = require('./frontend-agent');
const BackendAgent = require('./backend-agent');

class AgentManager {
  constructor() {
    this.agents = {
      styling: new StylingAgent(),
      frontend: new FrontendAgent(),
      backend: new BackendAgent()
    };
    
    this.taskKeywords = {
      styling: ['css', 'style', 'theme', 'responsive', 'mobile', 'hover', 'bem', 'design'],
      frontend: ['component', 'react', 'jsx', 'page', 'route', 'state', 'props', 'ui'],
      backend: ['api', 'endpoint', 'server', 'database', 'auth', 'middleware', 'security']
    };
  }

  /**
   * Routes a task to the appropriate agent
   * @param {string} task - Task description
   * @param {Object} context - Additional context for the task
   */
  routeTask(task, context = {}) {
    const agentType = this.determineAgentType(task);
    const agent = this.agents[agentType];
    
    if (!agent) {
      throw new Error(`No agent found for task type: ${agentType}`);
    }

    console.log(`🤖 Routing task to ${agent.name}: "${task}"`);
    
    return {
      agent: agentType,
      handler: agent,
      result: agent.handleTask(task, context)
    };
  }

  /**
   * Determines which agent should handle the task
   * @param {string} task 
   */
  determineAgentType(task) {
    const taskLower = task.toLowerCase();
    const scores = {};

    // Score each agent type based on keyword matches
    Object.entries(this.taskKeywords).forEach(([agentType, keywords]) => {
      scores[agentType] = keywords.reduce((score, keyword) => {
        return taskLower.includes(keyword) ? score + 1 : score;
      }, 0);
    });

    // Find the agent type with the highest score
    const bestMatch = Object.entries(scores).reduce((best, [agentType, score]) => {
      return score > best.score ? { type: agentType, score } : best;
    }, { type: 'frontend', score: 0 }); // Default to frontend if no clear match

    return bestMatch.type;
  }

  /**
   * Gets capabilities of all agents
   */
  getAllCapabilities() {
    return Object.entries(this.agents).map(([type, agent]) => ({
      type,
      ...agent.getCapabilities()
    }));
  }

  /**
   * Gets specific agent capabilities
   * @param {string} agentType 
   */
  getAgentCapabilities(agentType) {
    const agent = this.agents[agentType];
    return agent ? agent.getCapabilities() : null;
  }

  /**
   * Validates task requirements against agent capabilities
   * @param {string} task 
   * @param {string} agentType 
   */
  validateTaskAgentMatch(task, agentType) {
    const agent = this.agents[agentType];
    if (!agent) return false;

    const keywords = this.taskKeywords[agentType];
    const taskLower = task.toLowerCase();
    
    return keywords.some(keyword => taskLower.includes(keyword));
  }

  /**
   * Executes a collaborative task that requires multiple agents
   * @param {Array} tasks - Array of related tasks
   */
  executeCollaborativeTask(tasks) {
    const results = [];
    
    tasks.forEach(task => {
      const routing = this.routeTask(task.description, task.context);
      results.push({
        task: task.description,
        agent: routing.agent,
        result: routing.result
      });
    });

    return {
      collaborative: true,
      tasks: results,
      summary: this.generateCollaborativeSummary(results)
    };
  }

  /**
   * Generates summary for collaborative tasks
   * @param {Array} results 
   */
  generateCollaborativeSummary(results) {
    const agentUsage = {};
    results.forEach(result => {
      agentUsage[result.agent] = (agentUsage[result.agent] || 0) + 1;
    });

    return {
      totalTasks: results.length,
      agentsUsed: Object.keys(agentUsage),
      agentDistribution: agentUsage
    };
  }

  /**
   * Health check for all agents
   */
  healthCheck() {
    const health = {};
    
    Object.entries(this.agents).forEach(([type, agent]) => {
      try {
        const capabilities = agent.getCapabilities();
        health[type] = {
          status: 'healthy',
          capabilities: capabilities.supports.length,
          responsibilities: capabilities.responsibilities.length
        };
      } catch (error) {
        health[type] = {
          status: 'error',
          error: error.message
        };
      }
    });

    return health;
  }
}

module.exports = AgentManager;