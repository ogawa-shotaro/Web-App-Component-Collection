import {
  Todo,
  TodoInput,
  TodoListParams,
  TodoFindParams,
  TodoUpdateParams,
  TodoDeleteParams,
} from "../types/todo";

// リポジトリのインターフェース（コントローラーはこれに依存する）
export interface ITodoRepository {
  save(input: TodoInput): Promise<Todo>;
  list(params: TodoListParams): Promise<{ items: Todo[]; total: number }>;
  findById(params: TodoFindParams): Promise<Todo>;
  update(params: TodoUpdateParams): Promise<Todo>;
  remove(params: TodoDeleteParams): Promise<Todo>;
}
