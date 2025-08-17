// examples/hello-world.flux
// Simple Hello World example

component HelloWorld {
  state name = "Flux"
  state count = 0
  
  method updateName(newName) {
    name = newName
  }
  
  method increment() {
    count += 1
  }
  
  render {
    <div class="hello-world">
      <h1>Hello, {name}!</h1>
      <p>Welcome to the Flux programming language</p>
      
      <div class="counter">
        <p>Count: {count}</p>
        <button @click={increment}>Increment</button>
      </div>
      
      <div class="input-section">
        <input 
          type="text" 
          placeholder="Enter your name"
          @input={(e) => updateName(e.target.value)}
        />
      </div>
    </div>
  }
}

styles HelloWorld {
  .hello-world {
    text-align: center
    padding: 2rem
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
    
    h1 {
      color: #2c3e50
      margin-bottom: 1rem
      font-size: 2.5rem
    }
    
    p {
      color: #7f8c8d
      margin-bottom: 2rem
      font-size: 1.2rem
    }
    
    .counter {
      margin: 2rem 0
      padding: 1rem
      border: 1px solid #ddd
      border-radius: 8px
      background: #f8f9fa
      
      p {
        margin: 0 0 1rem 0
        font-size: 1.1rem
        color: #495057
      }
      
      button {
        padding: 0.75rem 1.5rem
        border: none
        border-radius: 6px
        background: linear-gradient(45deg, #3498db, #2980b9)
        color: white
        cursor: pointer
        font-size: 1rem
        transition: transform 0.2s, box-shadow 0.2s
        
        &:hover {
          transform: translateY(-2px)
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3)
        }
        
        &:active {
          transform: translateY(0)
        }
      }
    }
    
    .input-section {
      margin-top: 2rem
      
      input {
        padding: 0.75rem 1rem
        border: 2px solid #ddd
        border-radius: 6px
        font-size: 1rem
        width: 250px
        transition: border-color 0.2s
        
        &:focus {
          outline: none
          border-color: #3498db
        }
        
        &::placeholder {
          color: #adb5bd
        }
      }
    }
  }
}

// Mount the component
mount(HelloWorld, '#root')