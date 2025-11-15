const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');
const SECURITY_LOG = path.join(LOG_DIR, 'security.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

class SecurityLogger {
    static log(event, details = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            event,
            ...details
        };

        // Console output in development
        if (process.env.NODE_ENV !== 'production') {
            console.warn('[SECURITY]', logEntry);
        }

        // File logging
        const logLine = JSON.stringify(logEntry) + '\n';
        fs.appendFileSync(SECURITY_LOG, logLine);

        // Rotate logs if too large (> 10MB)
        this.rotateLogsIfNeeded();
    }

    static rotateLogsIfNeeded() {
        try {
            const stats = fs.statSync(SECURITY_LOG);
            const maxSize = 10 * 1024 * 1024; // 10MB

            if (stats.size > maxSize) {
                const timestamp = Date.now();
                const archivePath = path.join(LOG_DIR, `security-${timestamp}.log`);
                fs.renameSync(SECURITY_LOG, archivePath);

                // Keep only last 5 archived logs
                const archives = fs.readdirSync(LOG_DIR)
                    .filter(f => f.startsWith('security-') && f.endsWith('.log'))
                    .sort()
                    .reverse();

                archives.slice(5).forEach(archive => {
                    fs.unlinkSync(path.join(LOG_DIR, archive));
                });
            }
        } catch (error) {
            // Log file doesn't exist yet, ignore
        }
    }

    static getRecentEvents(limit = 100) {
        try {
            const content = fs.readFileSync(SECURITY_LOG, 'utf-8');
            const lines = content.trim().split('\n');
            return lines.slice(-limit).map(line => JSON.parse(line));
        } catch (error) {
            return [];
        }
    }
}

module.exports = SecurityLogger;
