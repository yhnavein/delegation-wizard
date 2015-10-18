"use strict";

module.exports = function(db, DataTypes) {
  var Rate = db.define('Rate', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    json: DataTypes.JSON,
    date: DataTypes.STRING
  }, {
    tableName: 'nbp_rate',
    timestamps: false,
    classMethods: {
      findByDate: function(date) {
        var formattedDate = date.format("YYMMDD");

        return Rate.findOne({
          where: { date: formattedDate }
        });
      }
    }
  });

  return Rate;
};
