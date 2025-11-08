# Sharp Module Deployment Fix for Render

## Problem
The application was failing to deploy on Render with the error:
```
Error: Could not load the "sharp" module using the linuxmusl-x64 runtime
```

This error occurs because Sharp is a native Node.js module that requires platform-specific binaries. When deploying from Windows to a Linux-based container, the binaries need to be compiled for the target platform.

## Solution Implemented

### 1. Switched from Alpine to Debian
Changed all Docker stages from `node:20-alpine` to `node:20-slim` (Debian-based):

```dockerfile
# All stages now use Debian
FROM node:20-slim AS deps
FROM node:20-slim AS build
FROM node:20-slim AS runner
```

**Why Debian instead of Alpine:**
- Debian uses **glibc** which Sharp prefers over musl (used by Alpine)
- Better compatibility with native Node.js modules
- More reliable Sharp binaries
- Fewer cross-platform issues

### 2. Updated Dockerfile Dependencies
**Deps stage:**
```dockerfile
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    pkg-config \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*
```

**Runner stage:**
```dockerfile
RUN apt-get update && apt-get install -y \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*
```

**Why these packages:**
- `libvips-dev`: libvips is the image processing library that Sharp uses
- `python3`, `make`, `g++`: Build tools for compiling native modules
- `pkg-config`: Helps find installed libraries
- `rm -rf /var/lib/apt/lists/*`: Cleans up to reduce image size

### 3. Added Postinstall Script
Added to `package.json`:
```json
"postinstall": "npm rebuild sharp"
```

This ensures Sharp is rebuilt for the current platform whenever dependencies are installed.

## Deployment Steps

### For Render Deployment:

1. **Commit and push the changes:**
   ```bash
   git add backend/Dockerfile backend/package.json
   git commit -m "fix: Add Sharp runtime dependencies for Alpine Linux deployment"
   git push origin main
   ```

2. **Trigger a new deployment on Render:**
   - Render should automatically detect the changes and start a new deployment
   - Or manually trigger a deployment from the Render dashboard

3. **Monitor the deployment:**
   - Check the build logs to ensure Sharp is installed correctly
   - Look for successful Sharp installation/rebuild messages
   - Wait for the health check to pass

### Alternative: If Issues Still Persist

If you still encounter issues after deploying the Debian-based image, you can try:

#### Option A: Use Sharp's prebuilt binaries
Ensure the installation uses prebuilt binaries:
```bash
npm install --platform=linuxmusl --arch=x64 sharp
```

#### Option B: Set environment variables in Render
Add these environment variables in your Render service settings:
- `SHARP_IGNORE_GLOBAL_LIBVIPS=1`
- `npm_config_sharp_binary_host=https://github.com/lovell/sharp-libvips/releases/download`
- `npm_config_sharp_libvips_binary_host=https://github.com/lovell/sharp-libvips/releases/download`

## Verification

After successful deployment, verify Sharp is working:

1. Check the application logs for any Sharp-related errors
2. Test any image processing functionality in your application
3. Check the health endpoint: `https://your-app.onrender.com/health/live`

## Technical Details

### Why Debian (node:20-slim)?
- Debian uses **glibc** which is the standard C library on most Linux systems
- Sharp has better support for glibc-based systems
- More stable and reliable for native Node.js modules
- Image size is still reasonable (~180MB vs Alpine's ~120MB)

### What the fix does:
1. **Deps stage**: Installs libvips-dev and build tools for compiling Sharp
2. **Build stage**: Compiles the application with proper dependencies
3. **Runtime stage**: Provides only libvips-dev for Sharp to run
4. **Postinstall hook**: Ensures Sharp is always rebuilt for the current platform

## Troubleshooting

If you still see errors:

1. **Check Sharp version compatibility:**
   ```bash
   npm ls sharp
   ```

2. **Clear build cache on Render:**
   - Go to your Render service dashboard
   - Click "Manual Deploy" → "Clear build cache & deploy"

3. **Verify node_modules are not cached incorrectly:**
   - Make sure `.dockerignore` excludes `node_modules` (already done)

4. **Check Render service settings:**
   - Ensure you're using Docker deployment
   - Verify the Dockerfile path is correct: `backend/Dockerfile`

## Additional Resources

- [Sharp Installation Documentation](https://sharp.pixelplumbing.com/install)
- [Sharp in Docker](https://sharp.pixelplumbing.com/install#docker)
- [Render Docker Deployment Guide](https://render.com/docs/docker)

## Changes Made

### Files Modified:
1. `backend/Dockerfile` - Added runtime dependencies in runner stage
2. `backend/package.json` - Added postinstall script
3. `backend/DEPLOYMENT_SHARP_FIX.md` - This documentation file

### No Changes Needed:
- `.dockerignore` - Already properly configured
- Deployment configuration - Should work with existing Render settings

