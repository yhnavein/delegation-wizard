var nbpDirCache = module.exports = function () {
  var dir = null;
  var prevDate = null;

  return {
    get: function (date) {
      if(prevDate === null)
        return null;


      if(dir !== null && (date - prevDate) / 3600000 < 3) //3hrs cache
        return dir;

      return null;
    },
    set: function (date, val) {
      prevDate = date;
      dir = val;
    }
  };
};