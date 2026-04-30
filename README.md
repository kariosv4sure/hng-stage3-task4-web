```markdown
# Insighta Labs+ Web Portal

Dark-themed web dashboard for the Insighta Labs+ profile intelligence platform. Features GitHub OAuth login, natural language profile search, filtering, pagination, and CSV export.

## Live URL

```

https://hng-stage3-task4-web.vercel.app

```

## Tech Stack

- HTML5 / CSS3 / Vanilla JavaScript
- Tailwind CSS (CDN)
- Font Awesome 6 (CDN)
- Deployed on Vercel

## Features

- GitHub OAuth login with secure HTTP-only cookies
- Dark theme UI with Tailwind CSS
- Profile listing with pagination (10 per page)
- Natural language search (e.g. "young males from nigeria")
- Gender and age group filters
- Gender confidence visualization with gradient bars
- CSV export with download
- Responsive design for all screen sizes
- Automatic session check and redirect
- Token fallback for cross-domain cookie support

## Pages

### Login Page (`index.html`)

- GitHub OAuth login button
- Automatic session check - redirects to dashboard if already authenticated
- Error state handling

### Dashboard (`dashboard.html`)

- Welcome message with GitHub username
- Total profiles count
- Unique countries count
- Search bar with natural language support
- Gender and age group filters
- Profiles table with:
  - Gender badges (blue for male, pink for female)
  - Confidence visualization bars
  - Hover effects
- Pagination controls
- CSV export button
- Logout button

## Authentication

- JWT tokens stored in HTTP-only cookies (primary method)
- Token fallback via URL parameter for cross-domain scenarios
- Credentials included in all API requests via `credentials: "include"`
- Automatic redirect to login on 401 responses
- Session cleared on logout (localStorage, sessionStorage, cookies)

## Project Structure

```

├── index.html          # Login page
├── dashboard.html      # Main dashboard page
├── css/
│   └── styles.css      # Custom styles
└── js/
├── api.js          # API client with authentication
├── auth.js         # Login page logic
└── dashboard.js    # Dashboard logic (profiles, search, export)

```

## API Integration

All API requests go to the backend at:
```

https://hng-stage3-task4-backend-production.up.railway.app/api/v1

```

The `api.js` file provides reusable functions:
- `apiGet(path)` - GET requests with auth
- `apiPost(path, body)` - POST requests with auth
- `apiPut(path, body)` - PUT requests with auth
- `apiDelete(path)` - DELETE requests with auth

## Cross-Domain Support

Since the frontend (Vercel) and backend (Railway) are on different domains:
- Cookies use `SameSite=None; Secure` for cross-domain requests
- Token fallback in URL parameter if cookies are blocked
- CORS properly configured on backend
```

--

