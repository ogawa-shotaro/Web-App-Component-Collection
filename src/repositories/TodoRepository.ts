import { PrismaClient, Prisma } from "@prisma/client";
import { ITodoRepository } from "./ITodoRepository";
import {
  Todo,
  TodoInput,
  TodoListParams,
  TodoFindParams,
  TodoUpdateParams,
  TodoDeleteParams,
} from "../types/todo";
import { NotFoundError } from "../errors";

const prisma = new PrismaClient();

export class TodoRepository implements ITodoRepository {
  // ----------------------------------------
  // Create
  // ----------------------------------------
  async save(input: TodoInput): Promise<Todo> {
    return prisma.todo.create({
      data: {
        title: input.title,
        body: input.body,
        user: { connect: { id: input.userId } },
      },
    });
  }

  // ----------------------------------------
  // List（ページネーション付き）
  // ----------------------------------------
  async list({
    userId,
    page = 1,
    count = 10,
  }: TodoListParams): Promise<{ items: Todo[]; total: number }> {
    const skip = (page - 1) * count;

    const [items, total] = await Promise.all([
      prisma.todo.findMany({ where: { userId }, skip, take: count }),
      prisma.todo.count({ where: { userId } }),
    ]);

    return { items, total };
  }

  // ----------------------------------------
  // Find（1件取得）
  // ----------------------------------------
  async findById({ todoId, userId }: TodoFindParams): Promise<Todo> {
    const todo = await prisma.todo.findUnique({
      where: { id: todoId, userId },
    });

    if (!todo) throw new NotFoundError("Todoが見つかりませんでした");

    return todo;
  }

  // ----------------------------------------
  // Update
  // ----------------------------------------
  async update({ id, userId, title, body }: TodoUpdateParams): Promise<Todo> {
    try {
      return await prisma.todo.update({
        where: { id, userId },
        data: { title, body },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Todoが見つかりませんでした");
      }
      throw error;
    }
  }

  // ----------------------------------------
  // Delete
  // ----------------------------------------
  async remove({ todoId, userId }: TodoDeleteParams): Promise<Todo> {
    try {
      return await prisma.todo.delete({
        where: { id: todoId, userId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Todoが見つかりませんでした");
      }
      throw error;
    }
  }
}
