import { useListTodos } from "../hooks/useListTodos";

type Props = {
  token: string;
  onSelect?: (id: number) => void;
};

export function TodoList({ token, onSelect }: Props) {
  const { data: todos, loading, error, refetch } = useListTodos({}, token);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Todo 一覧</h2>
      <button onClick={refetch}>再読み込み</button>
      {todos.length === 0 ? (
        <p>Todoがありません</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id} onClick={() => onSelect?.(todo.id)} style={{ cursor: "pointer" }}>
              <strong>{todo.title}</strong> — {todo.body}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
