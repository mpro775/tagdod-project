# Sharp Module Deployment Fix for Render

## Problem
The application was failing to deploy on Render with the error:
```
Error: Could not load the "sharp" module using the linuxmusl-x64 runtime
```

This error occurs because Sharp is a native Node.js module that requires platform-specific binaries. When deploying from Windows to a Linux-based container (Alpine Linux with musl libc), the binaries need to be compiled for the target platform.

## Solution Implemented

### 1. Updated Dockerfile (Runner Stage)
Added runtime dependencies for Sharp in the production runner stage:

```dockerfile
# Install runtime dependencies for sharp and other native modules
RUN apk add --no-cache \
    vips-dev \
    fftw-dev \
    gcc \
    g++ \
    make \
    libc6-compat
```

**Why this is needed:**
- `vips-dev`: libvips is the image processing library that Sharp uses
- `fftw-dev`: Fast Fourier Transform library (required by libvips)
- `gcc`, `g++`, `make`: Compilers and build tools for native modules
- `libc6-compat`: Compatibility layer for running binaries compiled with glibc on musl-based Alpine

### 2. Added Postinstall Script
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

### Alternative: If Issues Persist

If you still encounter issues, you can try these alternatives:

#### Option A: Use a Debian-based image instead of Alpine
Debian uses glibc which Sharp prefers. Replace `node:20-alpine` with `node:20-slim`:

```dockerfile
FROM node:20-slim AS runner
```

Then install runtime dependencies:
```dockerfile
RUN apt-get update && apt-get install -y \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*
```

#### Option B: Use Sharp's prebuilt binaries
Ensure the installation uses prebuilt binaries:
```bash
npm install --platform=linuxmusl --arch=x64 sharp
```

#### Option C: Set environment variables in Render
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

### Why Alpine Linux with musl?
- Alpine Linux is lightweight (smaller image size)
- Uses musl libc instead of glibc
- Sharp needs to compile native bindings for musl

### What the fix does:
1. **Build stage**: Compiles Sharp with the correct binaries for Alpine/musl
2. **Runtime stage**: Provides the necessary libraries for Sharp to run
3. **Postinstall hook**: Ensures Sharp is always rebuilt for the current platform

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

