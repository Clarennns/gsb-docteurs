const jwt = require('jsonwebtoken');
const fs = require('fs');

const PRIVATE_KEY = fs.readFileSync('private.pem', 'utf8');  // génère-les ci-dessous
const PUBLIC_KEY = fs.readFileSync('public.pem', 'utf8');
const JWT_EXPIRES_IN = '24h';

class JwtService {
    generateToken(claims) {
        return jwt.sign(claims, PRIVATE_KEY, {
            algorithm: 'RS256',
            expiresIn: JWT_EXPIRES_IN,
            issuer: 'gsb-api'
        });
    }

    validateToken(token) {
        try {
            jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] });
            return !this.isBlacklisted(token);
        } catch {
            return false;
        }
    }

    getClaims(token) {
        return jwt.decode(token);
    }

    isBlacklisted(token) {
        // Blacklist simple en mémoire (Redis prod)
        if (!global.jwtBlacklist) global.jwtBlacklist = new Set();
        return global.jwtBlacklist.has(token);
    }

    addToBlacklist(token) {
        global.jwtBlacklist.add(token);
        // Cleanup tokens expirés (simple cron toutes les h)
        setTimeout(() => global.jwtBlacklist.delete(token), 24 * 60 * 60 * 1000);
    }
}

module.exports = new JwtService();
