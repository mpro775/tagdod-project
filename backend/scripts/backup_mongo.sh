#!/bin/bash

# MongoDB Backup Script
# This script creates a backup of the MongoDB database
# Usage: ./backup_mongo.sh [backup_name]

set -e  # Exit on any error

# Configuration
BACKUP_DIR="backups/mongo"
TIMESTAMP=$(date +%F_%H%M)
BACKUP_NAME=${1:-$TIMESTAMP}
FULL_BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if MongoDB URI is set
if [ -z "$MONGO_URI" ]; then
    error "MONGO_URI environment variable is not set"
    echo "Please set MONGO_URI before running this script"
    echo "Example: export MONGO_URI='mongodb://localhost:27017/your_database'"
    exit 1
fi

# Check if mongodump is available
if ! command -v mongodump &> /dev/null; then
    error "mongodump command not found. Please install MongoDB tools."
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log "Starting MongoDB backup..."
log "Backup destination: $FULL_BACKUP_PATH"
log "MongoDB URI: ${MONGO_URI%/*}***"  # Hide credentials

# Create the backup
log "Creating backup..."
if mongodump --uri "$MONGO_URI" --out "$FULL_BACKUP_PATH"; then
    log "Backup completed successfully!"
    
    # Get backup size
    BACKUP_SIZE=$(du -sh "$FULL_BACKUP_PATH" | cut -f1)
    log "Backup size: $BACKUP_SIZE"
    
    # Create a symlink to the latest backup
    LATEST_LINK="$BACKUP_DIR/latest"
    if [ -L "$LATEST_LINK" ]; then
        rm "$LATEST_LINK"
    fi
    ln -s "$BACKUP_NAME" "$LATEST_LINK"
    log "Created symlink: $LATEST_LINK -> $BACKUP_NAME"
    
    # Create a marker file for successful backup
    echo "$(date)" > "$FULL_BACKUP_PATH/.backup_success"
    echo "$BACKUP_NAME" > "$BACKUP_DIR/LAST_OK_SNAPSHOT"
    log "Marked backup as successful"
    
    # Optional: Clean up old backups (keep last 7 days)
    log "Cleaning up old backups (keeping last 7 days)..."
    find "$BACKUP_DIR" -maxdepth 1 -type d -name "20*" -mtime +7 -exec rm -rf {} \; 2>/dev/null || true
    
    log "Backup process completed successfully!"
    echo "Backup location: $FULL_BACKUP_PATH"
    
else
    error "Backup failed!"
    exit 1
fi
