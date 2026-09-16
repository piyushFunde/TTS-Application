# Echo Text-to-Speech Application

Echo is a React + Spring Boot starter for turning written text into speech. The frontend works immediately in browser preview mode using the Web Speech API, so no cloud credentials are needed to explore the experience.

## Run the frontend

```powershell
Set-Location frontend
npm run dev
```

The frontend includes character and word counts, voice selection, delivery speed, browser playback, validation, and script download. It is designed to call the backend contract when a provider adapter is connected.

## Run the backend

Requirements: Java 21 and Maven.

```powershell
Set-Location backend
mvn spring-boot:run
```

Endpoints:

- `GET /api/health`
- `GET /api/voices`
- `POST /api/tts`

The `/api/tts` endpoint intentionally returns `501` until a provider adapter is implemented. Configure provider credentials through `TTS_API_KEY`, `TTS_REGION`, and `TTS_ENDPOINT`; never put them in the React app.

## Project layout

- `frontend/`: Vite React application and responsive studio UI
- `backend/`: Spring Boot API contract and validation layer
