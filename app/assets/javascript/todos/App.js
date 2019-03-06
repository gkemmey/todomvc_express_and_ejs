import React, { useState, useEffect } from 'react';
import { Route, Link, withRouter } from "react-router-dom";

const uuid = () => {
  // from: http://stackoverflow.com/a/2117523/1947079
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r&0x3 | 0x8);
    return v.toString(16);
  });
}

const talk = ({ path, method, body, credentials = "include" }) => {
  return fetch(path, { method: method,
                       credentials: credentials,
                       headers: { "Content-Type": "application/json",
                                  "Accept": "application/json" },
                       body: body ? JSON.stringify(body) : null })
}
const post = (path, body, options = {}) => {
  return talk({ path: path, body: body, method: "POST", ...options });
};
const patch = (path, body, options = {}) => {
  return talk({ path: path, body: body, method: "PATCH", ...options });
};
const get = (path, options = {}) => {
  return talk({ path: path, method: "GET", ...options });
};
const destroy = (path, body, options = {}) => {
  return talk({ path: path, body, method: "DELETE", ...options })
}

const NewTodo = ({ refresh, setFlash }) => {
  const [title, setTitle] = useState('')

  const createTodo = () => {
    return post("/", { todo: { title: title } }).
      then((res) => { return Promise.all([res.ok, res.json()]) }).
      then(([ok, json]) => {
        if (ok) { return refresh() }
        throw json
      }).
      catch((json) => {
        setFlash(json.flash)
      })
  }

  return (
    <input type="text" value={title}
                       onChange={(e) => { setTitle(e.target.value) }}
                       onKeyPress={(e) => {
                         if (e.key === "Enter") {
                           createTodo().then(() => { setTitle('') })
                         }
                       }}
                       id="new-todo"
                       placeholder="What needs to be done?"
                       autoFocus="autofocus"
                       autoComplete="off" />
  )
}

const Todo = ({ id, title, completed, refresh }) => {
  const [editing, setEditing] = useState(false)
  const [newTitle, setNewTitle] = useState(title)

  const updateTodo = (todo) => {
    return patch(`/${id}`, { todo: todo }).then((res) => { if (res.ok) { refresh() } })
  }

  const destroyTodo = () => {
    destroy(`/${id}`).then((res) => { if (res.ok) { refresh() }})
  }

  return (
    <li className={(editing && "editing") || (completed && "completed") || ""}
        onDoubleClick={() => { setEditing(true) }}>
      <div className="view">
        <input type="checkbox"
               className="toggle"
               value="1"
               checked={completed}
               onChange={(e) => { updateTodo({ completed: e.target.checked ? "1" : "0" }) }} />

        <label>{title}</label>
        <button className="destroy" onClick={destroyTodo} />
      </div>

      <input type="text"
             id="todo_title"
             className="edit"
             autoComplete="off"
             value={newTitle}
             onChange={(e) => { setNewTitle(e.target.value) }}
             onKeyDown={(e) => {
               if (e.keyCode === 27) {
                 setNewTitle(title)
                 setEditing(false)
               }
             }}
             onBlur={() => {
               if (editing && title !== newTitle) {
                 updateTodo({ title: newTitle }).then(() => { setEditing(false) })
               }
             }}
             ref={(input) => { input && input.focus()}} />
    </li>
  )
}

const Todos = ({ todos, refresh }) => {
  const updateAll = (todo) => {
    patch(`/update_many`, { ids: todos.map((t) => ( t.id )), todo: todo }).
      then((res) => { if (res.ok) { refresh() } })
  }

  return (
    <>
      <input id="toggle-all"
             type="checkbox"
             value="1"
             checked={todos.every((t) => ( t.completed ))}
             onChange={(e) => { updateAll({ completed: e.target.checked ? "1" : "0" }) }} />
      <label htmlFor="toggle-all">Mark all as complete</label>

      <ul id="todos">
        { todos.map((t) => ( <Todo key={t.id} refresh={refresh} {...t} /> )) }
      </ul>
    </>
  )
}

const Footer = ({ search, todos, refresh }) => {
  const filtering = search.includes("completed")

  const destroyCompleted = () => {
    destroy("/destroy_many", { ids: todos.filter((t) => ( t.completed )).map((t) => ( t.id )) }).
      then((res) => { if (res.ok) { refresh() } })
  }

  return (
    <footer id="footer" className={todos.length === 0 && !filtering ? "hidden" : ""}>
      <span id="todo-count">
        {
          ((count) => (
            `${count} ${count === 1 ? "item" : "items"} left`
          ))(todos.filter((t) => ( !t.completed )).length)
        }
      </span>

      <ul id="filters">
        <li>
          <Link to="/" id="all" className={!filtering ? "selected" : ""}>All</Link>
        </li>
        <li>
          <Link to="/?completed=false"
                id="active"
                className={ search.includes('completed=false') ? "selected" : ""}>Active</Link>
        </li>
        <li>
          <Link to="/?completed=true"
                id="completed"
                className={ search.includes('completed=true') ? "selected" : ""}>Completed</Link>
        </li>
      </ul>

      {
        todos.filter((t) => ( t.completed )).length > 0 &&
          <button name="button" type="submit" id="clear-completed" onClick={destroyCompleted}>
            Clear completed
          </button>
      }
    </footer>
  )
}

const App = ({ location: { search } }) => {
  const [cacheKey, setCacheKey] = useState(uuid())
  const refresh = () => { setCacheKey(uuid()) }
  const [todos, setTodos] = useState([])
  const [flash, setFlash] = useState([])

  useEffect(() => {
    const path = search.includes("completed") ?
      `/?completed=${search.includes("completed=true")}`:
      '/'

    get(path).
      then((res) => { if (res.ok) { return res.json() } }).
      then((json) => { setTodos(json.todos) })
  }, [search, cacheKey])

  return (
    <>
      <section id="todoapp">
        <header id="header">
          {
            flash.length > 0 &&
              <p style={{ paddingTop: '40px', fontSize: '24px', textAlign: 'center', color: 'darkred'}}>
                <span style={{ padding: '10px', border: '1px solid' }}>{flash}</span>
              </p>
          }
          <h1>todos</h1>
          <NewTodo refresh={refresh} setFlash={setFlash} />
        </header>

        <section id="main">
          <Todos todos={todos} refresh={refresh} />
        </section>

        <Footer search={search} todos={todos} refresh={refresh} />
      </section>

      <footer id="info">
        <p>Double-click to edit a todo</p>
        <p>Created by Gray Kemmey</p>
        <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
      </footer>
    </>
  )
}

export default withRouter(App);
