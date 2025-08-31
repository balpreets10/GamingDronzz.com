# Query Optimization Guidelines

## When to Log Queries

### Token Threshold Rules
- **Mandatory Logging**: When conversation exceeds 2000 tokens
- **Optional Logging**: Complex queries regardless of token count
- **Proactive Logging**: Queries that could benefit from optimization

### Query Types to Track
1. **Complex Multi-Step Tasks**
   - Database operations with multiple tables
   - Authentication flow implementations
   - Component refactoring requests

2. **Repetitive Patterns**
   - Similar questions asked multiple times
   - Repeated troubleshooting scenarios
   - Common development workflows

3. **Resource-Intensive Operations**
   - Large file searches across codebase
   - Multiple file modifications
   - Complex debugging sessions

## Optimization Strategies

### Query Breakdown Techniques
1. **Atomic Queries**: Break complex requests into smaller, focused tasks
2. **Sequential Processing**: Handle dependencies in logical order
3. **Context Reduction**: Remove unnecessary background information

### Efficient Communication Patterns
1. **Specific Requests**: Use precise technical terminology
2. **Context Providing**: Include relevant file paths and code snippets
3. **Clear Objectives**: State desired outcomes explicitly

### Tool Usage Optimization
1. **Batch Operations**: Group related file reads/writes
2. **Targeted Searches**: Use specific search patterns
3. **Progressive Enhancement**: Start simple, add complexity as needed

## Common Inefficiencies

### Over-Context Issues
- Including entire file contents when only specific functions needed
- Providing excessive background information
- Repeating previously established context

### Under-Specification Problems
- Vague requests requiring multiple clarification rounds
- Missing technical requirements
- Unclear success criteria

### Tool Misuse Patterns
- Using Read when Grep would be more appropriate
- Multiple individual file operations instead of batch operations
- Searching entire codebase for targeted information

## Optimization Examples

### Before: Inefficient Query
```
"I need to understand how authentication works in this project. Can you explain everything about the auth system?"
```

### After: Optimized Query
```
"Show me the authentication flow in src/services/SupabaseService.ts, specifically the signInWithGoogle() and getCurrentUser() methods"
```

### Before: Broad Search
```
"Find all components that use authentication"
```

### After: Targeted Search
```
"Grep for 'useAuth' hook usage in src/components/ directory"
```

## Logging Format

### Entry Structure
```markdown
## [Date] - Query Optimization Entry

**Original Query**: [User's original request]
**Token Estimate**: [Estimated token count]
**Word Count**: [Total words in conversation]

**Optimization Suggestions**:
1. [Specific suggestion 1]
2. [Specific suggestion 2]
3. [Specific suggestion 3]

**Improved Query Example**:
[Optimized version of the query]

**Efficiency Gain**: [Estimated token reduction]
```

### Tracking Metrics
- **Token Reduction**: Percentage improvement in token usage
- **Response Quality**: Maintained or improved accuracy
- **Task Completion**: Successful outcome achievement
- **Time Efficiency**: Reduced back-and-forth communication

## Best Practices

### For Users
1. **Be Specific**: Include exact file paths and function names
2. **Provide Context**: Share relevant error messages or code snippets
3. **State Goals**: Clearly define what you want to achieve
4. **Use Examples**: Show expected input/output when applicable

### For Development
1. **Modular Requests**: Break large features into smaller components
2. **Incremental Changes**: Make and test small changes iteratively
3. **Documentation Updates**: Include documentation changes in requests
4. **Error Handling**: Specify error scenarios and handling requirements

## Review and Improvement

### Monthly Review Process
1. **Analyze Logged Queries**: Identify common patterns
2. **Measure Improvements**: Track token usage reductions
3. **Update Guidelines**: Refine optimization strategies
4. **Share Learnings**: Document successful optimization techniques

### Success Metrics
- **Average Token Usage**: Monitor conversation token consumption
- **Query Resolution Rate**: Percentage of queries resolved in first attempt
- **User Satisfaction**: Quality of responses maintained or improved
- **Development Velocity**: Faster task completion times