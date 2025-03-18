# AI Learning Management System Frontend

A modern learning management system powered by AI, built with React and TypeScript.

## Features

- Email Analysis with AI
- Life Balance Analysis
- Memory and Learning Analysis
- User Authentication
- Responsive Design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API server running

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Copy `.env.development` to `.env.local` for local development
- Update `.env.production` with your production API URL

## Development

Start the development server:
```bash
npm start
```

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Production Deployment

1. Update environment variables:
   - Set `REACT_APP_API_URL` in `.env.production` to your production API URL
   - Configure any other necessary environment variables

2. Build the production bundle:
```bash
npm run build
```

3. The build folder is ready to be deployed.
   - You can serve it with a static server:
   ```bash
   npm install -g serve
   serve -s build
   ```
   - Or deploy to your hosting platform of choice (Netlify, Vercel, etc.)

## Deployment Checklist

- [ ] Update `.env.production` with production API URL
- [ ] Test all features with production API
- [ ] Run all tests and ensure they pass
- [ ] Check bundle size and optimize if necessary
- [ ] Verify error handling works correctly
- [ ] Test loading states and transitions
- [ ] Verify authentication flow
- [ ] Check CORS configuration with production API
- [ ] Test on different browsers and devices
- [ ] Enable monitoring and error tracking
- [ ] Set up CI/CD pipeline

## Project Structure

```
frontend/
├── src/
│   ├── components/    # Reusable components
│   ├── pages/        # Page components
│   ├── services/     # API services
│   ├── contexts/     # React contexts
│   ├── hooks/        # Custom hooks
│   ├── utils/        # Utility functions
│   └── types/        # TypeScript types
├── public/           # Static files
└── tests/           # Test files
```

## Available Scripts

- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Check TypeScript types

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 