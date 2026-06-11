import { Request, Response, NextFunction } from 'express';

type Role = 'Admin' | 'ProjectManager' | 'Collaborator';

export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      if (!allowedRoles.includes(user.role as Role)) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to perform this action',
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  };
};