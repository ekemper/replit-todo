# Todo Application

A simple, responsive todo application built with React featuring task management and filtering capabilities.

## Features

- Add, edit, and delete tasks
- Mark tasks as complete
- Filter tasks by status (All, Active, Completed)
- Persistent storage using PostgreSQL database
- Responsive design for mobile and desktop

## Running with Docker

This application is containerized with Docker for easy deployment and portability.

### Prerequisites

- Docker
- Docker Compose

### Running the Application

1. Clone this repository
2. Navigate to the project directory
3. Run the application using Docker Compose:

```bash
docker-compose up
```

The application will be available at http://localhost:5000

### Stopping the Application

To stop the application, use:

```bash
docker-compose down
```

To stop the application and remove all data (including the database volume), use:

```bash
docker-compose down -v
```

## Development

For local development without Docker:

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

## Database

The application uses PostgreSQL for data persistence. The database schema is automatically initialized on first run.

## Environment Variables

The following environment variables can be set in the Docker environment:

- `DATABASE_URL`: PostgreSQL connection string
- `PGUSER`: PostgreSQL username
- `PGHOST`: PostgreSQL host
- `PGPASSWORD`: PostgreSQL password
- `PGDATABASE`: PostgreSQL database name
- `PGPORT`: PostgreSQL port
- `NODE_ENV`: Node environment (development or production)

## License

MIT