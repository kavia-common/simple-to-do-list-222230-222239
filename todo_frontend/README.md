# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- Lightweight: vanilla CSS + React only
- Modern UI: Clean, responsive design with KAVIA styling
- Fast: Minimal dependencies
- Simple: Easy to understand and modify

## Getting Started

In the project directory, you can run:

- `npm start` — start in development mode
- `npm test` — run tests in watch mode
- `npm run build` — build for production

Open http://localhost:3000 in your browser when running locally.

## Environment Variables

This is a frontend-only app. It does not call a backend and therefore does not use most environment variables.

- Unused in this app:
  - REACT_APP_API_BASE
  - REACT_APP_BACKEND_URL
  - REACT_APP_FRONTEND_URL
  - REACT_APP_WS_URL
  - REACT_APP_NODE_ENV
  - REACT_APP_NEXT_TELEMETRY_DISABLED
  - REACT_APP_ENABLE_SOURCE_MAPS
  - REACT_APP_PORT
  - REACT_APP_TRUST_PROXY
  - REACT_APP_HEALTHCHECK_PATH
  - REACT_APP_FEATURE_FLAGS
  - REACT_APP_EXPERIMENTS_ENABLED

- Used by this app:
  - REACT_APP_LOG_LEVEL
    - Purpose: Optional debug logging.
    - Behavior: When set to `debug` and the app runs in development mode (NODE_ENV=development), the UI emits debug logs to the browser console from key lifecycle and action points.
    - Production builds never output these debug logs.

Example usage:
- Development with debug logs:
  - macOS/Linux: `REACT_APP_LOG_LEVEL=debug npm start`
  - Windows (PowerShell): `$env:REACT_APP_LOG_LEVEL="debug"; npm start`

To disable logs, omit the variable or set it to any value other than `debug`.

Note: Do not add secrets or sensitive values to REACT_APP_* variables. They are embedded in the client bundle at build time.

## Customization

- Colors: Defined as CSS variables in `src/App.css` under the Ocean Professional theme.
- Components: Pure HTML/CSS components with styles in `src/App.css`.

## Learn More

- React docs: https://reactjs.org/
- CRA guides:
  - Code Splitting: https://facebook.github.io/create-react-app/docs/code-splitting
  - Bundle Analysis: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size
  - PWA: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app
  - Advanced Config: https://facebook.github.io/create-react-app/docs/advanced-configuration
  - Deployment: https://facebook.github.io/create-react-app/docs/deployment
  - Troubleshooting: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
