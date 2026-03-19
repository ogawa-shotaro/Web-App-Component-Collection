// ============================================================
// 練習: TodoRepository の findById メソッドを実装する
// ============================================================
// 参考: src/repositories/TodoRepository.ts
// ============================================================

import { PrismaClient } from "@prisma/client";
import { ITodoRepository } from "../../src/repositories/ITodoRepository";
import { Todo, TodoFindParams } from "../../src/types/todo";
import { NotFoundError } from "../../src/errors";

const prisma = new PrismaClient();

export class TodoRepository implements ITodoRepository {
  async findById({ todoId, userId }: TodoFindParams): Promise<Todo> {
    // TODO: prisma.todo.findUnique() で id と userId を条件にして取得する

    // TODO: 取得結果が null の場合は NotFoundError を投げる

    // TODO: todo を返す
  }

  // ── 他のメソッドは今回の練習対象外 ──
  async save(): Promise<any> { throw new Error("Not implemented"); }
  async list(): Promise<any> { throw new Error("Not implemented"); }
  async update(): Promise<any> { throw new Error("Not implemented"); }
  async remove(): Promise<any> { throw new Error("Not implemented"); }
}
