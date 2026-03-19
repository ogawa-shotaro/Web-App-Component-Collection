// ============================================================
// 練習: TodoRepository の save メソッドを実装する
// ============================================================
// 参考: src/repositories/TodoRepository.ts
// ============================================================

import { PrismaClient } from "@prisma/client";
import { ITodoRepository } from "../../src/repositories/ITodoRepository";
import { Todo, TodoInput } from "../../src/types/todo";

const prisma = new PrismaClient();

export class TodoRepository implements ITodoRepository {
  async save(input: TodoInput): Promise<Todo> {
    // TODO: prisma.todo.create() を使ってtodoを作成し、returnする
    //       data には title, body, user(connect)を渡す
  }

  // ── 他のメソッドは今回の練習対象外 ──
  async list(): Promise<any> { throw new Error("Not implemented"); }
  async findById(): Promise<any> { throw new Error("Not implemented"); }
  async update(): Promise<any> { throw new Error("Not implemented"); }
  async remove(): Promise<any> { throw new Error("Not implemented"); }
}
