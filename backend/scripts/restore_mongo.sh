#!/bin/bash

# MongoDB Restore Script
# This script restores a MongoDB database from a backup
# Usage: ./restore_mongo.sh [backup_name] [--confirm]

set -e  # Exit on any error

# Configuration
BACKUP_DIR="backups/mongo"
BACKUP_NAME=${1:-"LAST_OK_SNAPSHOT"}
CONFIRM_FLAG=$2

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if MongoDB URI is set
if [ -z "$MONGO_URI" ]; then
    error "MONGO_URI environment variable is not set"
    echo "Please set MONGO_URI before running this script"
    echo "Example: export MONGO_URI='mongodb://localhost:27017/your_database'"
    exit 1
fi

# Check if mongorestore is available
if ! command -v mongorestore &> /dev/null; then
    error "mongorestore command not found. Please install MongoDB tools."
    exit 1
fi

# Determine backup path
if [ "$BACKUP_NAME" = "LAST_OK_SNAPSHOT" ]; then
    if [ -f "$BACKUP_DIR/LAST_OK_SNAPSHOT" ]; then
        BACKUP_NAME=$(cat "$BACKUP_DIR/LAST_OK_SNAPSHOT")
        log "Using last successful snapshot: $BACKUP_NAME"
    else
        error "No LAST_OK_SNAPSHOT file found"
        exit 1
    fi
fi

BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

# Check if backup exists
if [ ! -d "$BACKUP_PATH" ]; then
    error "Backup directory not found: $BACKUP_PATH"
    echo "Available backups:"
    ls -la "$BACKUP_DIR" | grep "^d" | awk '{print $9}' | grep -v "^\.$\|^\.\.$" || echo "No backups found"
    exit 1
fi

# Check if backup is valid
if [ ! -f "$BACKUP_PATH/.backup_success" ]; then
    warning "No success marker found for backup: $BACKUP_PATH"
    warning "This backup may be incomplete or corrupted"
fi

# Safety confirmation
if [ "$CONFIRM_FLAG" != "--confirm" ]; then
    error "DANGER: This will DROP the current database and restore from backup!"
    echo ""
    info "Backup to restore: $BACKUP_PATH"
    info "Target database: ${MONGO_URI##*/}"
    echo ""
    warning "This operation will:"
    warning "1. DROP the current database"
    warning "2. Restore all data from the backup"
    warning "3. This action CANNOT be undone"
    echo ""
    echo "To proceed, run: $0 $BACKUP_NAME --confirm"
    exit 1
fi

log "Starting MongoDB restore..."
log "Backup source: $BACKUP_PATH"
log "Target database: ${MONGO_URI##*/}"

# Show backup info
if [ -f "$BACKUP_PATH/.backup_success" ]; then
    BACKUP_DATE=$(cat "$BACKUP_PATH/.backup_success")
    log "Backup created: $BACKUP_DATE"
fi

# Get backup size
BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
log "Backup size: $BACKUP_SIZE"

# Perform the restore
log "Restoring database..."
if mongorestore --uri "$MONGO_URI" --drop "$BACKUP_PATH"; then
    log "Database restore completed successfully!"
    
    # Verify the restore
    log "Verifying restore..."
    COLLECTION_COUNT=$(find "$BACKUP_PATH" -name "*.bson" | wc -l)
    log "Restored $COLLECTION_COUNT collections"
    
    log "Restore process completed successfully!"
    echo "Database has been restored from: $BACKUP_PATH"
    
else
    error "Restore failed!"
    exit 1
fi
