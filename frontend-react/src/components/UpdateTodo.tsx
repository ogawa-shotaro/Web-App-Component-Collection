import { useState } from "react";
import { useUpdateTodo } from "../hooks/useUpdateTodo";

type Props = {
  todoId: number;
  initialTitle?: string;
  initialBody?: string;
  token: string;
  onUpdated?: () => void;
};

export function UpdateTodo({ todoId, initialTitle = "", initialBody = "", token, onUpdated }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const { loading, error, execute } = useUpdateTodo(token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await execute(todoId, { title, body });
      onUpdated?.();
    } catch {
      // error は state から表示
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>編集</h2>
      <div>
        <label>タイトル</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label>本文</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} required />
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "送信中..." : "更新"}
      </button>
    </form>
  );
}
