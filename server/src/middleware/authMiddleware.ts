import { Request, Response, NextFunction } from 'express'
import { CognitoJwtVerifier } from 'aws-jwt-verify'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: string
      }
    }
  }
}

function createVerifier() {
  const userPoolId = process.env.COGNITO_USER_POOL_ID
  const clientId = process.env.COGNITO_CLIENT_ID

  if (!userPoolId || !clientId) {
    throw new Error('COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID must be set')
  }

  return CognitoJwtVerifier.create({
    userPoolId,
    clientId,
    tokenUse: 'id',
  })
}

let verifier: ReturnType<typeof createVerifier> | undefined

export const authMiddleware = (allowedRules: string[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    try {
      verifier = verifier ?? createVerifier()
      const payload = await verifier.verify(token)
      const userRole = String(payload['custom:role'] ?? '')

      req.user = {
        id: payload.sub,
        role: userRole,
      }

      if (!allowedRules.includes(userRole.toLowerCase())) {
        res.status(403).json({ message: 'Access denied' })
        return
      }
    } catch (error) {
      console.error('Failed to verify token:', error)
      res.status(401).json({ message: 'Invalid token' })
      return
    }

    next()
  }
}
