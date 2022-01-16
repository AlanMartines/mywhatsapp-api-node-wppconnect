/* ##############################################################################
# File: users.js                                                               #
# Project: api-monitoring                                                      #
# Created Date: 2022-01-10 14:34:15                                            #
# Author: Eduardo Policarpo                                                    #
# Last Modified: 2022-01-10 14:34:16                                           #
# Modified By: Eduardo Policarpo                                               #
############################################################################## */

import Sequelize from 'sequelize';
import connection from '../database.js';

const User = connection.define(
  'User',
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    number: {
      allowNull: false,
      type: Sequelize.STRING,
      unique: true,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  },
  {
    freezeTableName: true,
    tableName: 'User',
  }
);

// force: true faz com que a tabela seja criada ou atualizada no BD
User.sync({ force: false })
  .then(() => {
    console.log('tabela User criada/atualizada com sucesso no BD');
  })
  .catch((error) => {
    console.log('erro ao sincronizar a tabela User no BD', error);
  });

export default User;
