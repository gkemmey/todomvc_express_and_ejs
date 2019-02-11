'use strict';

module.exports = (sequelize, DataTypes) => {
  const Todo = sequelize.define('Todo', {
    sessionUserId: DataTypes.STRING,
    title: DataTypes.STRING,
    completed: DataTypes.BOOLEAN
  }, {});

  Todo.associate = function(models) {
    // associations can be defined here
  };

  return Todo;
};
