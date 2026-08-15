# SASHFLIX Mobile App Setup with Capacitor

This guide walks you through setting up and building the SASHFLIX mobile app using Capacitor.

## ✅ What's Been Done

1. ✅ Capacitor CLI installed globally
2. ✅ `capacitor.config.ts` created with Next.js server integration
3. ✅ Capacitor core packages installed (`@capacitor/core`, `@capacitor/ios`, `@capacitor/android`)
4. ✅ iOS and Android native projects created
5. ✅ NPM scripts added for mobile development
6. ✅ Next.js build completed and tested

## 📋 Prerequisites

### For iOS Development (macOS only)
- Xcode 15.0+
- CocoaPods
- iOS deployment target 13.0+

### For Android Development
- Android Studio
- Android SDK 24+
- Java Development Kit (JDK) 17+

## ⚡ Important: How SASHFLIX Mobile Works

Since SASHFLIX uses Next.js with **server-side rendering, API routes, and server actions**, the mobile app connects to a **running Next.js server** via HTTP. This is different from static site exports.

**The mobile app will only work when the Next.js server is running.**

## 🚀 Quick Start (Emulator/Simulator)

### 1. Build the Next.js app
```bash
npm run build
```

### 2. Start the Next.js server
```bash
npm run start
```

### 3. In another terminal, sync with Capacitor
```bash
npm run mobile:sync
```

### 4. Open and run the app
```bash
# iOS (macOS only)
npm run mobile:ios

# Android
npm run mobile:android
```

## 📱 Quick Start (Real Device on Same Network)

### 1. Find your machine's IP address

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" (usually 192.168.X.X)

**macOS/Linux:**
```bash
ifconfig
```
Look for "inet" address

### 2. Update capacitor.config.ts

Replace the server URL:
```typescript
server: {
  androidScheme: 'https',
  url: 'http://YOUR_IP:3000', // e.g., http://192.168.1.100:3000
},
```

### 3. Build and sync
```bash
npm run build
npm run mobile:sync
```

### 4. Start server and run app
```bash
npm run start
npm run mobile:ios  # or mobile:android
```

## 🔄 Development Workflows

### Workflow A: Emulator/Simulator Development (Easiest)

Use this when developing on your machine with an emulator/simulator.

1. **Terminal 1: Start the dev server**
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:3000`

2. **Terminal 2: Sync and run**
   ```bash
   npm run mobile:sync
   npm run mobile:ios  # or mobile:android
   ```

3. **Hot reload:** Changes in your code automatically update in the app

### Workflow B: Real Device Development (Same Network)

Use this when testing on a physical iOS/Android device.

1. **Find your machine's IP:**
   ```bash
   # Windows
   ipconfig | findstr "IPv4"
   
   # macOS/Linux
   ifconfig | grep inet
   ```

2. **Update `capacitor.config.ts`:**
   ```typescript
   server: {
     androidScheme: 'https',
     url: 'http://192.168.X.X:3000', // Replace X.X with your IP
   },
   ```

3. **Build and sync:**
   ```bash
   npm run build
   npm run mobile:sync
   ```

4. **Start server (keep running):**
   ```bash
   npm run start
   ```

5. **Run on device:**
   ```bash
   npm run mobile:ios  # or mobile:android
   ```

6. **Connect device to same WiFi network as your machine**

### Workflow C: Production Deployment

For releasing to App Store/Play Store, you'd typically:

1. Deploy your Next.js backend to a server (Vercel, AWS, etc.)
2. Update `capacitor.config.ts` with the production server URL
3. Build and release through Xcode/Android Studio

## 🛠️ All Available Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build Next.js for production

# Mobile
npm run mobile:build       # Build + sync (production)
npm run mobile:sync        # Sync current build only
npm run mobile:ios         # Open iOS project in Xcode
npm run mobile:android     # Open Android project in Android Studio
npm run mobile:help        # Show mobile development tips

# Supabase (if needed)
npm run sb-start          # Start local Supabase
npm run sb-stop           # Stop Supabase
npm run sb-restart        # Restart Supabase
```

## 📱 Opening Native Projects

### iOS
```bash
npm run mobile:ios
```
This opens Xcode. Select a simulator or device, then click the Play button (▶) to build and run.

**Common issues:**
- Make sure you're on macOS
- Install Xcode from App Store
- Pod dependencies: In Xcode, run `pod install` in the `ios/App` directory

### Android
```bash
npm run mobile:android
```
This opens Android Studio. Select an emulator or device, then click Run (▶).

**Common issues:**
- Make sure Android SDK is installed
- Create a virtual device in Android Studio first
- Check SDK paths in Android Studio preferences

## 🔐 Supabase Authentication

Your authentication will work through the server. Just ensure:

1. **Redirect URLs configured in Supabase Dashboard:**
   - Go to Authentication → URL Configuration
   - Add: `http://localhost:3000/auth/callback` (development)
   - Add: `http://YOUR_IP:3000/auth/callback` (real device)
   - Add production URL when deploying

2. **CORS is handled by your Next.js server** (already configured)

3. **API Keys are public** (using `NEXT_PUBLIC_*` variables) - this is secure for client-side auth

## 🎯 Common Tasks

### Update code and test on mobile

**Development mode:**
```bash
# Terminal 1
npm run dev

# Terminal 2 - Make changes, then:
npm run mobile:sync
# Refresh app or reload in browser to see changes
```

**Production mode:**
```bash
npm run build
npm run mobile:sync
npm run start
npm run mobile:ios  # or mobile:android
```

### Change app version
Edit `capacitor.config.ts`:
```typescript
appVersion: '1.0.1',
```

### Clean rebuild
```bash
npm run build
npm run mobile:sync
```

### Remove a platform
```bash
npx cap remove ios
# or
npx cap remove android
```

## 📊 Architecture Overview

```
┌─────────────────────────────────────────┐
│     Mobile App (iOS/Android)            │
│     Capacitor Container                 │
│     (Built from native projects)        │
└─────────────┬───────────────────────────┘
              │ HTTP Requests
              │
      ┌───────▼────────────┐
      │ Next.js Server     │
      │ Running on:        │
      │ localhost:3000     │
      │ or 192.168.X.X:3000│
      └─────────┬──────────┘
              │ API Calls
              │
      ┌───────▼──────────────┐
      │ Supabase Backend     │
      │ TMDB API             │
      │ External Services   │
      └──────────────────────┘
```

The mobile app is basically a web view that connects to your Next.js backend via HTTP. All your existing backend logic, authentication, and API routes work automatically!

## ⚠️ Troubleshooting

### App won't connect / shows "Cannot connect"
1. Check server is running: `npm run start` or `npm run dev`
2. Check your IP address is correct in `capacitor.config.ts`
3. Ensure device/emulator is on same network
4. Check firewall isn't blocking port 3000

### App crashes on startup
- **iOS:** Open Xcode Console to see error logs
- **Android:** Use Android Studio's Logcat to see error logs
- Check that all environment variables are set (`.env.local`)

### Changes not showing up in app
```bash
npm run build
npm run mobile:sync
# Then reload the app or do a full app restart
```

### "Cannot find module" or TypeScript errors
```bash
npm install
npm run build
npm run mobile:sync
```

### Supabase auth not working
1. Verify redirect URLs in Supabase Dashboard
2. Check `.env.local` has correct Supabase keys
3. Ensure auth routes are accessible from your IP

## 🔌 Adding Native Features

To add native device features (camera, storage, notifications, etc.):

```bash
# Camera
npm install @capacitor/camera
npx cap sync

# Storage
npm install @capacitor/filesystem
npx cap sync

# Notifications
npm install @capacitor/local-notifications
npx cap sync

# Geolocation
npm install @capacitor/geolocation
npx cap sync
```

Then use in your components:
```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

const takePhoto = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri,
  });
  console.log(image);
};
```

## 📚 Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor with Next.js](https://capacitorjs.com/docs/frameworks/nextjs)
- [iOS Development Guide](https://capacitorjs.com/docs/ios)
- [Android Development Guide](https://capacitorjs.com/docs/android)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)

## 🎯 Next Steps

1. ✅ **Setup complete!** You now have iOS and Android projects
2. **Choose a workflow** (emulator or real device)
3. **Start developing** using the commands above
4. **Test on multiple devices** before release
5. **Deploy backend** when ready for production

---

**Start developing:** `npm run dev` then `npm run mobile:sync` then `npm run mobile:ios` 🚀
