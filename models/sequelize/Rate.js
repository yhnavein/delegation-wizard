"use strict";

module.exports = function(db, DataTypes) {
  var Rate = db.define('Rate', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    json: DataTypes.JSON
  }, {
    tableName: 'nbp_rate',
    timestamps: false
  });

  return Rate;
};
