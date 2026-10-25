#!/usr/bin/env bash
# Release AAB + release APK + debug APK (test) derler ve release/ ile apk/ klasörlerine kopyalar.
# Kullanım: bash scripts/build-android-release.sh <debug-apk-adı-eki>   (örn. 18d)
set -e
cd "$(dirname "$0")/.."
TAG="${1:-dev}"
VERSION=$(grep -o 'versionName "[^"]*"' android/app/build.gradle | head -1 | sed 's/versionName "//;s/"//')
mkdir -p release apk

echo "== release web build"
VITE_ADMOB_RELEASE=1 MSYS_NO_PATHCONV=1 npx vite build --base ./ --outDir dist
npx cap sync android
(cd android && ./gradlew bundleRelease assembleRelease)
cp android/app/build/outputs/bundle/release/app-release.aab "release/NyxiaOnline-${VERSION}.aab"
cp android/app/build/outputs/apk/release/app-release.apk "release/NyxiaOnline-${VERSION}-release.apk"
echo releasedone

echo "== debug web build"
MSYS_NO_PATHCONV=1 npx vite build --base ./ --outDir dist
npx cap sync android
(cd android && ./gradlew assembleDebug)
cp android/app/build/outputs/apk/debug/app-debug.apk "apk/NyxiaOnline-build${TAG}-debug.apk"
echo debugdone
