import { Injectable } from '@angular/core';
import { Todo } from '../model/todo.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  todos: Todo[] = [];

  addTodoItem(title: string, description?: string): void {
    const newTodo: Todo = {
      id: uuidv4(),
      completed: false,
      title,
      description,
    };
    this.todos.push(newTodo);
  }

  getTodoItems(): Todo[] {
    return [...this.todos];
  }

  updateTodoItem(
    id: string,
    title?: string,
    description?: string,
    completed?: boolean,
  ): void {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) {
      if (title !== undefined) todo.title = title;
      if (description !== undefined) todo.description = description;
      if (completed !== undefined) todo.completed = completed;
    }
  }

  deleteTodoItem(id: string): void {
    this.todos = this.todos.filter((t) => t.id !== id);
  }
}
