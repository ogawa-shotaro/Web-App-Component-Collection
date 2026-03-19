// ============================================================
// 練習: TodoRepository の update メソッドを実装する
// ============================================================
// 参考: src/repositories/TodoRepository.ts
// ============================================================

import { PrismaClient, Prisma } from "@prisma/client";
import { ITodoRepository } from "../../src/repositories/ITodoRepository";
import { Todo, TodoUpdateParams } from "../../src/types/todo";
import { NotFoundError } from "../../src/errors";

const prisma = new PrismaClient();

export class TodoRepository implements ITodoRepository {
  async update({ id, userId, title, body }: TodoUpdateParams): Promise<Todo> {
    try {
      // TODO: prisma.todo.update() で id と userId を where 条件にし、
      //       title と body を data として更新する
    } catch (error) {
      // TODO: Prisma.PrismaClientKnownRequestError かつ code === "P2025" の場合
      //       NotFoundError を投げる
      // TODO: それ以外は再スローする
    }
  }

  // ── 他のメソッドは今回の練習対象外 ──
  async save(): Promise<any> { throw new Error("Not implemented"); }
  async list(): Promise<any> { throw new Error("Not implemented"); }
  async findById(): Promise<any> { throw new Error("Not implemented"); }
  async remove(): Promise<any> { throw new Error("Not implemented"); }
}
