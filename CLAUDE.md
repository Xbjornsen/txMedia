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

## Git Workflow - CRITICAL

**NEVER PUSH DIRECTLY TO MAIN BRANCH**

Always follow proper GitHub practices:

1. **Create Feature Branch**: `git checkout -b feature/branch-name` 
2. **Make Changes**: Work on the feature branch
3. **Commit Changes**: Standard commit messages
4. **Push Branch**: `git push -u origin feature/branch-name`
5. **Create Pull Request**: Use GitHub UI or `gh pr create`
6. **Review & Merge**: Only merge via PR after review

**Main branch is protected** - all changes must go through pull requests.

## Agent Usage - MANDATORY

**ALWAYS USE PROJECT AGENTS FIRST**

Before any task, you must use the appropriate custom agents built for this project:

### 🗄️ Database Tasks - Use `database-management` agent
- Database schema validation and integrity checks
- Health monitoring and performance analysis
- Backup creation and data export
- Test data generation for development

### 🔌 API Tasks - Use `api-generator` agent
- Generate Next.js API endpoints with authentication patterns
- Admin and gallery scope endpoints
- CRUD operations and file handling

### 🎨 Frontend Tasks - Use `component-generator` agent
- Generate React components with TypeScript
- Admin, gallery, and UI component categories
- Design system integration with Tailwind CSS

### 📸 Media Processing Tasks - Use `media-processing` agent
- Image optimization and format conversion
- Thumbnail generation and watermarking
- Batch processing and storage migration
- Media analysis and cleanup operations

### 📋 Task Investigation
- **ALWAYS use Task tool with `general-purpose` agent** for:
  - Complex research and planning
  - Multi-step file searches  
  - Understanding large codebases
  - Investigation phases before implementation

**NEVER work directly without using agents first.** Always start with agent investigation, then implement based on their findings.
