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