const jwt = require('jsonwebtoken');

module.exports = {
    verifyToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if(token == null) {
            return res.status(401).json({
                status: 401,
                msg: 'Unauthorized.',
                errors: [
                    {
                        'message': 'Unautorized Access.'
                    }
                ],
            });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if(err) {
                return res.status(401).json({
                    status: 401,
                    msg: 'Unauthorized.',
                    errors: [
                        {
                            'message': 'Unautorized Access.'
                        }
                    ],
                });
            }

            req.email = decoded.email;
            next();
        })
    }
}