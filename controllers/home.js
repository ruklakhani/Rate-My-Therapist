exports.index = (req, res) => {
  res.render('home', {
  title: 'Home',
  active: { home: true }
  });
};
