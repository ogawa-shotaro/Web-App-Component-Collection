// ============================================================
// 練習: TodoRepository の remove メソッドを実装する
// ============================================================
// 参考: src/repositories/TodoRepository.ts
// ============================================================

import { PrismaClient, Prisma } from "@prisma/client";
import { ITodoRepository } from "../../src/repositories/ITodoRepository";
import { Todo, TodoDeleteParams } from "../../src/types/todo";
import { NotFoundError } from "../../src/errors";

const prisma = new PrismaClient();

export class TodoRepository implements ITodoRepository {
  async remove({ todoId, userId }: TodoDeleteParams): Promise<Todo> {
    try {
      // TODO: prisma.todo.delete() で id と userId を where 条件にして削除する

    } catch (error) {
      // TODO: P2025 の場合は NotFoundError を投げる（update と同じパターン）
      // TODO: それ以外は再スローする
    }
  }

  // ── 他のメソッドは今回の練習対象外 ──
  async save(): Promise<any> { throw new Error("Not implemented"); }
  async list(): Promise<any> { throw new Error("Not implemented"); }
  async findById(): Promise<any> { throw new Error("Not implemented"); }
  async update(): Promise<any> { throw new Error("Not implemented"); }
}
