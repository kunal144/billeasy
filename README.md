# BillEasy Mini-project

A simple RESTful API for managing books and reviews, built with Node.js, Express, and MongoDB.

---

## Table of Contents

- [Project Setup](#project-setup)
- [Run Locally](#run-locally)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Books](#books)
  - [Reviews](#reviews)
  - [Search](#search)
- [Design Decisions & Assumptions](#design-decisions--assumptions)
- [Database Schema](#database-schema)

---

## Project Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/kunal144/billeasy.git
   cd book-review-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the project root and add:
   ```env
   MONGODB_URI=mongodb://localhost:27017/book-review-db
   JWT_SECRET=your_jwt_secret
   PORT=3000
   ```

---

## Run Locally

Start the development server with:

```bash
npm run dev
```

By default, the API will be available at `http://localhost:3000/api`.

---

## API Endpoints

### Authentication

- **Signup**: `POST /api/auth/signup`

  - Body: `{ name, email, password }`
  - Response: `{ status, message, token }`

- **Login**: `POST /api/auth/login`
  - Body: `{ email, password }`
  - Response: `{ status, token, user }`

Include the returned JWT in the `Authorization` header for protected routes:

```
Authorization: Bearer <token>
```

### Books

- **Create Book** (auth required)

  ```bash
  curl -X POST http://localhost:3000/api/books \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{ "title": "Dune", "author": "Frank Herbert", "genre": "Sci-Fi", "description": "A desert planet saga" }'
  ```

- **List Books** (Optional Filter by Author or Genre )

  ```bash
  curl http://localhost:3000/api/books?page=1&limit=10&author=Herbert
  ```

- **Get Book Details**
  ```bash
  curl http://localhost:3000/api/books/60d21b4667d0d8992e610c85?page=1&limit=5
  ```
  - Includes average rating and paginated reviews.

### Reviews

- **Submit Review** (auth required)

  ```bash
  curl -X POST http://localhost:3000/api/books/60d21b4667d0d8992e610c85/reviews \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{ "rating": 5, "comment": "Amazing read!" }'
  ```

- **Update Review** (auth required)

  ```bash
  curl -X PUT http://localhost:3000/api/reviews/60d22b3c8f8b9a9e9d3f4a12 \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{ "rating": 4, "comment": "Still great, but noticed some pacing issues." }'
  ```

- **Delete Review** (auth required)
  ```bash
  curl -X DELETE http://localhost:3000/api/reviews/60d22b3c8f8b9a9e9d3f4a12 \
    -H "Authorization: Bearer $TOKEN"
  ```

### Search

- **Search Books**
  ```bash
  curl http://localhost:3000/api/books/search?q=tolkien&page=1&limit=5
  ```

---

## Design Decisions & Assumptions

- **One Review Per User**: User can post one review per book.
- **Pagination Defaults**: `page=1`, `limit=10` for books and `limit=5` for reviews.

---

## Database Schema

### User

| Field      | Type     | Required | Description |
| ---------- | -------- | -------- | ----------- |
| `_id`      | ObjectId | Yes      | Primary key |
| `name`     | String   | Yes      | User Name   |
| `gender`   | String   | Yes      | User Gender |
| `email`    | String   | Yes      | User Email  |
| `password` | String   | No       | jwt token   |

### Book

| Field         | Type     | Required | Description          |
| ------------- | -------- | -------- | -------------------- |
| `_id`         | ObjectId | Yes      | Primary key          |
| `title`       | String   | Yes      | Book title           |
| `author`      | String   | Yes      | Author name          |
| `genre`       | String   | Yes      | Genre category       |
| `description` | String   | No       | Brief synopsis       |
| `createdAt`   | Date     | Yes      | Record creation time |
| `updatedAt`   | Date     | Yes      | Last update time     |

### Review

| Field       | Type     | Required | Description           |
| ----------- | -------- | -------- | --------------------- |
| `_id`       | ObjectId | Yes      | Primary key           |
| `book`      | ObjectId | Yes      | References `Book._id` |
| `user`      | ObjectId | Yes      | References `User._id` |
| `rating`    | Number   | Yes      | 1–5 scale             |
| `comment`   | String   | No       | User’s review text    |
| `createdAt` | Date     | Yes      | Record creation time  |
| `updatedAt` | Date     | Yes      | Last update time      |

-
