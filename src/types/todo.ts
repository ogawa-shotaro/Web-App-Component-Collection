// ===== エンティティ =====

export type Todo = {
  id: number;
  title: string;
  body: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
};

// ===== 各操作の入力型 =====

export type TodoInput = {
  title: string;
  body: string;
  userId: number;
};

export type TodoListParams = {
  userId: number;
  page?: number;
  count?: number;
};

export type TodoFindParams = {
  todoId: number;
  userId: number;
};

export type TodoUpdateParams = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

export type TodoDeleteParams = {
  todoId: number;
  userId: number;
};
