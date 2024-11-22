import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [description, setDescription] = useState('');

  const fetchTodos = async () => {
    try {
      const response = await axios.get('/api/todos');
      console.log('Fetched todos:', response.data); // Log the response
      setTodos(response.data);
    } catch (err) {
      console.error('Error fetching todos:', err.message);
    }
  };

  const addTodo = async () => {
    if (description.trim() === '') {
      alert('Todo description cannot be empty.');
      return;
    }
    try {
      const response = await axios.post('/api/todos', { description });
      setTodos([...todos, response.data]);
      setDescription('');
    } catch (err) {
      console.error('Error adding todo:', err.message);
    }
  };

  const deleteTodo = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this todo?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/todos/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err.message);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  if (!Array.isArray(todos)) {
    console.error('Todos is not an array:', todos);
    return <div>Error: Todos is not an array</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">To-Do List</h1>
      <div className="mb-4">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a new task"
          className="border p-2 rounded w-1/2"
        />
        <button
          onClick={addTodo}
          className="bg-blue-500 text-white p-2 rounded mt-2"
        >
          Add
        </button>
      </div>
      <ul className="list-disc pl-5">
        {todos.map((todo) => (
          <li key={todo.id} className="mb-2 flex justify-between items-center">
            <span>{todo.description}</span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="bg-red-500 text-white p-1 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;