// ===== エンティティ =====

export type Todo = {
  id: number;
  title: string;
  body: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

// ===== 各操作の入力型 =====

export type TodoInput = {
  title: string;
  body: string;
};

export type TodoListParams = {
  page?: number;
  count?: number;
};

export type TodoUpdateInput = {
  title: string;
  body: string;
};
