import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { User } from '../models/User'

export interface AuthenticatedRequest extends Request {
    user?: any;
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    let token;

    if(req.cookies && req.cookies.token){
        token = req.cookies.token;
    }
    if(!token) {
        res.status(401).json({ message: 'Not authorized, no token found' });
        return;
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
        req.user = await User.findById(decoded.userId).select('-password');

        if(!req.user) {
            res.status(401).json({ message: 'User no longer exists'});
            return;
        }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: `Role (${req.user?.role}) is not allowed to access this resource`})
            return;
        }
        next();
    };
};