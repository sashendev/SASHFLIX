# SASHFLIX Mobile App - Quick Reference

## ⚡ Essential Commands

```bash
# Start development
npm run dev                    # Start Next.js dev server (localhost:3000)

# Prepare for mobile
npm run build                  # Build Next.js for production
npm run mobile:sync            # Sync files with iOS & Android projects

# Open native IDEs
npm run mobile:ios             # Open Xcode (macOS only)
npm run mobile:android         # Open Android Studio

# Production
npm run start                  # Run production server (needed for mobile app to work!)
```

## 🎯 Typical Development Session

### On Emulator/Simulator (Easiest)

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Sync and run (wait a bit after dev server starts)
npm run mobile:sync
npm run mobile:ios    # or npm run mobile:android

# Changes auto-reload!
```

### On Real Device (Same WiFi)

1. **Find your IP:**
   ```bash
   ipconfig | findstr "IPv4"   # Windows
   ifconfig | grep inet         # macOS/Linux
   ```

2. **Edit `capacitor.config.ts`:**
   Replace `localhost` with your IP
   ```
   url: 'http://192.168.1.100:3000'
   ```

3. **Build and connect:**
   ```bash
   npm run build
   npm run mobile:sync
   npm run start
   npm run mobile:ios    # or mobile:android
   ```

4. **Connect device to same WiFi**

## 🔧 Setup (First Time Only)

All done! ✅ You have:
- ✅ iOS project (in `ios/` folder)
- ✅ Android project (in `android/` folder)
- ✅ Capacitor configuration
- ✅ Mobile npm scripts

The app connects to your Next.js server - your backend code works automatically!

## 📱 How It Works

```
Mobile App (iOS/Android) 
    ↓ HTTP
Next.js Server (Port 3000)
    ↓ API Calls
Supabase + TMDB + Other Services
```

**The mobile app IS your web app, running in a native container!**

## ⚠️ If App Won't Load

1. **Check server is running:** `npm run start` or `npm run dev`
2. **Check IP is correct:** Update `capacitor.config.ts` if needed
3. **Check network:** Device must be on same WiFi (for real devices)
4. **Clear and rebuild:**
   ```bash
   npm run build
   npm run mobile:sync
   ```

## 🚀 Ready to Build?

→ Read full guide: [CAPACITOR_SETUP.md](./CAPACITOR_SETUP.md)

---

**Mobile development in 3 commands:**
```bash
npm run dev           # Start server
npm run mobile:sync   # Prepare app
npm run mobile:ios    # Open iOS
```
