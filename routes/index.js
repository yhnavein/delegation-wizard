
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: res.__('Delegation Wizard') });
};

exports.print = function(req, res){
  res.render('print', { title: res.__('Delegation Wizard - Print Version') });
};