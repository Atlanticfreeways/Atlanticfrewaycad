# 🚀 Fastlane Setup Guide

## Prerequisites
1. **Ruby**: `brew install ruby`
2. **Fastlane**: `gem install fastlane`

## Android Setup
1. **Google Credentials**:
   - Go to Google Play Console > Setup > API Access.
   - Create a service account and download the JSON key.
   - Save as `mobile/android/json_key.json`.
2. **Package Name**: Ensure `app.json` package matches Play Console.

## iOS Setup
1. **Apple ID**:
   - Ensure you are logged in to Xcode.
   - Run `fastlane request_api_key` if CI/CD is needed.
2. **App Store Connect**:
   - Create the app placeholder in App Store Connect.
   - Bundle ID should match `app.json`.

## Generating Screenshots
To automatically generate screenshots:
1. Run server locally: `npm run dev`
2. Run snapshot:
   ```bash
   cd mobile
   fastlane ios screenshots
   ```
   *(Note: Requires native iOS project generation via `npx expo prebuild`)*

## Deploying Beta
```bash
cd mobile
fastlane ios beta
```
