// examples/todo-app.flux
// Todo application demonstrating advanced Flux features

store TodoStore {
  state todos = []
  state filter = "all"
  state loading = false
  
  action addTodo(text) {
    const todo = {
      id: Date.now(),
      text: text,
      completed: false,
      createdAt: new Date()
    }
    todos = [...todos, todo]
  }
  
  action toggleTodo(id) {
    todos = todos.map(todo => 
      todo.id === id 
        ? { ...todo, completed: !todo.completed }
        : todo
    )
  }
  
  action deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id)
  }
  
  action setFilter(newFilter) {
    filter = newFilter
  }
  
  action clearCompleted() {
    todos = todos.filter(todo => !todo.completed)
  }
  
  computed filteredTodos() {
    switch (filter) {
      case "active":
        return todos.filter(todo => !todo.completed)
      case "completed":
        return todos.filter(todo => todo.completed)
      default:
        return todos
    }
  }
  
  computed activeCount() {
    return todos.filter(todo => !todo.completed).length
  }
  
  computed completedCount() {
    return todos.filter(todo => todo.completed).length
  }
  
  computed totalCount() {
    return todos.length
  }
}

component TodoApp {
  use TodoStore
  
  state newTodoText = ""
  
  method handleSubmit(e) {
    e.preventDefault()
    if (newTodoText.trim()) {
      TodoStore.addTodo(newTodoText.trim())
      newTodoText = ""
    }
  }
  
  method handleKeyPress(e) {
    if (e.key === "Enter") {
      handleSubmit(e)
    }
  }
  
  render {
    <div class="todo-app">
      <header class="header">
        <h1>Flux Todo App</h1>
        <p>Built with the Flux programming language</p>
      </header>
      
      <main class="main">
        <form class="todo-form" @submit={handleSubmit}>
          <input
            type="text"
            class="todo-input"
            placeholder="What needs to be done?"
            value={newTodoText}
            @input={(e) => newTodoText = e.target.value}
            @keypress={handleKeyPress}
          />
          <button type="submit" class="add-button">
            Add Todo
          </button>
        </form>
        
        <TodoList />
        <TodoFilters />
        <TodoStats />
      </main>
    </div>
  }
}

styles TodoApp {
  .todo-app {
    max-width: 600px
    margin: 0 auto
    padding: 2rem
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
    
    .header {
      text-align: center
      margin-bottom: 2rem
      
      h1 {
        color: #2c3e50
        margin: 0 0 0.5rem 0
        font-size: 2.5rem
      }
      
      p {
        color: #7f8c8d
        margin: 0
        font-size: 1.1rem
      }
    }
    
    .main {
      background: white
      border-radius: 12px
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1)
      overflow: hidden
    }
    
    .todo-form {
      display: flex
      padding: 1.5rem
      border-bottom: 1px solid #eee
      
      .todo-input {
        flex: 1
        padding: 0.75rem 1rem
        border: 2px solid #ddd
        border-radius: 6px
        font-size: 1rem
        margin-right: 1rem
        transition: border-color 0.2s
        
        &:focus {
          outline: none
          border-color: #3498db
        }
      }
      
      .add-button {
        padding: 0.75rem 1.5rem
        border: none
        border-radius: 6px
        background: linear-gradient(45deg, #27ae60, #2ecc71)
        color: white
        cursor: pointer
        font-size: 1rem
        font-weight: 500
        transition: transform 0.2s, box-shadow 0.2s
        
        &:hover {
          transform: translateY(-1px)
          box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3)
        }
        
        &:active {
          transform: translateY(0)
        }
      }
    }
  }
}

component TodoList {
  use TodoStore
  
  render {
    <div class="todo-list">
      {TodoStore.filteredTodos.length === 0 ? (
        <div class="empty-state">
          <p>No todos found</p>
          <small>Add a new todo to get started!</small>
        </div>
      ) : (
        TodoStore.filteredTodos.map(todo => (
          <TodoItem key={todo.id} todo={todo} />
        ))
      )}
    </div>
  }
}

styles TodoList {
  .todo-list {
    .empty-state {
      text-align: center
      padding: 3rem 1.5rem
      color: #7f8c8d
      
      p {
        margin: 0 0 0.5rem 0
        font-size: 1.1rem
      }
      
      small {
        font-size: 0.9rem
      }
    }
  }
}

component TodoItem {
  prop todo: Todo
  
  use TodoStore
  
  method handleToggle() {
    TodoStore.toggleTodo(todo.id)
  }
  
  method handleDelete() {
    TodoStore.deleteTodo(todo.id)
  }
  
  render {
    <div class="todo-item" ?completed={todo.completed}>
      <div class="todo-content">
        <input
          type="checkbox"
          class="todo-checkbox"
          checked={todo.completed}
          @change={handleToggle}
        />
        <span class="todo-text">{todo.text}</span>
        <span class="todo-date">
          {todo.createdAt.toLocaleDateString()}
        </span>
      </div>
      
      <button 
        class="delete-button"
        @click={handleDelete}
        title="Delete todo"
      >
        ×
      </button>
    </div>
  }
}

styles TodoItem {
  .todo-item {
    display: flex
    align-items: center
    padding: 1rem 1.5rem
    border-bottom: 1px solid #f0f0f0
    transition: background-color 0.2s
    
    &:hover {
      background: #f8f9fa
    }
    
    &:last-child {
      border-bottom: none
    }
    
    &.completed {
      .todo-text {
        text-decoration: line-through
        color: #7f8c8d
      }
      
      .todo-checkbox {
        background: #27ae60
        border-color: #27ae60
      }
    }
    
    .todo-content {
      flex: 1
      display: flex
      align-items: center
      gap: 1rem
      
      .todo-checkbox {
        width: 18px
        height: 18px
        border: 2px solid #ddd
        border-radius: 4px
        cursor: pointer
        transition: all 0.2s
        
        &:checked {
          background: #27ae60
          border-color: #27ae60
        }
      }
      
      .todo-text {
        flex: 1
        font-size: 1rem
        color: #2c3e50
        transition: color 0.2s
      }
      
      .todo-date {
        font-size: 0.8rem
        color: #95a5a6
      }
    }
    
    .delete-button {
      background: none
      border: none
      color: #e74c3c
      font-size: 1.5rem
      cursor: pointer
      padding: 0.25rem 0.5rem
      border-radius: 4px
      transition: background-color 0.2s
      
      &:hover {
        background: #fdf2f2
      }
    }
  }
}

component TodoFilters {
  use TodoStore
  
  render {
    <div class="todo-filters">
      <div class="filter-buttons">
        <button
          class="filter-button"
          ?active={TodoStore.filter === "all"}
          @click={() => TodoStore.setFilter("all")}
        >
          All ({TodoStore.totalCount})
        </button>
        <button
          class="filter-button"
          ?active={TodoStore.filter === "active"}
          @click={() => TodoStore.setFilter("active")}
        >
          Active ({TodoStore.activeCount})
        </button>
        <button
          class="filter-button"
          ?active={TodoStore.filter === "completed"}
          @click={() => TodoStore.setFilter("completed")}
        >
          Completed ({TodoStore.completedCount})
        </button>
      </div>
      
      {TodoStore.completedCount > 0 && (
        <button
          class="clear-button"
          @click={() => TodoStore.clearCompleted()}
        >
          Clear completed
        </button>
      )}
    </div>
  }
}

styles TodoFilters {
  .todo-filters {
    display: flex
    justify-content: space-between
    align-items: center
    padding: 1rem 1.5rem
    border-top: 1px solid #eee
    background: #f8f9fa
    
    .filter-buttons {
      display: flex
      gap: 0.5rem
      
      .filter-button {
        padding: 0.5rem 1rem
        border: 1px solid #ddd
        border-radius: 4px
        background: white
        color: #495057
        cursor: pointer
        font-size: 0.9rem
        transition: all 0.2s
        
        &:hover {
          border-color: #3498db
          color: #3498db
        }
        
        &.active {
          background: #3498db
          border-color: #3498db
          color: white
        }
      }
    }
    
    .clear-button {
      padding: 0.5rem 1rem
      border: 1px solid #e74c3c
      border-radius: 4px
      background: white
      color: #e74c3c
      cursor: pointer
      font-size: 0.9rem
      transition: all 0.2s
      
      &:hover {
        background: #e74c3c
        color: white
      }
    }
  }
}

component TodoStats {
  use TodoStore
  
  render {
    <div class="todo-stats">
      <div class="stat">
        <span class="stat-label">Total:</span>
        <span class="stat-value">{TodoStore.totalCount}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Active:</span>
        <span class="stat-value active">{TodoStore.activeCount}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Completed:</span>
        <span class="stat-value completed">{TodoStore.completedCount}</span>
      </div>
    </div>
  }
}

styles TodoStats {
  .todo-stats {
    display: flex
    justify-content: space-around
    padding: 1rem 1.5rem
    background: #f1f3f4
    border-top: 1px solid #eee
    
    .stat {
      text-align: center
      
      .stat-label {
        display: block
        font-size: 0.8rem
        color: #7f8c8d
        margin-bottom: 0.25rem
        text-transform: uppercase
        letter-spacing: 0.5px
      }
      
      .stat-value {
        display: block
        font-size: 1.5rem
        font-weight: bold
        color: #2c3e50
        
        &.active {
          color: #3498db
        }
        
        &.completed {
          color: #27ae60
        }
      }
    }
  }
}

// Mount the app
mount(TodoApp, '#root')