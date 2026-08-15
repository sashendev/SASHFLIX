# SASHFLIX — Discover. Watch. Enjoy.

<div align="center">

![SASHFLIX Preview](https://raw.githubusercontent.com/sashendev/SASHFLIX/main/public/mockup.png)

**A modern, open-source streaming platform built for discovering and enjoying movies & TV shows.**

</div>

---

## 🎬 About SASHFLIX

**SASHFLIX** is a free, open-source movie and TV show streaming platform designed to make discovering and watching content simple, fast, and enjoyable.

Built with modern web technologies, SASHFLIX combines a clean, responsive interface with powerful discovery tools, personalized libraries, and a foundation designed to grow into a larger entertainment platform.

> **Built to explore. Designed to watch. Made to evolve.**

## ✨ Features

* **🆓 Free & Open Source** — Completely free to use, explore, and modify.
* **🎞️ Movie & TV Discovery** — Explore popular, trending, upcoming, and genre-based content.
* **🔍 Powerful Search** — Find movies, TV shows, actors, genres, and more.
* **📚 Personal Watchlist** — Save content you want to watch later.
* **🕘 Watch History** — Keep track of your viewing activity.
* **👤 User Accounts** — Create an account and access personalized features.
* **🌙 Light & Dark Mode** — Switch between themes based on your preference.
* **📱 Responsive Design** — Works across mobile, tablet, and desktop devices.
* **📲 Progressive Web App** — Install SASHFLIX on supported devices for an app-like experience.
* **📲 Native Mobile Apps** — Build iOS and Android apps with Capacitor from a single codebase.
* **⚡ Modern & Fast UI** — Designed around smooth navigation and a clean viewing experience.

## 🗺️ Project Status

| Feature              | Status         |
| -------------------- | -------------- |
| 🎬 Movie Discovery   | ✅ Completed    |
| 📺 TV Shows          | ✅ Completed    |
| 🔎 Search            | ✅ Completed    |
| 👤 User Accounts     | ✅ Completed    |
| 📚 Watchlist         | ✅ Completed    |
| 🕘 Watch History     | ✅ Completed    |
| 🌗 Theme System      | 🚧 In Progress |
| ⚙️ Personal Settings | 🚧 In Progress |
| 🏆 Achievements      | 📋 Planned     |
| 🌐 Social Features   | 📋 Planned     |

SASHFLIX is actively evolving, and its features may change as development continues.

## 🛠️ Built With

* **Next.js** — Application framework and routing
* **React** — UI architecture
* **TypeScript** — Type-safe application development
* **Tailwind CSS** — Responsive styling
* **Next UI** — UI components
* **TanStack Query** — Data fetching and caching
* **TMDB API** — Movie and TV metadata
* **Supabase** — Authentication and database
* **Vercel** — Deployment and hosting

## 🚀 Getting Started

### Prerequisites

Make sure you have:

* Node.js
* npm
* Git

You will also need the required API keys and service credentials.

### 1. Clone the repository

```bash
git clone https://github.com/sashendev/SASHFLIX.git
cd SASHFLIX
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create your local environment file:

```bash
cp .env.example .env.local
```

Add the required API keys and configuration to `.env.local`.

### 4. Start the development server

```bash
npm run dev
```

### 5. Open the application

Visit:

```text
http://localhost:3000
```

## 📱 Building the Mobile App with Capacitor

SASHFLIX includes Capacitor support for building native iOS and Android mobile apps from your web codebase.

### Prerequisites

**For Android Development:**
- Android Studio
- Android SDK 24+
- Java Development Kit (JDK) 17+

**For iOS Development (macOS only):**
- Xcode 15.0+
- CocoaPods
- iOS deployment target 13.0+

### Quick Start

#### 1. Build and Sync

```bash
npm run build
npm run mobile:sync
```

#### 2. Open Native IDE

```bash
# Android
npm run mobile:android

# iOS (macOS only)
npm run mobile:ios
```

#### 3. Build APK/IPA

**Android (Debug APK):**
- In Android Studio: `Build → Build Bundle(s) / APK(s) → Build APK(s)`
- Find APK in: `android/app/build/outputs/apk/debug/app-debug.apk`

**iOS (IPA):**
- In Xcode: `Product → Build` 
- Archive via `Product → Archive`

### Mobile App Commands

```bash
npm run mobile:build        # Build + Sync (production)
npm run mobile:sync         # Sync with native projects
npm run mobile:ios          # Open iOS project in Xcode
npm run mobile:android      # Open Android project in Android Studio
```

### Development with Local Server

For development with live reload:

1. Start dev server: `npm run dev`
2. Update `capacitor.config.ts` with your machine IP (optional for emulator)
3. Sync: `npm run mobile:sync`
4. Run: `npm run mobile:ios` or `npm run mobile:android`

### Production Deployment

The mobile app connects to your backend via HTTP. Configure the server URL in `capacitor.config.ts`:

```typescript
server: {
  androidScheme: 'https',
  url: 'https://your-backend-url.com',  // Your production server
},
```

### Additional Resources

- **[MOBILE_QUICK_START.md](MOBILE_QUICK_START.md)** — Quick reference for mobile commands
- **[CAPACITOR_SETUP.md](CAPACITOR_SETUP.md)** — Detailed setup guide and troubleshooting

## ⚖️ Disclaimer

SASHFLIX is an open-source software project intended for educational and development purposes.

Movie and TV metadata is provided through third-party services such as TMDB. SASHFLIX does not claim ownership of third-party movies, TV shows, artwork, trademarks, or other copyrighted material.

Users are responsible for ensuring that their use and deployment of SASHFLIX comply with applicable laws and the terms of the services they use.

## 📄 License

SASHFLIX is licensed under the **MIT License**.

See [LICENSE](LICENSE) for the complete license text.

---

<div align="center">

### 🍿 SASHFLIX

**Discover something worth watching.**

Made by **Sashen**

</div>
