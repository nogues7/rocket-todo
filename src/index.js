const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find(user => user.username === username);

  if(!user)
    return response.status(404).json({error: "User not found!"});

  request.user = user;

  return next();
}

function checkExistsToDo(request, response, next) {
  const {id} = request.params;
  const {user} = request;

  const todo = user.todos.find(todo => (todo.id === id));

  if(!todo)
    return response.status(404).json({error: "ToDo not found!"});

  request.todo = todo;

  return next();
}

app.post('/users', (request, response) => {
  const {username, name} = request.body;

  // Valida se possui um customer com o cpf que esta tentando cadastrar
  const userAlreadyExists = users.some(
    (user) => user.username === username
  );

  if(userAlreadyExists)
    return response.status(400).json({error: "User already exists!"});

  user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checkExistsToDo, (request, response) => {
  const {todo} = request;
  const {title, deadline} = request.body;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsToDo, (request, response) => {
  const {todo} = request;

  todo.done = true;

  return response.status(201).send();
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsToDo, (request, response) => {
  const {user, todo} = request;

  // Remove o customer, somente 1 posição
  user.todos.splice(todo, 1);

  return response.status(204).json();
});

module.exports = app;