# Development Setup

## IDE Configuration

### Recommended: VS Code
```bash
# Install recommended extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
```

### TypeScript Configuration
- **Strict mode** enabled
- **Path mapping** configured for `@/` imports
- **ESLint integration** for code quality

## Development Workflow

### Code Quality Gates
```bash
# Required before every commit
npm run lint && npm run typecheck && npm test
```

### Development Commands
```bash
npm start                    # Start Expo development server
npm run quality-check        # Complete CI validation
npm test                     # Run all tests
npm run lint                 # ESLint checks
npm run typecheck            # TypeScript validation
```

### Git Workflow
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test: `npm run quality-check`
3. Commit changes: `git commit -m "feat: your feature"`
4. Push and create PR: `git push origin feature/your-feature`

## Project Structure

```
app/                    # Expo Router navigation
├── (tabs)/            # Tab-based UI screens
├── components/        # Reusable UI components
hooks/                 # Custom React hooks
lib/                   # Core game logic
├── puzzles/           # Puzzle generators
├── adaptiveEngine/    # AI learning system
constants/             # Configuration files
styles/                # Centralized styling
```

## Debugging

### React Native Debugger
- **Flipper** for iOS/Android debugging
- **Chrome DevTools** for web debugging
- **React DevTools** for component inspection

### Logging
- Use `console.log` sparingly in development
- Leverage Expo development tools
- Check Metro bundler output for errors

## Performance Monitoring

### Development Metrics
- **Bundle size**: Monitor with `npx expo export`
- **Render performance**: Use React DevTools Profiler
- **Memory usage**: Test on physical devices

### Testing Strategy
- **Unit tests**: Jest + React Testing Library
- **Integration tests**: Custom hooks and components
- **Persona testing**: Adaptive engine validation
- **E2E testing**: Critical user flows