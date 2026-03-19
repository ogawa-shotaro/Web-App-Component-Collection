import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ITodoRepository } from "../repositories/ITodoRepository";
import { AuthenticatedRequest } from "../types/request";

export class CreateTodoController {
  constructor(private readonly repository: ITodoRepository) {}

  async execute(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { title, body } = req.body;
      const userId = req.user.id;

      const todo = await this.repository.save({ title, body, userId });

      res.status(StatusCodes.CREATED).json(todo);
    } catch (error) {
      next(error);
    }
  }
}
