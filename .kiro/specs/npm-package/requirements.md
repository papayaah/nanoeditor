# Requirements Document

## Introduction

This specification defines the creation of a reusable npm package extracted from the Nano Editor codebase. The package will provide AI-assisted writing capabilities that developers can integrate into their existing applications. The current Nano Editor application will be moved to a `demo/` folder to serve as an integration example, while the core package functionality will be developed in `src/` using a Storybook-first approach.

The package follows a **headless UI architecture**, providing business logic through React hooks while allowing developers to bring their own UI components. This enables integration with any UI library (Tailwind, Mantine, Material-UI, Shadcn, etc.) without style conflicts or framework lock-in.

**Technology Requirements:**
- React 19.x (peer dependency)
- Storybook 10.x for component documentation
- TypeScript with full type definitions
- Vite 7.x for build tooling

## Glossary

- **Package**: The npm package containing all exportable components, hooks, and utilities
- **Headless UI**: UI-agnostic components that provide logic and state management without prescribing visual presentation
- **Chrome AI APIs**: Browser-native AI capabilities including Writer and Rewriter APIs
- **AI Adapter**: Interface that abstracts AI provider implementation, allowing swapping between Chrome AI, Gemini, OpenAI, or custom providers
- **PostCreator**: The social media post generation component with AI assistance
- **DocumentEditor**: The rich text document editing component with AI writing assistance
- **Consumer Application**: The developer's application that integrates the Package
- **UI Library**: Third-party component libraries like Tailwind, Mantine, Material-UI, Shadcn, etc.
- **Lightweight Mode**: Minimal dependencies version using basic markdown editing
- **Full-Featured Mode**: Complete version including BlockNote rich text editor
- **Component Adapter**: Function that maps UI Library components to Package requirements
- **idb**: Lightweight IndexedDB wrapper library (~1.5KB) for browser storage

## Requirements

### Requirement 1: Package Structure and Distribution

**User Story:** As a developer, I want to install and import the package easily, so that I can quickly integrate AI writing features into my application.

#### Acceptance Criteria

1. WHEN a developer runs `npm install nano-editor-ai` THEN the Package SHALL install all required dependencies
2. WHEN a developer imports from the Package THEN the Package SHALL provide named exports for all public APIs
3. WHEN the Package is built THEN the Package SHALL generate both ESM and CommonJS bundles
4. WHEN the Package is published THEN the Package SHALL include TypeScript type definitions
5. WHEN a developer views the package.json THEN the Package SHALL declare peer dependencies for optional features like BlockNote

### Requirement 1.1: Modular Installation and Tree-Shaking

**User Story:** As a developer, I want to install only the features I need, so that I minimize bundle size and dependencies.

#### Acceptance Criteria

1. WHEN a developer imports only `usePostCreator` THEN the Package SHALL exclude document editor code from the bundle
2. WHEN a developer imports only document features THEN the Package SHALL exclude post creator code from the bundle
3. WHEN a developer uses subpath imports (e.g., `nano-editor-ai/post-creator`) THEN the Package SHALL provide isolated entry points
4. WHEN the Package is bundled THEN the Package SHALL support tree-shaking to eliminate unused code
5. WHEN a developer analyzes bundle size THEN importing only post creator SHALL be under 20KB gzipped (excluding UI library)

### Requirement 2: Headless Core Hooks

**User Story:** As a developer, I want access to headless hooks for AI functionality, so that I can build custom UIs with any framework.

#### Acceptance Criteria

1. WHEN a developer imports `usePostCreator` THEN the Package SHALL provide all state and logic for post generation without UI
2. WHEN a developer imports `useWriter` THEN the Package SHALL provide Chrome Writer API integration with configuration options
3. WHEN a developer imports `useRewriter` THEN the Package SHALL provide Chrome Rewriter API integration with configuration options
4. WHEN a developer imports `useAI` THEN the Package SHALL provide AI availability detection for both Writer and Rewriter
5. WHEN a developer calls hook functions THEN the Package SHALL manage all state updates and side effects internally

### Requirement 3: UI-Agnostic Component Factory

**User Story:** As a developer, I want to provide my own UI components, so that the package matches my application's design system.

#### Acceptance Criteria

1. WHEN a developer calls `createPostCreator` with UI components THEN the Package SHALL return a functional PostCreator component
2. WHEN a developer provides components with standard props THEN the Package SHALL normalize props across different UI libraries
3. WHEN a developer omits UI components THEN the Package SHALL use default vanilla HTML elements
4. WHEN a developer provides components THEN the Package SHALL auto-detect component types by name or accept explicit mappings
5. WHERE a developer uses any UI Library THEN the Package SHALL adapt component interfaces automatically

### Requirement 4: Basic Markdown Editor

**User Story:** As a developer, I want a minimal markdown editor option, so that I can provide AI-assisted writing with the smallest possible bundle size.

#### Acceptance Criteria

1. WHEN a developer imports `nano-editor-ai/editors/basic` THEN the Package SHALL provide a textarea-based markdown editor with edit/preview toggle
2. WHEN a user edits content in basic mode THEN the System SHALL store content as plain markdown text
3. WHEN a user toggles to preview mode THEN the System SHALL render the markdown using react-markdown
4. WHEN a user requests AI assistance in edit mode THEN the System SHALL integrate Writer and Rewriter APIs with the textarea
5. WHEN a developer builds with basic mode THEN the Package SHALL have zero rich text editor dependencies

### Requirement 5: Lexical Editor Integration

**User Story:** As a developer, I want a modern lightweight editor, so that I can provide rich text editing without the overhead of BlockNote.

#### Acceptance Criteria

1. WHEN a developer imports `nano-editor-ai/editors/lexical` THEN the Package SHALL provide Lexical editor integration
2. WHEN a user edits content in Lexical mode THEN the System SHALL store content in Lexical's JSON format
3. WHEN a user requests AI assistance in Lexical mode THEN the System SHALL integrate Writer and Rewriter APIs with Lexical nodes
4. WHEN the Lexical editor renders THEN the Package SHALL support rich text formatting (bold, italic, lists, links, headings)
5. WHERE a developer chooses Lexical mode THEN the Package SHALL declare Lexical as a peer dependency

### Requirement 6: BlockNote Editor Integration

**User Story:** As a developer, I want a full Notion-like editing experience, so that I can provide premium document editing features to my users.

#### Acceptance Criteria

1. WHEN a developer imports `nano-editor-ai/editors/blocknote` THEN the Package SHALL provide all BlockNote rich text editing capabilities
2. WHEN a user edits content in BlockNote mode THEN the System SHALL store content in BlockNote's JSON format
3. WHEN a user requests AI assistance in BlockNote mode THEN the System SHALL integrate Writer and Rewriter APIs with BlockNote blocks
4. WHEN the BlockNote editor renders THEN the Package SHALL support all BlockNote formatting options (headings, lists, tables, images, code blocks, etc.)
5. WHERE a developer chooses BlockNote mode THEN the Package SHALL declare BlockNote as a peer dependency

### Requirement 7: Storage Abstraction

**User Story:** As a developer, I want to provide my own storage solution, so that the package works with my existing database or backend.

#### Acceptance Criteria

1. WHEN a developer initializes the Package THEN the Package SHALL accept custom storage adapter functions
2. WHEN the Package needs to persist data THEN the Package SHALL call the provided storage adapter with standardized data structures
3. WHEN a developer omits storage adapters THEN the Package SHALL use IndexedDB with idb library as the default
4. WHEN storage operations fail THEN the Package SHALL propagate errors to the Consumer Application
5. WHEN the Package stores documents THEN the Package SHALL use a consistent schema regardless of storage backend
6. WHEN the default storage is used THEN the Package SHALL add minimal bundle overhead (under 2KB for idb)

### Requirement 8: AI Provider Abstraction

**User Story:** As a developer, I want to choose my AI provider, so that I can use Chrome AI, Gemini, OpenAI, or any custom AI service.

#### Acceptance Criteria

1. WHEN a developer initializes the Package THEN the Package SHALL accept an AI adapter configuration
2. WHEN a developer omits AI adapter configuration THEN the Package SHALL default to Chrome AI APIs
3. WHEN the Package needs AI generation THEN the Package SHALL call the configured AI adapter with standardized parameters
4. WHEN an AI adapter is provided THEN the Package SHALL use a consistent interface for text generation and rewriting
5. WHEN a user generates text THEN the Package SHALL stream AI responses in real-time regardless of provider
6. WHEN a user configures AI settings THEN the Package SHALL persist settings to localStorage

### Requirement 8.1: Built-in AI Adapters

**User Story:** As a developer, I want ready-to-use AI adapters, so that I can quickly integrate popular AI providers without writing custom code.

#### Acceptance Criteria

1. WHEN a developer imports the Chrome AI adapter THEN the Package SHALL provide Chrome Writer and Rewriter API integration
2. WHEN a developer imports the Gemini adapter THEN the Package SHALL provide Google Gemini API integration with API key configuration
3. WHEN a developer imports the OpenAI adapter THEN the Package SHALL provide OpenAI API integration with API key configuration
4. WHEN an AI adapter detects unavailability THEN the Package SHALL provide clear error states and setup instructions
5. WHEN a developer provides an API key THEN the Package SHALL securely store it in localStorage or accept it as a prop

### Requirement 8.2: Custom AI Adapter Interface

**User Story:** As a developer, I want to create custom AI adapters, so that I can integrate proprietary or specialized AI services.

#### Acceptance Criteria

1. WHEN a developer creates a custom AI adapter THEN the Package SHALL provide a TypeScript interface defining required methods
2. WHEN a custom adapter implements the interface THEN the Package SHALL accept it without modification
3. WHEN the Package calls adapter methods THEN the Package SHALL pass standardized parameters (prompt, context, settings)
4. WHEN an adapter returns responses THEN the Package SHALL support both streaming and non-streaming responses
5. WHEN an adapter encounters errors THEN the Package SHALL handle errors consistently across all adapter types

### Requirement 9: Post Creator Component

**User Story:** As a developer, I want a ready-to-use post creator component, so that I can quickly add social media post generation to my app.

#### Acceptance Criteria

1. WHEN a developer renders PostCreator THEN the Component SHALL display an input area for user prompts
2. WHEN a user submits a prompt THEN the Component SHALL generate three AI-powered post variations
3. WHEN AI generates posts THEN the Component SHALL display streaming updates in real-time
4. WHEN a user clicks regenerate THEN the Component SHALL create new variations with the same settings
5. WHEN a user copies a post THEN the Component SHALL copy the text to clipboard and show confirmation

### Requirement 10: Configuration and Customization

**User Story:** As a developer, I want to configure AI behavior and UI appearance, so that the package fits my application's requirements.

#### Acceptance Criteria

1. WHEN a developer provides configuration options THEN the Package SHALL apply tone, format, and length settings to AI generation
2. WHEN a developer enables dark mode THEN the Package SHALL apply dark theme styles to all components
3. WHEN a user changes AI settings THEN the Package SHALL persist settings across sessions
4. WHEN a developer provides custom styles THEN the Package SHALL merge custom styles with default styles
5. WHERE a developer specifies temperature and topP THEN the Package SHALL pass these parameters to AI APIs

### Requirement 11: Export and Import Functionality

**User Story:** As a developer, I want export and import capabilities, so that users can share and backup their content.

#### Acceptance Criteria

1. WHEN a user exports a document THEN the Package SHALL generate markdown format output
2. WHEN a user exports a document in BlockNote mode THEN the Package SHALL optionally generate PDF output
3. WHEN a user imports markdown THEN the Package SHALL parse and convert it to the editor's format
4. WHEN a user pastes markdown in BlockNote mode THEN the Package SHALL convert markdown to BlockNote blocks
5. WHEN export operations complete THEN the Package SHALL provide the exported content to the Consumer Application

### Requirement 12: TypeScript Support

**User Story:** As a developer, I want full TypeScript support, so that I get type safety and autocomplete in my IDE.

#### Acceptance Criteria

1. WHEN a developer imports Package types THEN the Package SHALL provide TypeScript definitions for all exports
2. WHEN a developer uses hooks THEN the Package SHALL provide typed return values and parameters
3. WHEN a developer creates components THEN the Package SHALL provide typed props interfaces
4. WHEN a developer configures storage adapters THEN the Package SHALL provide typed adapter interfaces
5. WHEN TypeScript compilation occurs THEN the Package SHALL include no type errors

### Requirement 13: Documentation and Examples

**User Story:** As a developer, I want comprehensive documentation and examples, so that I can integrate the package quickly and correctly.

#### Acceptance Criteria

1. WHEN a developer views the README THEN the Package SHALL provide installation instructions and quick start guide
2. WHEN a developer needs examples THEN the Package SHALL include code samples for common UI libraries
3. WHEN a developer needs API reference THEN the Package SHALL document all exported functions, hooks, and components
4. WHEN a developer needs migration help THEN the Package SHALL provide guides for different storage backends
5. WHEN a developer views examples THEN the Package SHALL include working demos for Tailwind, Mantine, and Material-UI

### Requirement 14: Bundle Size Optimization

**User Story:** As a developer, I want minimal bundle impact, so that my application loads quickly.

#### Acceptance Criteria

1. WHEN a developer imports only hooks THEN the Package SHALL tree-shake unused components
2. WHEN a developer uses lightweight mode THEN the Package SHALL exclude BlockNote and Lexical dependencies from the bundle
3. WHEN the Package builds THEN the Package SHALL minify and optimize all code
4. WHEN a developer imports specific features THEN the Package SHALL support code splitting for lazy loading
5. WHEN the Package is analyzed THEN the core bundle SHALL be under 50KB gzipped (excluding rich text editors)
6. WHEN the Package uses storage THEN the default idb library SHALL add less than 2KB gzipped to the bundle

### Requirement 15: Mountable Post Assistant

**User Story:** As a developer, I want to mount the post assistant anywhere in my UI, so that users can access AI writing help contextually (sidebar, modal, popover, etc.).

#### Acceptance Criteria

1. WHEN a developer renders the post assistant THEN the Package SHALL provide a compact, self-contained component that fits any layout
2. WHEN a developer mounts the assistant in a sidebar THEN the Component SHALL adapt its layout to narrow widths
3. WHEN a developer mounts the assistant in a modal THEN the Component SHALL function independently without requiring full-page context
4. WHEN a developer provides initial text THEN the Component SHALL pre-populate the input with that text
5. WHEN a user generates content THEN the Component SHALL emit events with generated text for the Consumer Application to handle

### Requirement 16: Context Menu Integration

**User Story:** As a developer, I want to add AI assistance to existing text inputs and editors, so that users can enhance text anywhere in my application.

#### Acceptance Criteria

1. WHEN a developer attaches the Package to a textarea THEN the Package SHALL provide a context menu trigger on text selection
2. WHEN a user right-clicks selected text THEN the System SHALL display AI enhancement options (rewrite, improve, shorten, etc.)
3. WHEN a user selects an AI action from context menu THEN the System SHALL process the selected text and replace it with AI output
4. WHEN a developer integrates with third-party WYSIWYG editors THEN the Package SHALL provide adapter functions for common editors (TinyMCE, Quill, ProseMirror, etc.)
5. WHEN the context menu appears THEN the Package SHALL position it near the text selection without obscuring content

### Requirement 17: Inline AI Assistant Widget

**User Story:** As a developer, I want a floating AI assistant widget, so that users can access AI help without leaving their current context.

#### Acceptance Criteria

1. WHEN a developer enables the inline widget THEN the Package SHALL render a draggable floating button
2. WHEN a user clicks the floating button THEN the System SHALL expand an inline assistant panel
3. WHEN a user has text selected in any input THEN the inline assistant SHALL automatically populate with that text
4. WHEN a user generates content in the inline assistant THEN the System SHALL provide options to insert at cursor or replace selection
5. WHEN a developer configures the widget THEN the Package SHALL accept positioning, styling, and behavior options

### Requirement 18: Storybook-First Development Approach

**User Story:** As a package developer, I want to develop all components in Storybook first, so that I can build, test, and document components in isolation before integration.

#### Acceptance Criteria

1. WHEN developing new components THEN the System SHALL use Storybook 10.x with React 19 support for component development
2. WHEN a developer runs Storybook THEN the Package SHALL display stories for all public components and headless hooks
3. WHEN a developer views a component story THEN Storybook SHALL show examples with different UI libraries (Tailwind, Mantine, Material-UI, Shadcn)
4. WHEN a developer views hook stories THEN Storybook SHALL demonstrate headless hook usage patterns with live examples showing UI-agnostic business logic
5. WHEN a developer interacts with Storybook controls THEN the System SHALL allow real-time configuration of component props and hook parameters
6. WHEN the Package is published THEN the Package SHALL include a deployed Storybook site as the primary documentation

### Requirement 19: Demo Application Structure

**User Story:** As a developer, I want to see a focused working demo, so that I understand how to integrate the package into a real application.

#### Acceptance Criteria

1. WHEN the repository is organized THEN the System SHALL separate package source code from demo application code in a dedicated demo/ folder
2. WHEN a developer views the demo folder THEN the System SHALL provide a minimal showcase application demonstrating Package integration patterns
3. WHEN a developer runs the demo THEN the Application SHALL demonstrate key features (post creation with different UI libraries, basic editor integration, and storage adapters)
4. WHEN the demo is deployed THEN the System SHALL host it as a live integration example site
5. WHEN a developer examines demo code THEN the System SHALL provide clear, minimal examples showing how to import and configure Package components
6. WHEN comparing demo to Storybook THEN the demo SHALL focus on integration patterns while Storybook SHALL remain the primary component documentation

### Requirement 20: Error Handling and Validation

**User Story:** As a developer, I want clear error messages and validation, so that I can debug integration issues quickly.

#### Acceptance Criteria

1. WHEN AI APIs are unavailable THEN the Package SHALL provide descriptive error messages with setup instructions
2. WHEN invalid configuration is provided THEN the Package SHALL throw validation errors with helpful messages
3. WHEN storage operations fail THEN the Package SHALL catch errors and provide fallback behavior
4. WHEN network errors occur during AI generation THEN the Package SHALL handle errors gracefully and notify the user
5. WHEN the Package encounters unexpected states THEN the Package SHALL log warnings to the console in development mode
