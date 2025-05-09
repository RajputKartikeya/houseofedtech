# Task Management System

A full-stack task management application built with Next.js 15, TypeScript, MongoDB, and NextAuth.js. This application allows users to create, organize, and track their tasks with features like categories, priorities, and due dates.

## Features

- **User Authentication**

  - Secure sign-up and login using NextAuth.js
  - Protected routes with middleware
  - JWT-based session management
  - User profile management

- **Task Management**

  - Create, edit, and delete tasks
  - Set task priorities (Low, Medium, High)
  - Track task status (To Do, In Progress, Completed)
  - Add due dates and descriptions
  - Assign tasks to categories

- **Category Management**

  - Create and manage custom categories
  - Organize tasks by category
  - Edit and delete categories

- **Advanced Filtering & Search**

  - Filter tasks by status and priority
  - Search tasks by title or description
  - URL-based filter state management
  - Responsive filter UI

- **Modern UI/UX**
  - Clean and intuitive interface
  - Responsive design for all devices
  - Loading states and animations
  - Toast notifications for feedback
  - Form validation with Zod
  - Accessible components with shadcn/ui

## Tech Stack

- **Frontend**

  - Next.js 15 (App Router)
  - React 18
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components
  - React Hook Form
  - Zod validation
  - Sonner toast notifications

- **Backend**

  - Next.js API routes
  - MongoDB with Mongoose
  - NextAuth.js for authentication
  - JWT for session management

- **Development Tools**
  - ESLint for code linting
  - Prettier for code formatting
  - TypeScript for type safety
  - Git for version control

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or Atlas)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/RajputKartikeya/houseofedtech.git
   cd houseofedtech
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:

   ```
   # MongoDB Connection String
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/         # Login page and form
│   │   └── register/      # Registration page
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── dashboard/     # Main dashboard
│   │   ├── tasks/         # Task management
│   │   ├── categories/    # Category management
│   │   └── profile/       # User profile
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── tasks/         # Task endpoints
│   │   └── categories/    # Category endpoints
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── tasks/            # Task-related components
│   └── ui/               # UI components (shadcn/ui)
├── hooks/                # Custom React hooks
├── lib/                  # Utility library code
│   └── db/              # Database utilities
├── middleware.ts         # Next.js middleware for auth
├── models/              # Mongoose models
├── types/               # TypeScript types
└── utils/               # Helper utilities
```

## API Routes

### Authentication

- `POST /api/auth/[...nextauth]` - NextAuth.js authentication endpoints
- `POST /api/register` - User registration endpoint

### Tasks

- `GET /api/tasks` - List tasks with filtering
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PATCH /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Categories

- `GET /api/categories` - List all categories
- `POST /api/categories` - Create a new category
- `PATCH /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

## Development

### Code Style

- Follow the TypeScript and ESLint configurations
- Use Prettier for consistent formatting
- Write meaningful commit messages

### Best Practices

- Use TypeScript for type safety
- Implement proper error handling
- Add loading states for better UX
- Follow React best practices
- Write clean and maintainable code

## Deployment

This application is configured for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [MongoDB](https://www.mongodb.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
