# Implementation Plan

## Phase 1: Package Infrastructure

- [ ] 1. Set up package structure and build configuration
  - Move current application to demo/ folder
  - Restructure src/ for library exports (core/, components/, editors/, exports/)
  - Configure Vite for library mode with multiple entry points
  - Update package.json name to "nano-editor-ai" and configure exports field
  - Set up peer dependencies for React, Lexical, and BlockNote
  - Add .npmignore file
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Set up TypeScript configuration
  - Install TypeScript and @types packages
  - Create tsconfig.json for library build
  - Configure declaration generation (.d.ts files)
  - Convert existing .js files to .ts/.tsx (or use JSDoc for types)
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 3. Set up Storybook infrastructure
  - Install and configure Storybook 7+ for React
  - Configure Storybook with Vite builder
  - Set up story organization structure (hooks/, components/, editors/, integrations/)
  - Configure Storybook addons (controls, actions, docs, a11y)
  - Create story templates and documentation guidelines
  - _Requirements: 18.1, 18.2, 18.3_

## Phase 2: Core Abstractions

- [ ] 4. Refactor storage layer into adapter pattern
- [ ] 4.1 Create storage adapter interface
  - Extract storage interface from existing db.js
  - Define TypeScript interfaces for StorageAdapter, Document, PostEntry schemas
  - Document adapter contract and method signatures
  - _Requirements: 7.1, 7.5, 12.4_

- [ ] 4.2 Refactor existing Dexie implementation as default adapter
  - Wrap existing db.js functions in adapter interface
  - Replace idb with existing Dexie implementation (already installed)
  - Ensure backward compatibility with existing data
  - Add error handling for storage operations
  - _Requirements: 7.3, 7.6_

- [ ]* 4.3 Write property test for storage adapter interface
  - **Property 5: Storage Adapter Interface Consistency**
  - **Validates: Requirements 7.2, 7.5**

- [ ]* 4.4 Write property test for error propagation
  - **Property 6: Error Propagation**
  - **Validates: Requirements 7.4, 20.3**

- [ ] 5. Implement AI adapter interface and built-in adapters
- [ ] 5.1 Create AI adapter interface
  - Define TypeScript interface for AIAdapter
  - Define GenerateTextOptions and RewriteTextOptions interfaces
  - Document adapter contract and method signatures
  - _Requirements: 8.2.1, 8.2.2, 8.2.3_

- [ ] 5.2 Refactor existing Chrome AI hooks into adapter
  - Wrap existing useWriter and useRewriter hooks into createChromeAIAdapter
  - Implement isAvailable check using existing AI availability logic
  - Implement generateText using existing Writer API integration
  - Implement rewriteText using existing Rewriter API integration
  - Preserve streaming support
  - _Requirements: 8.1.1, 8.1.4_

- [ ] 5.3 Implement Gemini AI adapter
  - Create createGeminiAdapter function
  - Add API key configuration
  - Implement generateText using Gemini API
  - Implement rewriteText using Gemini API
  - Add streaming support
  - Map tone/length parameters to Gemini equivalents
  - _Requirements: 8.1.2, 8.1.5_

- [ ] 5.4 Implement OpenAI adapter
  - Create createOpenAIAdapter function
  - Add API key configuration
  - Implement generateText using OpenAI API
  - Implement rewriteText using OpenAI API
  - Add streaming support
  - Map tone/length parameters to OpenAI equivalents
  - _Requirements: 8.1.3, 8.1.5_

- [ ] 5.5 Implement Mock AI adapter for testing
  - Create createMockAdapter function
  - Add configurable responses
  - Add simulated streaming with delays
  - Add error simulation capabilities
  - _Requirements: Testing Strategy_

- [ ]* 5.6 Write property test for AI adapter interface consistency
  - **Property 11: AI Adapter Interface Consistency**
  - **Validates: Requirements 8.3, 8.4**

## Phase 3: Hooks and Components (Storybook-First)

- [ ] 6. Refactor and enhance useAI hook (Storybook-first)
- [ ] 6.1 Create useAI Storybook stories
  - Write story showing Chrome AI adapter
  - Write story showing Gemini adapter with API key input
  - Write story showing OpenAI adapter with API key input
  - Write story showing adapter switching
  - Show available/unavailable states
  - _Requirements: 18.4_

- [ ] 6.2 Refactor existing useAI hook to support adapters
  - Refactor existing useAI.js to accept aiAdapter option
  - Default to Chrome AI adapter if none provided
  - Implement adapter availability checking
  - Provide generateText and rewriteText methods via adapter
  - Support adapter switching at runtime
  - Persist adapter choice to localStorage
  - _Requirements: 2.4, 8.1, 8.2, 8.3_

- [ ]* 6.3 Write property test for adapter swapping
  - **Property 12: AI Adapter Swapping Preservation**
  - **Validates: Requirements 8.1**

- [ ]* 6.4 Write property test for settings persistence
  - **Property 7: Settings Persistence Round-Trip**
  - **Validates: Requirements 8.5, 10.3**

- [ ] 7. Refactor usePostCreator hook (Storybook-first)
- [ ] 7.1 Create usePostCreator Storybook stories
  - Write story showing hook interface with vanilla HTML
  - Write story with Chrome AI adapter
  - Write story with Gemini adapter
  - Write story with OpenAI adapter
  - Add controls for all hook options and adapter selection
  - Show different states (idle, generating, error)
  - Demonstrate with mock AI responses
  - _Requirements: 18.4_

- [ ] 7.2 Refactor existing usePostCreator hook to support adapters
  - Update existing usePostCreator.js to accept aiAdapter option
  - Integrate with refactored useAI hook for AI operations
  - Accept storageAdapter option (use default Dexie adapter if not provided)
  - Ensure existing state management and history tracking work with adapters
  - Preserve existing clipboard operations and localStorage persistence
  - Complete the generateSuggestions function implementation
  - _Requirements: 2.1, 2.5, 9.2, 9.3, 9.4, 9.5_

- [ ]* 7.3 Write property test for configuration application
  - **Property 8: Configuration Application**
  - **Validates: Requirements 10.1**

- [ ] 8. Refactor component factory pattern (Storybook-first)
- [ ] 8.1 Create createPostCreator stories for multiple UI libraries
  - Write story for vanilla HTML (no UI library)
  - Write story for Tailwind components
  - Write story for Mantine components (already installed)
  - Write story for Material-UI components
  - Add stories showing different AI adapters (Chrome, Gemini, OpenAI)
  - Add controls for dark mode, configuration, and AI adapter selection
  - _Requirements: 18.2, 18.3_

- [ ] 8.2 Refactor existing createPostCreator factory function
  - Existing implementation already has component detection and prop normalization
  - Update to accept aiAdapter and storageAdapter props
  - Pass adapters to usePostCreator hook
  - Ensure compatibility with existing UI library switcher
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ]* 8.3 Write property test for component factory
  - **Property 3: Component Factory Returns Valid Component**
  - **Validates: Requirements 3.1**

- [ ]* 8.4 Write property test for prop normalization
  - **Property 4: Prop Normalization Consistency**
  - **Validates: Requirements 3.2, 3.4**

- [ ] 8.5 Update default PostCreator component export
  - Existing PostCreator.jsx already uses createPostCreator
  - Existing PostCreator.css already has base styles and dark mode
  - Add AI adapter selector UI to settings
  - _Requirements: 9.1, 10.2_

- [ ]* 8.6 Write property test for style merging
  - **Property 9: Style Merging Preservation**
  - **Validates: Requirements 10.4**

## Phase 4: Editor Integrations

- [ ] 9. Implement basic markdown editor (Storybook-first)
- [ ] 9.1 Create BasicEditor Storybook stories
  - Write story showing textarea with markdown preview
  - Add AI toolbar integration story
  - Show loading and error states
  - Demonstrate with different UI libraries and AI adapters
  - _Requirements: 18.2_

- [ ] 9.2 Implement BasicEditor component
  - Create textarea-based editor
  - Add markdown preview with react-markdown (already installed)
  - Integrate AI assistance (rewrite, continue) via useAI
  - Add keyboard shortcuts (Cmd+K)
  - Accept aiAdapter prop
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 9.3 Create useBasicEditor hook
  - Extract editor logic into headless hook
  - Manage editor state and AI integration
  - Accept aiAdapter option
  - _Requirements: 4.5_

- [ ] 10. Implement context menu integration (Storybook-first)
- [ ] 10.1 Create useContextMenu Storybook story
  - Write story showing context menu on text selection
  - Demonstrate with textarea and contenteditable
  - Show different AI actions (improve, shorten, etc.)
  - Show with different AI adapters
  - _Requirements: 18.4_

- [ ] 10.2 Implement useContextMenu hook
  - Add text selection detection
  - Implement context menu positioning
  - Integrate AI actions via useAI
  - Accept aiAdapter option
  - _Requirements: 16.1, 16.2, 16.3, 16.5_

- [ ] 10.3 Create ContextMenu component
  - Implement menu UI with action list
  - Add loading states during AI processing
  - _Requirements: 16.2, 16.3_

- [ ] 11. Implement inline assistant widget (Storybook-first)
- [ ] 11.1 Create InlineAssistant Storybook story
  - Write story showing floating button and expanded panel
  - Demonstrate draggable positioning
  - Show integration with text selection
  - Add controls for position, styling, and AI adapter
  - _Requirements: 18.3_

- [ ] 11.2 Implement InlineAssistant component
  - Create draggable floating button
  - Implement expandable panel with post creator
  - Add text selection auto-population
  - Add insert/replace functionality
  - Accept aiAdapter prop
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [ ] 11.3 Create useInlineAssistant hook
  - Extract widget logic into headless hook
  - Manage widget state and positioning
  - Accept aiAdapter option
  - _Requirements: 17.5_

- [ ] 12. Implement Lexical editor integration (Storybook-first)
- [ ] 12.1 Create LexicalEditor Storybook stories
  - Write story showing Lexical with rich text formatting
  - Demonstrate AI integration with Lexical nodes
  - Show different formatting options and AI adapters
  - _Requirements: 18.2_

- [ ] 12.2 Implement LexicalEditor component
  - Install Lexical and @lexical/react packages
  - Set up Lexical editor with React bindings
  - Add rich text formatting toolbar
  - Implement markdown import/export
  - Accept aiAdapter prop
  - _Requirements: 5.1, 5.4_

- [ ] 12.3 Create useLexicalAI hook
  - Integrate AI with Lexical node system via useAI
  - Add AI rewrite for selected nodes
  - Add AI continue writing at cursor
  - Accept aiAdapter option
  - _Requirements: 5.3_

- [ ] 13. Refactor BlockNote editor integration (Storybook-first)
- [ ] 13.1 Create BlockNoteEditor Storybook stories
  - Write story showing BlockNote with all features
  - Demonstrate AI integration with blocks
  - Show PDF export functionality
  - Show with different AI adapters
  - _Requirements: 18.2_

- [ ] 12.2 Implement BlockNoteEditor component
  - Set up BlockNote editor with React bindings
  - Add Mantine theme integration
  - Implement markdown import/export
  - Accept aiAdapter prop
  - _Requirements: 6.1, 6.4_

- [ ] 12.3 Create useBlockNoteAI hook
  - Integrate AI with BlockNote block system via useAI
  - Add AI rewrite per block
  - Add AI continue writing
  - Accept aiAdapter option
  - _Requirements: 6.3_

- [ ] 12.4 Implement PDF export functionality
  - Add PDF export using @blocknote/xl-pdf-exporter
  - _Requirements: 11.2_

- [ ] 13. Set up subpath exports and tree-shaking
- [ ] 13.1 Create export entry points
  - Create src/exports/post-creator.js
  - Create src/exports/hooks.js
  - Create src/exports/editors.js
  - Create src/ai/chrome.js, gemini.js, openai.js, mock.js exports
  - Create src/index.js (main entry)
  - _Requirements: 1.1.3_

- [ ] 13.2 Configure package.json exports field
  - Add subpath exports for all entry points including AI adapters
  - Configure conditional exports for ESM/CJS
  - _Requirements: 1.1.3_

- [ ]* 13.3 Write property test for tree-shaking
  - **Property 2: Tree-Shaking Effectiveness**
  - **Validates: Requirements 1.1.4**

- [ ]* 13.4 Write property test for export completeness
  - **Property 1: Export Completeness**
  - **Validates: Requirements 1.2**

- [ ] 14. Implement error handling and validation
- [ ] 14.1 Add configuration validation
  - Create validation functions for all config options
  - Add helpful error messages
  - Validate AI adapter interface compliance
  - _Requirements: 20.2, 8.2.2_

- [ ]* 14.2 Write property test for validation errors
  - **Property 10: Validation Error Clarity**
  - **Validates: Requirements 20.2**

- [ ] 14.3 Add error boundaries and fallbacks
  - Implement error boundaries for components
  - Add fallback UI for errors
  - Add console warnings in development mode
  - Handle AI adapter errors gracefully
  - _Requirements: 20.3, 20.4, 20.5, 8.1.4_

- [ ] 14.4 Create error state stories
  - Add Storybook stories showing all error states
  - Demonstrate error recovery flows
  - Show AI adapter unavailable states
  - _Requirements: 18.3_

- [ ] 15. Create demo application
- [ ] 15.1 Set up demo project structure
  - Create demo/ folder with separate package.json
  - Install package as dependency (link during development)
  - Set up Vite for demo app
  - _Requirements: 19.1, 19.2_

- [ ] 15.2 Create integration examples
  - Create TailwindExample.jsx showing PostCreator with Tailwind
  - Create MantineExample.jsx showing PostCreator with Mantine
  - Create MaterialUIExample.jsx showing PostCreator with Material-UI
  - Create CustomStorageExample.jsx showing custom storage adapter
  - Create AIAdapterExample.jsx showing Gemini and OpenAI adapters
  - _Requirements: 19.3, 19.5_

- [ ] 15.3 Create demo app router and navigation
  - Create simple router between examples
  - Add navigation menu
  - Add README with integration instructions
  - Include AI adapter setup instructions
  - _Requirements: 19.3, 19.5_

- [ ] 16. Documentation and TypeScript definitions
- [ ] 16.1 Generate TypeScript definitions
  - Configure TypeScript to generate .d.ts files
  - Verify all exports have type definitions including AI adapters
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 16.2 Write package README
  - Add installation instructions
  - Add quick start guide
  - Add AI adapter configuration guide
  - Add links to Storybook and demo
  - Add API reference overview
  - _Requirements: 13.1, 13.2_

- [ ] 16.3 Create migration guides
  - Write guide for custom storage adapters
  - Write guide for custom AI adapters
  - Write guide for different UI libraries
  - Write guide for editor selection
  - _Requirements: 13.4, 8.2.1_

- [ ] 16.4 Add JSDoc comments
  - Add JSDoc to all public APIs
  - Include examples in JSDoc for AI adapter usage
  - _Requirements: 13.3_

- [ ] 17. Bundle size optimization and analysis
- [ ] 17.1 Configure bundle analysis
  - Add rollup-plugin-visualizer
  - Create bundle size report script
  - _Requirements: 14.1, 14.3_

- [ ] 17.2 Verify bundle size targets
  - Test core bundle < 50KB gzipped
  - Test post-creator only < 20KB gzipped
  - Test idb overhead < 2KB gzipped
  - Verify AI adapters are tree-shakeable
  - _Requirements: 1.1.5, 7.6, 14.5, 14.6_

- [ ] 17.3 Optimize bundle splitting
  - Configure code splitting for editors
  - Configure code splitting for AI adapters
  - Add lazy loading for heavy components
  - _Requirements: 14.4_

- [ ] 18. Testing infrastructure
- [ ] 18.1 Set up Vitest
  - Install and configure Vitest
  - Set up React Testing Library
  - Configure test coverage reporting
  - _Requirements: Testing Strategy_

- [ ] 18.2 Set up fast-check for property-based testing
  - Install fast-check library
  - Create property test utilities
  - Configure to run 100+ iterations per property
  - _Requirements: Testing Strategy_

- [ ]* 18.3 Write unit tests for hooks and adapters
  - Test usePostCreator state management
  - Test useAI adapter integration
  - Test AI adapter interface compliance
  - Test Chrome, Gemini, OpenAI adapters
  - _Requirements: Testing Strategy_

- [ ]* 18.4 Write integration tests
  - Test component factory with real UI libraries
  - Test full post creation flow with different AI adapters
  - Test storage adapter integration
  - Test AI adapter switching
  - Test error recovery flows
  - _Requirements: Testing Strategy_

- [ ] 18.5 Set up Playwright for E2E testing
  - Install and configure Playwright
  - Set up test organization structure (e2e/ folder)
  - Configure browsers (Chrome, Firefox, Safari)
  - Add test scripts to package.json
  - _Requirements: Testing Strategy_

- [ ]* 18.6 Write E2E tests with Playwright
  - Write PostCreator workflow tests
  - Write Basic editor tests with AI integration
  - Write Lexical editor integration tests
  - Write BlockNote editor integration tests
  - Write context menu interaction tests
  - Write inline assistant widget tests
  - Write AI and storage adapter tests
  - Test cross-browser compatibility
  - _Requirements: Testing Strategy_

- [ ] 19. Storybook deployment setup
- [ ] 19.1 Configure Storybook build
  - Add build-storybook script
  - Configure static file handling
  - _Requirements: 18.6_

- [ ] 19.2 Set up Chromatic or Vercel deployment
  - Configure CI/CD for Storybook deployment
  - Set up automatic deploys on main branch
  - _Requirements: 18.6_

- [ ] 20. Package publishing preparation
- [ ] 20.1 Configure npm publishing
  - Set up .npmignore
  - Configure package.json files field
  - Add prepublishOnly script
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 20.2 Create GitHub Actions workflow
  - Add CI workflow for tests
  - Add CD workflow for npm publishing
  - Add workflow for Storybook deployment
  - _Requirements: Deployment_

- [ ] 20.3 Deploy demo application
  - Configure Vercel deployment for demo
  - Set up automatic deploys
  - Add environment variable setup for API keys
  - _Requirements: 19.4_

- [ ] 21. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
