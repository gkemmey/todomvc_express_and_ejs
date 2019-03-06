'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.
      createTable('Todos', {
                             id: {
                               allowNull: false,
                               autoIncrement: true,
                               primaryKey: true,
                               type: Sequelize.INTEGER
                             },
                             sessionUserId: {
                               type: Sequelize.STRING
                             },
                             title: {
                               type: Sequelize.STRING
                             },
                             completed: {
                               type: Sequelize.BOOLEAN,
                               defaultValue: false
                             },
                             createdAt: {
                               allowNull: false,
                               type: Sequelize.DATE
                             },
                             updatedAt: {
                               allowNull: false,
                               type: Sequelize.DATE
                             }
                           }
    ).
    then(() => {
      return queryInterface.
               addIndex('Todos', ['sessionUserId', 'title'], { indexName: 'todos_title',
                                                               indicesType: 'UNIQUE' })
    })

  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Todos');
  }
};
