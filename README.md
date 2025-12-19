# Web Video Platform

A multi-container web application for video streaming with user management.

## Tech Stack

- **Frontend:** React + Vite, TailwindCSS
- **Backend:** Spring Boot, Spring Security + JWT
- **Database:** MySQL 8.0
- **Storage:** Cloudinary (images, avatars)
- **Containerization:** Docker Compose

## Features

### Video Management
- Create, edit, delete videos
- Thumbnail Selection:
  - Choose from existing preset assets
  - Custom URL input

### User Profiles
- Profile Image Selection:
  - Choose from preset avatars
  - Upload custom image to Cloudinary
- User registration and authentication
- Watch list management

### Additional Features
- Video categories and search
- Comments and ratings
- Related videos sidebar
- Notifications (manual fetch)
- Playlists and subscriptions

## Project Structure

```
├── be/                  # Backend (Spring Boot)
│   └── src/
├── fe/                  # Frontend (React + Vite)
│   └── src/
│       ├── components/  # React components
│       ├── pages/       # Page components
│       ├── stores/      # Zustand stores
│       └── utils/       # Utility functions
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites
- Docker and Docker Compose installed

### Run the Application

```bash
docker-compose up --build
```

### Access Points
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080

### Stop Application

```bash
docker-compose down
```

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `SPRING_DATASOURCE_URL` | MySQL connection URL |
| `SPRING_DATASOURCE_USERNAME` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | Database password |

### Cloudinary Configuration

In `application.properties`:

```properties
cloudinary.cloud-name=your-cloud-name
cloudinary.api-key=your-api-key
cloudinary.api-secret=your-api-secret
```

## Troubleshooting

**Port conflicts:**
```bash
netstat -ano | findstr :5173
```

**View logs:**
```bash
docker-compose logs frontend
docker-compose logs backend
```

**Rebuild without cache:**
```bash
docker-compose build --no-cache
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/signin` | User login |
| POST | `/api/auth/logout` | User logout |

### Videos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/videos` | List all videos |
| POST | `/api/videos` | Create video |
| PUT | `/api/videos/{id}` | Update video |
| DELETE | `/api/videos/{id}` | Delete video |

### File Uploads
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/uploads/avatar` | Upload avatar to Cloudinary |
| POST | `/api/uploads/avatar-url` | Set avatar from URL |

## Contributors

- [Add your team members here]

## License

MIT License
