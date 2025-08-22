# AI Agent Guidelines for Speech Paste

## 🚨 CRITICAL RULES

### NEVER Use `require()`
- **ALWAYS** use ES6 `import` statements
- **NEVER** use CommonJS `require()` syntax
- This project uses ES modules exclusively
- All imports should be at the top of the file

**❌ WRONG:**
```javascript
const { BrowserWindow } = require('electron');
```

**✅ CORRECT:**
```javascript
import { BrowserWindow } from 'electron';
```

### Import Guidelines
- Import all dependencies at the top of the file
- Use named imports when possible
- Use relative paths for local modules (e.g., `'../utils/logger.js'`)
- Use package names for external dependencies (e.g., `'electron'`)

### File Extensions
- Always include `.js` extension in import paths for local files
- Example: `import { log } from '../utils/logger.js';`

## 🔧 Development Standards

### Code Style
- Use ES6+ features (arrow functions, destructuring, etc.)
- Prefer `const` over `let` when possible
- Use template literals instead of string concatenation
- Use async/await instead of promises when possible

### Error Handling
- Always handle errors gracefully
- Use try/catch blocks for async operations
- Log errors with appropriate log levels
- Provide meaningful error messages to users

### Documentation
- Add JSDoc comments for functions and classes
- Include parameter types and return types
- Document complex logic with inline comments
- Keep comments up to date with code changes

## 🎯 Project-Specific Guidelines

### Electron Development
- Use IPC for communication between main and renderer processes
- Handle window lifecycle properly (create, show, hide, destroy)
- Use preload scripts for secure context isolation
- Follow Electron security best practices

### Audio Processing
- Handle audio formats supported by Gemini API
- Validate audio data before processing
- Provide fallbacks for unsupported formats
- Handle silent audio gracefully

### UI/UX
- Provide immediate visual feedback for user actions
- Use consistent positioning for windows
- Handle edge cases (no API key, network errors, etc.)
- Keep the interface simple and intuitive

## 🐛 Common Issues to Avoid

1. **Module Import Errors**: Always use ES6 imports, never `require()`
2. **Missing File Extensions**: Include `.js` in import paths
3. **Circular Dependencies**: Structure imports to avoid circular references
4. **Async/Await**: Use proper error handling with try/catch
5. **Window Management**: Always check if windows exist before using them

## 📝 Code Review Checklist

Before submitting code changes, ensure:
- [ ] No `require()` statements used
- [ ] All imports are ES6 syntax
- [ ] File extensions included in import paths
- [ ] Error handling implemented
- [ ] JSDoc comments added for new functions
- [ ] Code follows project style guidelines
- [ ] No console.log statements in production code (use logger instead)

## 🔍 Debugging Tips

- Check the main process console for import errors
- Verify all import paths are correct
- Ensure all dependencies are properly installed
- Use the logger utility for debugging instead of console.log
- Check Electron security policies for preload scripts
