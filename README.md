
# Simplifi - AI Terms Simplifier

**Understand Any Contract in 10 Seconds**

Simplifi is an iOS app that uses AI to analyze contracts, subscriptions, privacy policies, and legal documents to uncover hidden risks, money traps, auto-renew clauses, and dangerous terms.

## 🚀 Features

- **📸 Instant Scanning**: Take a photo or upload an image of any contract
- **🤖 AI-Powered Analysis**: Advanced AI extracts and analyzes contract text
- **⚠️ Risk Detection**: Identifies hidden risks with severity levels (low, medium, high)
- **💰 Money Trap Alerts**: Highlights unexpected fees and charges
- **🔄 Auto-Renew Detection**: Warns about automatic renewal clauses
- **⚖️ Legal Impact Assessment**: Explains dangerous clauses in plain language
- **📊 Visual Reports**: Beautiful charts and safety scores
- **🎨 Premium Design**: Sophisticated dark theme with vibrant orange accents

## 📱 App Store Readiness Checklist

### ✅ Completed

- [x] App.json properly configured with bundle identifiers
- [x] Privacy permission descriptions added (Camera, Photo Library)
- [x] Cross-platform shadow styles (iOS, Android, Web)
- [x] Error handling with user-friendly modals
- [x] Comprehensive logging for debugging
- [x] Backend API integration complete
- [x] Premium UI with smooth animations
- [x] Responsive design for all screen sizes
- [x] Dark mode support
- [x] Proper icon and splash screen configuration
- [x] EAS build configuration

### 📋 Before Submission

1. **Update Bundle Identifier**: Change `com.simplifi.app` in `app.json` to your actual bundle ID
2. **Add App Icons**: Ensure all required icon sizes are in `assets/images/`
3. **Test on Physical Device**: Test camera and photo library permissions
4. **Privacy Policy**: Create and host a privacy policy URL
5. **App Store Screenshots**: Capture screenshots for all required device sizes
6. **App Store Description**: Write compelling app description
7. **Keywords**: Choose relevant App Store keywords
8. **Age Rating**: Determine appropriate age rating
9. **EAS Configuration**: Update `eas.json` with your Apple Developer credentials

## 🛠️ Development

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

```bash
npm install
```

### Running the App

```bash
# Development with Expo Go
npm run dev

# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web
npm run web
```

### Building for Production

```bash
# iOS Build (requires EAS account)
eas build --platform ios --profile production

# Android Build
eas build --platform android --profile production
```

## 🏗️ Architecture

- **Frontend**: React Native + Expo 54
- **Navigation**: Expo Router (file-based routing)
- **Styling**: StyleSheet with cross-platform shadow support
- **Animations**: React Native Reanimated
- **Backend**: Specular API with AI analysis
- **State Management**: React Hooks (useState, useEffect)

## 📂 Project Structure

```
app/
├── (tabs)/
│   ├── (home)/
│   │   ├── index.tsx          # Main home screen
│   │   └── index.ios.tsx      # iOS-specific home screen
│   ├── _layout.tsx            # Tab layout
│   └── _layout.ios.tsx        # iOS-specific tab layout
├── _layout.tsx                # Root layout
└── +not-found.tsx             # 404 page

components/
├── ui/
│   └── Modal.tsx              # Custom modal component
├── BarChart.tsx               # Animated bar chart
├── GradientCard.tsx           # Gradient card component
├── ProgressRing.tsx           # Circular progress indicator
└── IconSymbol.tsx             # Cross-platform icons

utils/
└── api.ts                     # API client for backend

styles/
└── commonStyles.ts            # Shared colors and styles
```

## 🎨 Design System

### Colors

- **Primary**: `#FF6B35` (Vibrant Orange)
- **Accent**: `#FFB800` (Gold)
- **Background**: `#0A0E1A` (Deep Navy Black)
- **Card**: `#1A1F2E` (Dark Card)
- **Text**: `#FFFFFF` (White)
- **Success**: `#10B981` (Green)
- **Warning**: `#FFB800` (Gold)
- **Danger**: `#EF4444` (Red)

### Typography

- **Hero Title**: 32px, Weight 800
- **Section Title**: 22px, Weight 700
- **Body**: 15-16px, Weight 400-600
- **Button**: 17-18px, Weight 700

## 🔒 Privacy & Permissions

The app requests the following permissions:

- **Camera**: To scan contracts by taking photos
- **Photo Library**: To analyze contract images from your library

All analysis is performed securely via our backend API. No data is stored locally on your device.

## 🐛 Debugging

### Frontend Logs

The app includes comprehensive logging:
- `[User Action]` - User interactions
- `[Permission]` - Permission requests/results
- `[Analysis]` - Contract analysis progress
- `[API]` - Backend API calls

### Common Issues

1. **Camera not working**: Check permissions in Settings > Simplifi
2. **Analysis fails**: Ensure internet connection and backend is running
3. **Styles not rendering**: Clear Metro bundler cache: `expo start -c`

## 📄 License

Copyright © 2024 Simplifi. All rights reserved.

## 🤝 Support

For support, email support@simplifi.app or open an issue in the repository.

---

**Ready for App Store Submission! 🎉**

Verified API endpoints, file links, and cross-platform compatibility.
