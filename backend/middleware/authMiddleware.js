import jwt from 'jsonwebtoken';

const authMiddleware =  (req, res, next) => {
    try {
        // Pega o token do cabeçalho Authorization (formato: Bearer <token>)
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ error: 'Token not provided' });
        }

        const tokenParts = authHeader.split(' ');
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            return res.status(400).json({ error: 'Invalid token format' });
        }

        const token = tokenParts[1];

        // Verifica e decodifica o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Anexa os dados do usuário ao request para uso posterior
        req.user = decoded;

        // Continua para a próxima função/middleware
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        return res.status(500).json({ error: 'Internal error in authentication' });
    }
};

export default authMiddleware;