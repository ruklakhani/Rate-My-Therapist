exports.index = (req, res) => {
  res.render('home', {
  title: 'Home',
  active: { home: true }
  });
};


// idk if these are in the right file but yeah
exports.find = (req, res) => {
  res.render('findTherapist', {
  title: 'Find Therapist'
  });
};
exports.rate = (req, res) => {
  res.render('rateTherapist', {
  title: 'Rate a Therapist'
  });
};