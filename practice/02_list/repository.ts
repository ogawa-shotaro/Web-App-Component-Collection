// ============================================================
// 練習: TodoRepository の list メソッドを実装する
// ============================================================
// 参考: src/repositories/TodoRepository.ts
// ============================================================

import { PrismaClient } from "@prisma/client";
import { ITodoRepository } from "../../src/repositories/ITodoRepository";
import { Todo, TodoListParams } from "../../src/types/todo";

const prisma = new PrismaClient();

export class TodoRepository implements ITodoRepository {
  async list({
    userId,
    page = 1,
    count = 10,
  }: TodoListParams): Promise<{ items: Todo[]; total: number }> {
    // TODO: skip（オフセット）を計算する
    //       skip = (page - 1) * count

    // TODO: Promise.all で findMany と count を同時実行する
    //       findMany: where: { userId }, skip, take: count
    //       count: where: { userId }

    // TODO: { items, total } を返す
  }

  // ── 他のメソッドは今回の練習対象外 ──
  async save(): Promise<any> { throw new Error("Not implemented"); }
  async findById(): Promise<any> { throw new Error("Not implemented"); }
  async update(): Promise<any> { throw new Error("Not implemented"); }
  async remove(): Promise<any> { throw new Error("Not implemented"); }
}
