import React from "react";

export default function TodoItem({ todo, toggleTodo, deleteTodo }) {
  return (
    <li
      style={{
        margin: "10px 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span
        onClick={() => toggleTodo(todo.id)}
        style={{
          cursor: "pointer",
          textDecoration: todo.completed ? "line-through" : "none",
        }}
      >
        {todo.text}
      </span>
      <button
        onClick={() => deleteTodo(todo.id)}
        style={{ marginLeft: "10px", padding: "4px 8px" }}
      >
        ❌
      </button>
    </li>
  );
}
