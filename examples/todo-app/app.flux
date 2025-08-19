// Todo Application - Demonstrating Flux Language Features
// This example showcases components, state management, routing, and styling

@route("/")
@meta({
  title: "Flux Todo App",
  description: "A modern todo application built with Flux language"
})
component TodoApp {
  use TodoStore
  
  render {
    <div class="todo-app">
      <Header />
      <main class="main-content">
        <TodoInput @add={this.addTodo} />
        <TodoFilters 
          filter={this.currentFilter}
          @change={this.setFilter}
        />
        <TodoList 
          todos={this.filteredTodos}
          @toggle={this.toggleTodo}
          @delete={this.deleteTodo}
          @edit={this.editTodo}
        />
        <TodoStats todos={this.todos} />
      </main>
      <Footer />
    </div>
  }
  
  computed filteredTodos() {
    switch (this.currentFilter) {
      case 'active':
        return this.todos.filter(todo => !todo.completed)
      case 'completed':
        return this.todos.filter(todo => todo.completed)
      default:
        return this.todos
    }
  }
  
  method addTodo(text) {
    TodoStore.addTodo(text)
  }
  
  method toggleTodo(id) {
    TodoStore.toggleTodo(id)
  }
  
  method deleteTodo(id) {
    TodoStore.deleteTodo(id)
  }
  
  method editTodo(id, text) {
    TodoStore.editTodo(id, text)
  }
  
  method setFilter(filter) {
    this.currentFilter = filter
  }
}

component Header {
  render {
    <header class="header">
      <div class="header-content">
        <h1 class="logo">
          <span class="logo-icon">🚀</span>
          Flux Todo
        </h1>
        <p class="tagline">Built with the Flux Language</p>
      </div>
    </header>
  }
}

component TodoInput {
  state inputValue = ""
  
  method handleSubmit(event) {
    event.preventDefault()
    if (this.inputValue.trim()) {
      this.emit('add', this.inputValue.trim())
      this.inputValue = ""
    }
  }
  
  method handleInput(event) {
    this.inputValue = event.target.value
  }
  
  render {
    <form class="todo-input" @submit={handleSubmit}>
      <input
        type="text"
        class="todo-input-field"
        placeholder="What needs to be done?"
        value={this.inputValue}
        @input={handleInput}
        autofocus
      />
      <button type="submit" class="todo-input-button">
        Add Todo
      </button>
    </form>
  }
}

component TodoFilters {
  prop filter: string
  prop onChange: function
  
  render {
    <div class="todo-filters">
      <button 
        class={`filter-btn ${this.filter === 'all' ? 'active' : ''}`}
        @click={() => this.onChange('all')}
      >
        All
      </button>
      <button 
        class={`filter-btn ${this.filter === 'active' ? 'active' : ''}`}
        @click={() => this.onChange('active')}
      >
        Active
      </button>
      <button 
        class={`filter-btn ${this.filter === 'completed' ? 'active' : ''}`}
        @click={() => this.onChange('completed')}
      >
        Completed
      </button>
    </div>
  }
}

component TodoList {
  prop todos: Todo[]
  prop onToggle: function
  prop onDelete: function
  prop onEdit: function
  
  render {
    <ul class="todo-list">
      {this.todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          @toggle={() => this.onToggle(todo.id)}
          @delete={() => this.onDelete(todo.id)}
          @edit={(text) => this.onEdit(todo.id, text)}
        />
      ))}
      {this.todos.length === 0 && (
        <li class="todo-empty">
          <p>No todos yet. Add one above!</p>
        </li>
      )}
    </ul>
  }
}

component TodoItem {
  prop todo: Todo
  prop onToggle: function
  prop onDelete: function
  prop onEdit: function
  
  state editing = false
  state editValue = ""
  
  method startEdit() {
    this.editing = true
    this.editValue = this.todo.text
  }
  
  method saveEdit() {
    if (this.editValue.trim()) {
      this.onEdit(this.editValue.trim())
      this.editing = false
    }
  }
  
  method cancelEdit() {
    this.editing = false
    this.editValue = this.todo.text
  }
  
  method handleKeyDown(event) {
    if (event.key === 'Enter') {
      this.saveEdit()
    } else if (event.key === 'Escape') {
      this.cancelEdit()
    }
  }
  
  render {
    <li class={`todo-item ${this.todo.completed ? 'completed' : ''}`}>
      <div class="todo-content">
        <input
          type="checkbox"
          class="todo-checkbox"
          checked={this.todo.completed}
          @change={this.onToggle}
        />
        
        {this.editing ? (
          <input
            type="text"
            class="todo-edit-input"
            value={this.editValue}
            @input={(e) => this.editValue = e.target.value}
            @keydown={this.handleKeyDown}
            @blur={this.saveEdit}
            autofocus
          />
        ) : (
          <span 
            class="todo-text"
            @dblclick={this.startEdit}
          >
            {this.todo.text}
          </span>
        )}
      </div>
      
      <div class="todo-actions">
        <button 
          class="todo-action-btn edit"
          @click={this.startEdit}
          title="Edit todo"
        >
          ✏️
        </button>
        <button 
          class="todo-action-btn delete"
          @click={this.onDelete}
          title="Delete todo"
        >
          🗑️
        </button>
      </div>
    </li>
  }
}

component TodoStats {
  prop todos: Todo[]
  
  computed stats() {
    const total = this.todos.length
    const completed = this.todos.filter(t => t.completed).length
    const active = total - completed
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return { total, completed, active, percentage }
  }
  
  render {
    <div class="todo-stats">
      <div class="stat-item">
        <span class="stat-label">Total:</span>
        <span class="stat-value">{this.stats.total}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Active:</span>
        <span class="stat-value">{this.stats.active}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Completed:</span>
        <span class="stat-value">{this.stats.completed}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Progress:</span>
        <span class="stat-value">{this.stats.percentage}%</span>
      </div>
    </div>
  }
}

component Footer {
  render {
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2024 Flux Todo App</p>
        <p>Built with ❤️ using the Flux Language</p>
      </div>
    </footer>
  }
}

// Store for managing todo state
store TodoStore {
  state todos = []
  state nextId = 1
  
  action addTodo(text) {
    const todo = {
      id: this.nextId++,
      text,
      completed: false,
      createdAt: new Date()
    }
    this.todos.push(todo)
  }
  
  action toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
    }
  }
  
  action deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id)
  }
  
  action editTodo(id, text) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      todo.text = text
      todo.updatedAt = new Date()
    }
  }
  
  action clearCompleted() {
    this.todos = this.todos.filter(t => !t.completed)
  }
  
  computed completedCount() {
    return this.todos.filter(t => t.completed).length
  }
  
  computed activeCount() {
    return this.todos.filter(t => !t.completed).length
  }
}

// Styling for the todo application
styles TodoApp {
  .todo-app {
    min-height: 100vh
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
  }
  
  .main-content {
    max-width: 600px
    margin: 0 auto
    padding: 20px
  }
}

styles Header {
  .header {
    background: rgba(255, 255, 255, 0.1)
    backdrop-filter: blur(10px)
    border-bottom: 1px solid rgba(255, 255, 255, 0.2)
    padding: 20px 0
    text-align: center
  }
  
  .header-content {
    max-width: 600px
    margin: 0 auto
    padding: 0 20px
  }
  
  .logo {
    color: white
    font-size: 2.5rem
    font-weight: 700
    margin: 0 0 10px 0
    display: flex
    align-items: center
    justify-content: center
    gap: 10px
  }
  
  .logo-icon {
    font-size: 3rem
  }
  
  .tagline {
    color: rgba(255, 255, 255, 0.8)
    font-size: 1.1rem
    margin: 0
  }
}

styles TodoInput {
  .todo-input {
    display: flex
    gap: 10px
    margin-bottom: 30px
  }
  
  .todo-input-field {
    flex: 1
    padding: 15px
    border: none
    border-radius: 8px
    font-size: 1rem
    background: rgba(255, 255, 255, 0.9)
    backdrop-filter: blur(10px)
    
    &:focus {
      outline: none
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3)
    }
  }
  
  .todo-input-button {
    padding: 15px 25px
    border: none
    border-radius: 8px
    background: linear-gradient(45deg, #ff6b6b, #ee5a24)
    color: white
    font-size: 1rem
    font-weight: 600
    cursor: pointer
    transition: all 0.3s ease
    
    &:hover {
      transform: translateY(-2px)
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2)
    }
  }
}

styles TodoFilters {
  .todo-filters {
    display: flex
    gap: 10px
    margin-bottom: 20px
    justify-content: center
  }
  
  .filter-btn {
    padding: 10px 20px
    border: 1px solid rgba(255, 255, 255, 0.3)
    border-radius: 20px
    background: rgba(255, 255, 255, 0.1)
    color: white
    cursor: pointer
    transition: all 0.3s ease
    
    &:hover {
      background: rgba(255, 255, 255, 0.2)
    }
    
    &.active {
      background: rgba(255, 255, 255, 0.9)
      color: #333
      border-color: rgba(255, 255, 255, 0.9)
    }
  }
}

styles TodoList {
  .todo-list {
    list-style: none
    padding: 0
    margin: 0 0 30px 0
  }
  
  .todo-empty {
    text-align: center
    color: rgba(255, 255, 255, 0.7)
    font-style: italic
    padding: 40px 20px
  }
}

styles TodoItem {
  .todo-item {
    display: flex
    align-items: center
    justify-content: space-between
    padding: 15px
    margin-bottom: 10px
    background: rgba(255, 255, 255, 0.9)
    backdrop-filter: blur(10px)
    border-radius: 8px
    transition: all 0.3s ease
    
    &:hover {
      transform: translateY(-2px)
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1)
    }
    
    &.completed {
      opacity: 0.7
      
      .todo-text {
        text-decoration: line-through
        color: #666
      }
    }
  }
  
  .todo-content {
    display: flex
    align-items: center
    gap: 15px
    flex: 1
  }
  
  .todo-checkbox {
    width: 20px
    height: 20px
    cursor: pointer
  }
  
  .todo-text {
    font-size: 1.1rem
    color: #333
    cursor: pointer
    user-select: none
  }
  
  .todo-edit-input {
    flex: 1
    padding: 8px 12px
    border: 2px solid #667eea
    border-radius: 4px
    font-size: 1.1rem
    
    &:focus {
      outline: none
      border-color: #764ba2
    }
  }
  
  .todo-actions {
    display: flex
    gap: 8px
  }
  
  .todo-action-btn {
    padding: 8px
    border: none
    border-radius: 4px
    background: transparent
    cursor: pointer
    font-size: 1.2rem
    transition: all 0.2s ease
    
    &:hover {
      background: rgba(0, 0, 0, 0.1)
    }
    
    &.edit:hover {
      background: rgba(255, 193, 7, 0.2)
    }
    
    &.delete:hover {
      background: rgba(220, 53, 69, 0.2)
    }
  }
}

styles TodoStats {
  .todo-stats {
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr))
    gap: 15px
    padding: 20px
    background: rgba(255, 255, 255, 0.1)
    backdrop-filter: blur(10px)
    border-radius: 8px
    text-align: center
  }
  
  .stat-item {
    display: flex
    flex-direction: column
    gap: 5px
  }
  
  .stat-label {
    color: rgba(255, 255, 255, 0.8)
    font-size: 0.9rem
    text-transform: uppercase
    letter-spacing: 0.5px
  }
  
  .stat-value {
    color: white
    font-size: 1.5rem
    font-weight: 700
  }
}

styles Footer {
  .footer {
    margin-top: 40px
    padding: 20px
    text-align: center
    color: rgba(255, 255, 255, 0.7)
  }
  
  .footer-content {
    max-width: 600px
    margin: 0 auto
  }
  
  .footer-content p {
    margin: 5px 0
  }
}

// Type definitions for better development experience
type Todo = {
  id: number
  text: string
  completed: boolean
  createdAt: Date
  updatedAt?: Date
}

// Mount the application
mount(TodoApp, '#root')