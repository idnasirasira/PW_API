var express = require('express');
var router = express.Router();
const Validator = require('fastest-validator');
const { TodoList } = require('../models');

const v = new Validator();

// GET ALL TODO LIST
router.get('/', async (req, res, next) => {
  const todo_list = await TodoList.findAll();

  res.status(200).json({
    status: 200,
    msg: 'Get all todo list.',
    data: todo_list,
    errors: [],
  });
})

// GET TODO BY ID
router.get('/:id', async (req, res, next) => {
  const id = req.params.id;
  const todo = await TodoList.findByPk(id);

  if(!todo){
    return res.status(404).json({
      status: 404,
      msg: 'Todo not found.',
      errors: [],
    });
  }

  res.status(200).json({
    status: 200,
    msg: `Get todo by id ${id}.`,
    data: todo  ,
    errors: [],
  });
})

/* INSERT TODO. */
router.post('/', async (req, res, next) => {
  const schema = {
    title: 'string',
    content: 'string|optional'
  };

  const validate = v.validate(req.body, schema);

  if(validate.length){
    return res.status(400).json({
      status: 400,
      msg: 'Invalid body.',
      errors: validate,
    });
  }

  const todo = await TodoList.create(req.body);

  res.status(200).json({
    status: 200,
    msg: 'Todo has been created.',
    data: todo,
    errors: [],
  });
});


/* Update Todo listing. */
router.put('/:id', async (req, res, next) => {
  const id = req.params.id;

  const checkTodo = await TodoList.findByPk(id);

  if(!checkTodo){
    return res.status(404).json({
      status: 404,
      msg: 'Todo not found.',
      errors: [],
    });
  }

  const schema = {
    title: 'string|optional',
    content: 'string|optional'
  };

  const validate = v.validate(req.body, schema);

  if(validate.length){
    return res.status(400).json({
      status: 400,
      msg: 'Invalid body.',
      errors: validate,
    });
  }

  const todo = await checkTodo.update(req.body);

  res.status(200).json({
    status: 200,
    msg: 'Todo has been updated.',
    data: todo,
    errors: [],
  });
});


// GET TODO BY ID
router.delete('/:id', async (req, res, next) => {
  const id = req.params.id;
  const todo = await TodoList.findByPk(id);

  if(!todo){
    return res.status(404).json({
      status: 404,
      msg: 'Todo not found.',
      errors: [],
    });
  }

  await todo.destroy();

  res.status(200).json({
    status: 200,
    msg: `Todo with id ${id} has been deleted.`,
    errors: [],
  });
})

module.exports = router;
