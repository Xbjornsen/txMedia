# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` or `yarn dev` - Start development server with Turbopack (Next.js 15)
- `npm run build` or `yarn build` - Build for production
- `npm start` or `yarn start` - Start production server
- `npm run lint` or `yarn lint` - Run ESLint

## Architecture Overview

This is a Next.js 15 photography portfolio website for Tx Media using the Pages Router architecture. Key architectural patterns:

### Page Structure
- **Pages Router**: Uses `src/pages/` directory structure with individual page components
- **Single Page Layout**: The main homepage (`index.tsx`) conditionally renders all sections (portfolio, packages, about, contact) on mobile devices only using `md:hidden` classes
- **Separate Routes**: Desktop navigation likely uses individual routes (`/portfolio`, `/about`, `/contact`, `/packages`)

### Component Organization
- Page components are co-located in `src/pages/` (portfolio.tsx, about.tsx, contact.tsx, packages.tsx)
- Shared layout components: `header.tsx`, `footer.tsx` in pages directory
- Global app wrapper in `_app.tsx` provides consistent header/footer layout

### Styling
- **Tailwind CSS 4**: Uses utility-first CSS with custom CSS variables
- **CSS Variables**: Uses custom properties like `var(--background)`, `var(--accent)` for theming
- **Responsive Design**: Mobile-first approach with conditional rendering for different screen sizes

### Media Integration
- **Video Background**: Hero section uses auto-playing background video with fallback image
- **Photography Assets**: Extensive image collection in `/public` for portfolio display
- **EmailJS Integration**: Contact functionality via emailjs-com package

### Technology Stack
- Next.js 15 with React 19
- TypeScript for type safety
- Tailwind CSS 4 for styling
- EmailJS for contact form handling

## Agent Usage - MANDATORY

**ALWAYS USE PROJECT AGENTS FIRST**

Before any task, you must use the appropriate custom agents built for this project:

### 🗄️ Database Tasks
- `npm run db:analyze` - Analyze database relationships and schema
- `npm run db:health` - Check database health and performance  
- `npm run db:validate` - Validate data integrity
- `npm run db:test-data` - Generate test data for development

### 🔌 API Tasks  
- `npm run api:analyze` - Analyze existing API patterns
- `npm run api:validate` - Validate API endpoints
- `npm run api:generate` - Generate new API endpoints

### 🎨 Frontend Tasks
- `npm run component:generate` - Generate React components
- `npm run component:help` - Show component options

### 📋 Task Investigation
- **ALWAYS use Task tool with `general-purpose` agent** for:
  - Complex research and planning
  - Multi-step file searches  
  - Understanding large codebases
  - Investigation phases before implementation

**NEVER work directly without using agents first.** Always start with agent investigation, then implement based on their findings.