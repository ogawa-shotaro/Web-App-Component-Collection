import { useFindTodo } from "../hooks/useFindTodo";

type Props = {
  todoId: number;
  token: string;
};

export function FindTodo({ todoId, token }: Props) {
  const { data: todo, loading, error } = useFindTodo(todoId, token);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!todo) return null;

  return (
    <div>
      <h2>Todo 詳細</h2>
      <p>ID: {todo.id}</p>
      <p>タイトル: {todo.title}</p>
      <p>本文: {todo.body}</p>
      <p>作成日: {new Date(todo.createdAt).toLocaleString()}</p>
    </div>
  );
}
