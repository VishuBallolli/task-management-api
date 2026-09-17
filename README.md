# Task Management REST API

A Node.js and Express.js REST API for managing tasks with MySQL persistence. The backend is located in the `backend/` directory and uses `mysql2/promise` for database access.

## Overview

This project provides CRUD operations for tasks. Requests are handled by Express routes and controllers, then stored in a MySQL database. The API can be tested with Postman, while MySQL can be run locally through XAMPP and managed with phpMyAdmin.

## Features

- Create tasks
- Retrieve all tasks
- Retrieve a task by ID
- Update an existing task
- Delete an existing task
- Required-title validation for create and update operations
- MySQL connection pooling with `mysql2/promise`
- Parameterized SQL queries using `?` placeholders
- JSON request and response handling
- CORS support

## Technologies Used

- Node.js
- Express.js
- MySQL
- `mysql2/promise`
- Postman
- XAMPP/phpMyAdmin
- `dotenv`
- `cors`

## Project Structure

```text
Task Management API/
├── backend/
│   ├── .env
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── taskController.js
│   ├── middleware/
│   ├── routes/
│   │   └── taskRoutes.js
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
└── database/
    └── schema.sql
```

## Prerequisites

Install or have access to the following:

- Node.js and npm
- XAMPP with the MySQL service available
- phpMyAdmin for importing and inspecting the database
- Postman for API testing

## Installation and Setup

1. Clone or open the project directory.
2. Start the MySQL service in XAMPP.
3. Create the database and `tasks` table using the instructions in [Database Setup](#database-setup).
4. Open a terminal in the backend directory:

   ```bash
   cd backend
   ```

5. Install the backend dependencies:

   ```bash
   npm install
   ```

6. Create or update `backend/.env` with the local MySQL connection settings shown below.
7. Start the server:

   ```bash
   npm start
   ```

The server runs on the port configured by `PORT` and will only begin listening after a successful MySQL connection.

## Environment Variables

The backend loads these variables from `backend/.env`. Use your own local values and do not commit real passwords or other secrets to source control.

```env
PORT=5000

DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=task_management
DB_PORT=3306
```

For a default local XAMPP MySQL installation, the user is often `root` and the password may be blank, depending on your local configuration. Keep the actual value private and configure it only in your local `.env` file.

## Database Setup

The database schema is in [`database/schema.sql`](database/schema.sql). It creates the `task_management` database and the `tasks` table.

### Using phpMyAdmin

1. Start MySQL in XAMPP.
2. Open phpMyAdmin, commonly at `http://localhost/phpmyadmin`.
3. Open the **Import** tab.
4. Select `database/schema.sql`.
5. Click **Import** or **Go**.
6. Confirm that the `task_management` database and `tasks` table were created.

You can also open the SQL file in phpMyAdmin's **SQL** tab and execute it directly.

## Starting the Server

From the `backend/` directory:

```bash
npm start
```

For development with automatic restarts:

```bash
npm run dev
```

With the default environment configuration, the API base URL is:

```text
http://localhost:5000
```

## API Endpoints

All task endpoints use the `/tasks` base path.

### GET `/tasks`

Returns all tasks, ordered by ID descending.

**Success response:** `200 OK`

```json
[
  {
    "id": 1,
    "title": "Set up project",
    "description": "Configure the local development environment",
    "status": "pending",
    "created_at": "2026-09-17T10:00:00.000Z",
    "updated_at": "2026-09-17T10:00:00.000Z"
  }
]
```

**Possible status codes:**

- `200 OK` - Tasks retrieved successfully
- `500 Internal Server Error` - Database error

### GET `/tasks/:id`

Returns one task by its numeric ID.

**Success response:** `200 OK`

```json
{
  "id": 1,
  "title": "Set up project",
  "description": "Configure the local development environment",
  "status": "pending",
  "created_at": "2026-09-17T10:00:00.000Z",
  "updated_at": "2026-09-17T10:00:00.000Z"
}
```

**Possible status codes:**

- `200 OK` - Task found
- `404 Not Found` - Task does not exist
- `500 Internal Server Error` - Database error

### POST `/tasks`

Creates a task. The `title` field is required. If omitted, `description` is stored as `NULL` and `status` defaults to `pending`.

**Request body:**

```json
{
  "title": "Write API documentation",
  "description": "Document setup and endpoint usage",
  "status": "pending"
}
```

**Success response:** `201 Created`

The response contains the newly created task, including its generated ID and timestamp fields.

**Possible status codes:**

- `201 Created` - Task created successfully
- `400 Bad Request` - `title` is missing
- `500 Internal Server Error` - Database error

### PUT `/tasks/:id`

Updates an existing task. The `title` field is required. If `description` is omitted, it is stored as `NULL`; if `status` is omitted, it defaults to `pending`.

**Request body:**

```json
{
  "title": "Write complete API documentation",
  "description": "Include setup, database, CRUD, and Postman instructions",
  "status": "in-progress"
}
```

**Success response:** `200 OK`

The response contains the updated task.

**Possible status codes:**

- `200 OK` - Task updated successfully
- `400 Bad Request` - `title` is missing
- `404 Not Found` - Task does not exist
- `500 Internal Server Error` - Database error

### DELETE `/tasks/:id`

Deletes an existing task by ID.

**Success response:** `200 OK`

```json
{
  "message": "Task deleted successfully"
}
```

**Possible status codes:**

- `200 OK` - Task deleted successfully
- `404 Not Found` - Task does not exist
- `500 Internal Server Error` - Database error

## Database Model

The `tasks` table contains:

| Column | Type | Description |
| --- | --- | --- |
| `id` | `INT UNSIGNED` | Auto-incrementing primary key |
| `title` | `VARCHAR(255)` | Required task title |
| `description` | `TEXT` | Optional task description; may be `NULL` |
| `status` | `VARCHAR(50)` | Required status, defaulting to `pending` |
| `created_at` | `TIMESTAMP` | Set automatically when the task is created |
| `updated_at` | `TIMESTAMP` | Set automatically and updated when the row changes |

The table uses the InnoDB storage engine and `utf8mb4` character encoding. The complete definition is in `database/schema.sql`.

## Request Safety

Database operations use parameterized SQL queries with `?` placeholders. Values such as task IDs, titles, descriptions, and statuses are supplied separately from the SQL statements, which avoids building queries by concatenating request data into SQL strings.

## Request Flow

A typical request follows this path:

```text
Postman
  -> Express server and JSON parser
  -> Task route in routes/taskRoutes.js
  -> Controller in controllers/taskController.js
  -> MySQL connection pool in config/database.js
  -> tasks table in MySQL
  -> JSON response back to Postman
```

The server mounts the task router at `/tasks`. The route selects the controller, and the controller validates request data, executes the appropriate parameterized query, and returns the HTTP response.

## Postman Testing

1. Start MySQL in XAMPP.
2. Confirm that the database exists and the backend `.env` values match the local MySQL configuration.
3. Start the backend with `npm start` from `backend/`.
4. Create a Postman request using `http://localhost:5000` as the base URL.
5. For POST and PUT requests, select **Body** → **raw**, choose **JSON**, and provide a JSON request body.
6. Send requests in the CRUD order described below, or use an existing task ID for GET, PUT, and DELETE tests.
7. Check the response body and status code against the endpoint documentation.

## CRUD Workflow Example

1. **Create:** Send `POST /tasks` with a title and optional description/status. Save the returned `id`.
2. **Read all:** Send `GET /tasks` to view the task collection.
3. **Read one:** Send `GET /tasks/:id` using the returned ID.
4. **Update:** Send `PUT /tasks/:id` with the required title and any new description or status.
5. **Delete:** Send `DELETE /tasks/:id` using the same ID and confirm the success message.
6. **Verify deletion:** Send `GET /tasks/:id` again and confirm that it returns `404 Not Found`.
