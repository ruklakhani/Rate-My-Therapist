const Therapist = require('../models/Therapist');
const Group = require('../models/Group');


exports.searchTherapists = async (req, res, next) =>  {
    const finalResults = [];
    const therapists = await Therapist.find({ name: { $regex: req.params.query, '$options' : 'i' } }) // Get therapists by name
    const results = therapists.map(therapist => { // Calculate star averages for each therapist
        if (therapist.therapist_rating.length > 0) {
            return Therapist.aggregate([
                { $match: { _id: therapist._id} },
                { $unwind: "$therapist_rating" },
                {
                    $group: {
                        _id : "$name",
                        avg: {$avg: "$therapist_rating.therapist_rating" },
                        ratings: {$push: "$therapist_rating.therapist_rating" }
                    }
                },
                { $unwind: "$ratings" },
                { 
                    $group: {
                        _id: { name: "$_id", num: "$ratings", avg: "$avg" },
                        count: { $sum: 1 }              
                    }
                },
                {
                    $group: {
                        _id: { name: "$_id.name", avg: "$_id.avg" },
                        ratings: { $push: { num: "$_id.num", count: "$count" }}
                    }
                },
                { $project: {_id:therapist._id, name:"$_id.name", averageRating: "$_id.avg", ratings: 1}},
                { $lookup: {
                    from: "groups",
                    localField: "id",
                    foreignField: therapist.group,
                    as: "group"
                    }
                }
            ]);
        } else {
            return Therapist.aggregate([
                { $match: { _id: therapist._id} },
                { $lookup: {
                    from: "groups",
                    localField: "id",
                    foreignField: therapist.group,
                    as: "group"
                    }
                 }
            ]);
        }
    });

    const therapistsWithAverages = await Promise.all(results); // Wrap up all therapist objects with star averages

    therapistsWithAverages.map(therapist => {
        if(therapist.length > 0) {
            finalResults.push(therapist);
        }
    })

    console.log(finalResults);
    res.render('listTherapists', {
        query: req.params.query,
        therapists: finalResults
    });

};

exports.getAddForm = (req, res) => {
    Group.find(function(err, groups) {
        if(err) {
            res.send(err);
        } else {
            res.render('addTherapist', {
                title: 'Add Therapist',
                groups: groups
            });
        }
    });
};

exports.getRate = (req, res) => {
  res.render('rateTherapist', {
  title: 'Rate a Therapist'
  });
};

exports.showTherapist = async (req, res) => {
    let therapist = await Therapist.findById(req.params.id);

    res.render('viewTherapist', {
        title: therapist.name,
        therapist: therapist
    });
};

exports.addTherapist = (req, res) => {
    const newTherapist = new Therapist({
        name: req.body.therapistName,
        group: req.body.groupSelector,
        therapist_rating: []
    });
    newTherapist.save(function (err) {
        if (err) return console.error(err);
    });
    req.flash('success', { msg: "Therapist added!" });
    res.redirect("/rate")
};
