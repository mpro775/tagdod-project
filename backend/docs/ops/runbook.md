# Operations Runbook

## Disaster Recovery (DR) Procedures

### MongoDB Backup and Restore

This document outlines the procedures for backing up and restoring MongoDB databases in the Tagadodo project.

## Prerequisites

1. **MongoDB Tools**: Ensure `mongodump` and `mongorestore` are installed
2. **Environment Variables**: Set `MONGO_URI` environment variable
3. **Permissions**: Ensure the user has read/write access to the backup directory

## Backup Procedures

### Manual Backup

```bash
# Set the MongoDB URI
export MONGO_URI="mongodb://username:password@host:port/database"

# Run the backup script
cd backend
./scripts/backup_mongo.sh

# Or with custom name
./scripts/backup_mongo.sh "backup_2024_01_15"
```

### Automated Backup (Cron Job)

Add to crontab for daily backups at 2 AM:

```bash
# Edit crontab
crontab -e

# Add this line for daily backups
0 2 * * * cd /path/to/tagadodo-project/backend && ./scripts/backup_mongo.sh >> /var/log/mongo_backup.log 2>&1
```

### Backup Verification

After each backup, verify the backup integrity:

```bash
# Check backup directory
ls -la backend/backups/mongo/

# Verify backup contents
ls -la backend/backups/mongo/latest/

# Check backup success marker
cat backend/backups/mongo/latest/.backup_success
```

## Restore Procedures

### Emergency Restore

⚠️ **WARNING**: This will DROP the current database and replace it with backup data.

```bash
# Set the MongoDB URI
export MONGO_URI="mongodb://username:password@host:port/database"

# List available backups
ls -la backend/backups/mongo/

# Restore from latest successful backup
cd backend
./scripts/restore_mongo.sh LAST_OK_SNAPSHOT --confirm

# Or restore from specific backup
./scripts/restore_mongo.sh "backup_2024_01_15" --confirm
```

### Test Restore (Safe Testing)

For testing purposes, restore to a different database:

```bash
# Set URI to test database
export MONGO_URI="mongodb://username:password@host:port/test_database"

# Restore to test database
./scripts/restore_mongo.sh "backup_2024_01_15" --confirm
```

## Backup Management

### Backup Retention Policy

- **Daily backups**: Keep for 30 days
- **Weekly backups**: Keep for 12 weeks  
- **Monthly backups**: Keep for 12 months

### Cleanup Old Backups

```bash
# Manual cleanup (remove backups older than 7 days)
find backend/backups/mongo -maxdepth 1 -type d -name "20*" -mtime +7 -exec rm -rf {} \;

# List current backups
ls -la backend/backups/mongo/
```

### Backup Monitoring

Monitor backup success:

```bash
# Check latest backup
ls -la backend/backups/mongo/latest/

# Check backup success marker
cat backend/backups/mongo/LAST_OK_SNAPSHOT

# Verify backup integrity
mongodump --uri "$MONGO_URI" --dryRun
```

## Disaster Recovery Scenarios

### Scenario 1: Database Corruption

1. **Identify the issue**:
   ```bash
   # Check database health
   mongosh --uri "$MONGO_URI" --eval "db.stats()"
   ```

2. **Stop the application**:
   ```bash
   # Stop the Node.js application
   pkill -f "node.*main.js"
   ```

3. **Restore from backup**:
   ```bash
   cd backend
   ./scripts/restore_mongo.sh LAST_OK_SNAPSHOT --confirm
   ```

4. **Verify restore**:
   ```bash
   # Check database collections
   mongosh --uri "$MONGO_URI" --eval "show collections"
   ```

5. **Restart application**:
   ```bash
   npm start
   ```

### Scenario 2: Complete Server Failure

1. **Provision new server**
2. **Install MongoDB and restore data**:
   ```bash
   # Copy backup files to new server
   scp -r backend/backups/mongo/ new-server:/path/to/backend/backups/
   
   # Restore database
   cd backend
   ./scripts/restore_mongo.sh LAST_OK_SNAPSHOT --confirm
   ```

3. **Update application configuration**
4. **Restart services**

### Scenario 3: Partial Data Loss

1. **Identify affected collections**
2. **Restore specific collections**:
   ```bash
   # Restore specific collection
   mongorestore --uri "$MONGO_URI" --collection users backend/backups/mongo/latest/database/users.bson
   ```

## Monitoring and Alerting

### Backup Success Monitoring

Set up monitoring for backup success:

```bash
# Check if backup completed successfully
if [ -f "backend/backups/mongo/latest/.backup_success" ]; then
    echo "Backup successful"
else
    echo "Backup failed or incomplete"
    # Send alert
fi
```

### Disk Space Monitoring

Monitor backup disk usage:

```bash
# Check backup directory size
du -sh backend/backups/mongo/

# Check available disk space
df -h
```

## Troubleshooting

### Common Issues

1. **Permission Denied**:
   ```bash
   chmod +x backend/scripts/backup_mongo.sh
   chmod +x backend/scripts/restore_mongo.sh
   ```

2. **MongoDB Tools Not Found**:
   ```bash
   # Install MongoDB tools
   # Ubuntu/Debian:
   sudo apt-get install mongodb-database-tools
   
   # CentOS/RHEL:
   sudo yum install mongodb-database-tools
   ```

3. **Connection Issues**:
   ```bash
   # Test MongoDB connection
   mongosh --uri "$MONGO_URI" --eval "db.adminCommand('ping')"
   ```

4. **Backup Directory Full**:
   ```bash
   # Clean up old backups
   find backend/backups/mongo -maxdepth 1 -type d -name "20*" -mtime +7 -exec rm -rf {} \;
   ```

### Log Analysis

Check backup logs:

```bash
# View backup logs
tail -f /var/log/mongo_backup.log

# Check for errors
grep -i error /var/log/mongo_backup.log
```

## Security Considerations

1. **Secure Backup Storage**: Store backups in encrypted storage
2. **Access Control**: Limit access to backup files
3. **Network Security**: Use secure connections for remote backups
4. **Backup Encryption**: Consider encrypting backup files

```bash
# Encrypt backup files
gpg --symmetric --cipher-algo AES256 backend/backups/mongo/backup_name/

# Decrypt when needed
gpg --decrypt backup_name.gpg | tar -xzf -
```

## Recovery Time Objectives (RTO)

- **RTO**: 4 hours maximum
- **Recovery Point Objective (RPO)**: 24 hours maximum data loss
- **Backup Frequency**: Daily automated backups
- **Test Restore**: Monthly restore testing

## Contact Information

- **Primary DBA**: [Contact Information]
- **Secondary DBA**: [Contact Information]
- **Emergency Contact**: [Contact Information]

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2024-01-15 | 1.0 | Initial runbook creation |
| | | Added backup and restore procedures |
| | | Added disaster recovery scenarios |
