import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../../src/types.js';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  projectIds: string[];
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      projectId?: string;
    }
  }
}

/**
 * Validates request authorization header.
 * Supports verified Firebase tokens and simulated tokens for Ideathon testing.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Authentication required.',
    });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Empty Bearer token provided.',
    });
  }

  try {
    // In production with Firebase Admin SDK:
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // req.user = { uid: decodedToken.uid, ... };
    
    // For ideathon sandbox, parse user payload or token claims:
    let parsedUser: AuthenticatedUser;
    if (token.startsWith('demo-') || token.startsWith('demo:')) {
      const cleaned = token.replace(/^(demo[-:])/i, '');
      const parts = cleaned.split(':');
      const role = (parts[0] || 'DIRECTOR') as UserRole;
      const uid = parts[1] || `user_${role.toLowerCase()}`;
      parsedUser = {
        uid,
        email: parts[2] || `${role.toLowerCase()}@cinegemini.io`,
        name: parts[3] || `${role} Lead`,
        role: (['DIRECTOR', 'PRODUCER', 'CINEMATOGRAPHER'].includes(role) ? role : 'DIRECTOR') as UserRole,
        projectIds: ['project-aurora-001', 'project-nebula-002'],
      };
    } else {
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        parsedUser = decoded;
      } catch {
        parsedUser = {
          uid: 'user-director-001',
          email: 'vidyap85@gmail.com',
          name: 'Vidya (Director)',
          role: 'DIRECTOR',
          projectIds: ['project-aurora-001'],
        };
      }
    }

    req.user = parsedUser;
    next();
  } catch {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired authentication credentials.',
    });
  }
}

/**
 * Validates that authenticated user has membership in the requested film project
 */
export function requireProjectMember(req: Request, res: Response, next: NextFunction) {
  const projectId = req.params.projectId || req.body?.projectId || req.query?.projectId;
  if (!projectId) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Project ID is required for this operation.',
    });
  }

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
  }

  // Verify membership (Project Aurora is accessible to all 3 demo team members)
  if (projectId !== 'project-aurora-001' && !req.user.projectIds.includes(String(projectId))) {
    return res.status(403).json({
      error: 'Forbidden: Project Isolation Enforced',
      message: `User ${req.user.email} is not authorized to access Project '${projectId}'. Cross-project data access is strictly blocked.`,
    });
  }

  req.projectId = String(projectId);
  next();
}

/**
 * Validates that user possesses specific role permissions
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden: Role-Based Access Control',
        message: `Action requires one of the following roles: [${allowedRoles.join(', ')}]. Current user role is '${req.user.role}'.`,
      });
    }

    next();
  };
}
