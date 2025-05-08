# Task Management System

A full-stack task management application built with Next.js 14, TypeScript, MongoDB, and NextAuth.js. This application allows users to create, organize, and track their tasks with features like categories, priorities, and due dates.

## Features

- **User Authentication**: Secure sign-up, login, and user management using NextAuth.js
- **Task Management**: Create, edit, and delete tasks with various properties
- **Categories**: Organize tasks with custom categories
- **Filtering & Sorting**: Filter tasks by status, priority, and search terms
- **Task Status Tracking**: Track tasks through different states (To Do, In Progress, Completed)
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS and shadcn/ui
- **User Profiles**: Update profile information and preferences

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, MongoDB with Mongoose
- **Authentication**: NextAuth.js with JWT
- **Form Validation**: React Hook Form with Zod
- **State Management**: React Hooks
- **Styling**: Tailwind CSS with a component-first approach

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or Atlas)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/task-management-system.git
   cd task-management-system
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following:

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
├── app/                  # Next.js App Router
│   ├── (auth)/           # Authentication pages (login, register)
│   ├── (dashboard)/      # Dashboard and protected pages
│   ├── api/              # API routes
│   ├── globals.css       # Global styles
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── tasks/            # Task-related components
│   └── ui/               # UI components (shadcn/ui)
├── hooks/                # Custom React hooks
├── lib/                  # Utility library code
│   └── db/               # Database utilities
├── middleware.ts         # Next.js middleware for auth protection
├── models/               # Mongoose models
├── types/                # TypeScript types
└── utils/                # Helper utilities
```

## API Routes

- **Authentication**

  - POST `/api/auth/[...nextauth]` - Authentication endpoints
  - POST `/api/register` - User registration

- **Tasks**

  - GET `/api/tasks` - List all tasks (with filtering)
  - POST `/api/tasks` - Create a new task
  - GET `/api/tasks/:id` - Get a specific task
  - PATCH `/api/tasks/:id` - Update a task
  - DELETE `/api/tasks/:id` - Delete a task

- **Categories**
  - GET `/api/categories` - List all categories
  - POST `/api/categories` - Create a new category
  - PATCH `/api/categories/:id` - Update a category
  - DELETE `/api/categories/:id` - Delete a category

## Deployment

This application is configured for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy!

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [MongoDB](https://www.mongodb.com/)
- [NextAuth.js](https://next-auth.js.org/)
