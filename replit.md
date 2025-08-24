# NGO ID Card Management System

## Overview

A full-stack web application for generating and managing NGO member ID cards. Built with React frontend and Express backend, this system allows NGOs to create, customize, and print professional identification cards for their members. The application features member management, card template customization, organization settings, and PDF export functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for development
- **UI Library**: Radix UI primitives with shadcn/ui components for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Data Layer**: Drizzle ORM with PostgreSQL database (Neon Database serverless)
- **File Handling**: Multer for image uploads with disk storage
- **Development**: Hot module replacement with Vite middleware integration
- **Session Management**: Express sessions with PostgreSQL store

### Database Design
- **Members Table**: Stores member information including personal details, contact info, joining date, and photo URLs
- **NGO Settings Table**: Organization configuration including name, contact details, branding assets (logo, signature), and QR code patterns
- **Card Templates Table**: Customizable card designs with color schemes, fonts, and layout options
- **Schema Management**: Drizzle migrations for version-controlled database changes

### API Architecture
- **RESTful Design**: Standard HTTP methods for CRUD operations
- **File Upload Support**: Multipart form data handling for member photos and organization assets
- **Error Handling**: Centralized error middleware with consistent response format
- **Request Logging**: Custom middleware for API request tracking and debugging

### Authentication & Authorization
- **Session-based**: Express sessions for user state management
- **File Security**: Served uploads with proper access controls
- **Input Validation**: Schema-based validation using Zod for all API endpoints

### Card Generation System
- **Template Engine**: Dynamic card generation with customizable templates
- **PDF Export**: Browser-based PDF generation for printing
- **Asset Management**: Organized file storage for member photos and organizational branding
- **QR Code Integration**: Configurable QR code patterns for card verification

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL for production data storage
- **Connection**: @neondatabase/serverless driver for database connectivity

### UI Components
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Utility for component variant management

### File Processing
- **Multer**: Middleware for handling multipart/form-data file uploads
- **File System**: Node.js fs promises for file operations

### Development Tools
- **Replit Integration**: Custom plugins for Replit environment support
- **TypeScript**: Static type checking across the entire application
- **PostCSS**: CSS processing with Tailwind CSS integration

### Fonts & Styling
- **Google Fonts**: Inter, DM Sans, Fira Code, Geist Mono, and Architects Daughter
- **Tailwind CSS**: Utility-first CSS framework with custom theme configuration