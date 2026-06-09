import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));

        res.status(400).json({
          errorCode: 400,
          message: "Validation failed",
          description: errors,
        });
        return;
      }

      res.status(500).json({
        errorCode: 500,
        message: "Internal server error",
        description: "An unexpected error occurred",
      });
    }
  };
};

export default validate;