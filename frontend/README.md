# Student Management System - Frontend

Next.js frontend for the Student Management System with retro-styled UI.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                   # App Router
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home/redirect page
│   │   ├── auth/
│   │   │   └── login/        # Login page
│   │   ├── admin/            # Admin dashboard
│   │   │   ├── layout.tsx   # Admin layout
│   │   │   ├── page.tsx     # Admin dashboard
│   │   │   ├── courses/     # Course management
│   │   │   ├── batches/     # Batch management
│   │   │   ├── students/    # Student management
│   │   │   ├── invoices/    # Invoice management
│   │   │   └── certificates/ # Certificate management
│   │   └── student/          # Student portal
│   │       ├── layout.tsx   # Student layout
│   │       ├── page.tsx     # Student dashboard
│   │       ├── courses/     # My courses
│   │       ├── invoices/    # My invoices
│   │       └── certificates/ # My certificates
│   ├── components/           # Reusable components
│   ├── lib/
│   │   ├── api.ts           # API client & endpoints
│   │   └── auth.tsx         # Auth context
│   └── styles/
│       └── globals.css      # Global styles & Tailwind
├── middleware.ts             # Route protection
├── tailwind.config.ts        # Tailwind configuration
└── package.json
```

## Features

### Authentication
- JWT token management
- Automatic token refresh
- Role-based routing
- Protected routes

### Admin Dashboard
- Full CRUD for all resources
- Data tables with search/filter
- Modal forms
- PDF download

### Student Portal
- View enrolled courses
- View invoices and download PDFs
- View certificates and download PDFs
- Profile information

### Retro UI Design
- Custom Tailwind theme
- Pastel rainbow colors
- Rounded cards
- Soft shadows
- Pixel font option (VT323)

## Retro Color Scheme

```css
--retro-pink: #FFB3D9
--retro-mint: #B4E7CE
--retro-lavender: #D4C5F9
--retro-peach: #FFDAB9
--retro-blue: #B3D9FF
--retro-cream: #FFF8E7
```

## Custom CSS Classes

```css
.retro-card         - White card with rounded corners
.retro-btn          - Base button style
.retro-btn-primary  - Pink primary button
.retro-btn-secondary - Lavender secondary button
.retro-btn-success  - Mint green success button
.retro-input        - Styled form input
.retro-table        - Data table styling
```

## API Integration

The app uses Axios with interceptors for:
- Automatic JWT token attachment
- Token refresh on 401 errors
- Error handling
- Response transformation

## Middleware

Route protection based on:
- Authentication status
- User role (Admin/Student)
- Automatic redirects

## State Management

- Auth state: React Context
- Form state: Controlled components
- API data: Direct state with hooks

## Responsive Design

- Mobile-first approach
- Responsive navigation
- Adaptive layouts
- Touch-friendly UI

## Development Tips

1. **Hot Reload**: Changes auto-refresh
2. **TypeScript**: Strong typing for all API responses
3. **Tailwind**: Use custom classes from `globals.css`
4. **Components**: Create reusable components in `/components`
5. **API**: All endpoints in `/lib/api.ts`

## Troubleshooting

### CORS Issues
Ensure backend allows your frontend origin in CORS settings.

### Token Expiry
Tokens auto-refresh. If issues persist, logout and login again.

### API Connection
Verify `NEXT_PUBLIC_API_URL` in `.env.local` matches your backend URL.

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # Run ESLint
```
