import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabaseClient'

/**
 * Extended Request interface with user information
 */
export interface AuthRequest extends Request {
    user?: {
        id: string
        email: string
    }
}

/**
 * Authentication middleware
 * Verifies Supabase JWT token from Authorization header
 * Attaches user information to request object
 * 
 * Usage:
 * app.post('/api/endpoint', authenticateUser, async (req: AuthRequest, res) => {
 *   const userId = req.user!.id
 *   // ... rest of endpoint logic
 * })
 */
export async function authenticateUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Missing or invalid authorization header',
            message: 'Please provide a valid Bearer token in the Authorization header'
        })
    }

    const token = authHeader.split(' ')[1]

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
            return res.status(401).json({
                error: 'Invalid or expired token',
                message: 'Your session has expired. Please log in again.'
            })
        }

        // Attach user info to request
        req.user = {
            id: user.id,
            email: user.email!,
        }

        next()
    } catch (error) {
        console.error('Auth middleware error:', error)
        return res.status(401).json({
            error: 'Authentication failed',
            message: 'An error occurred while verifying your authentication.'
        })
    }
}
