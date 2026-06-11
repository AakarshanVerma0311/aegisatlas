# AegisAtlas Tourist App

React Native + Expo client for tourists.

## Run

```bash
npm install
npx expo start
```

Set `EXPO_PUBLIC_BACKEND_URL` to backend URL.

## Included features

- Role selector and tourist registration
- JWT stored using `expo-secure-store`
- 3D-like layered player character with WALKING/STANDING/IN_DANGER/PANIC states
- Background ping loop and real-time anomaly/panic updates via Socket.IO
- HUD + danger overlay + QR screen component
