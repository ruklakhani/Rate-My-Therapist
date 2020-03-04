const Therapist = require('../models/Therapist');
const Group = require('../models/Group');


exports.searchTherapists = async (req, res, next) =>  {
    const therapists = await Therapist.find({ name: { $regex: req.params.query, '$options' : 'i' } }) // Get therapists by name
    const results = therapists.map(async (therapist) => { // Calculate star averages for each therapist
        if (therapist.therapist_rating.length > 0) { // if the therapist has ratings
            if(therapist.group.length > 0) { // if the therapist belongs to a group
                const group = await Group.findOne({ _id: therapist.group }, function(err, group) { if(err) { return console.log(err); } return group });  // Sloppy... Learn how to aggregate correctly.
                therapist.group = group
            }
            const therapistWithAverage = await Therapist.aggregate([
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
                { $project: {_id:therapist._id, name:"$_id.name", description: therapist.description, imageUrl: therapist.imageUrl, averageRating: "$_id.avg", ratings: 1}},
            ])
            return therapistWithAverage
        } else {
            // if the therapist does not have any ratings
            const group = await Group.findOne({ _id: therapist.group }, function(err, group) { if(err) { return console.log(err); } return group }); // Sloppy... Learn how to aggregate correctly.
            therapist.group = group
            return [therapist]
        }
    });

    const therapistsWithAverages = await Promise.all(results); // Wrap up all therapist objects with star averages

    res.render('listTherapists', {
        query: req.params.query,
        therapists: therapistsWithAverages,
        title: req.params.query
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

exports.postRate = (req, res) => {
    if (req.body.review.length < 2 || req.body.review == ' ' || req.body.rating == 0) {
        res.send({ done: true });
    } else {
        Therapist.update({ _id: req.body.for }, { $push: { therapist_rating: { review: req.body.review, therapist_rating: parseInt(req.body.rating), by: req.user._id } } }).then(() => {
            res.send({ done: true });
        });
    }
}

exports.showTherapist = async (req, res) => {
    let therapist = await Therapist.findById(req.params.id);
    let group = await Group.findById(therapist.group);

    async function checkIfAlreadyReviewed(therapist) {
        console.log('USER', String(req.user._id))
        if(req.user) {
            result = await therapist.therapist_rating.map((review) => {
                if (String(req.user._id) === String(review.by)) {
                    console.log(String(review.by))
                    return review
                }
            });
            return result;
        }
    }



    async function checkIfTherapistHasReviews(therapist) {
        if(therapist.therapist_rating.length > 0) {
            const therapistWithAverage = await Therapist.aggregate([
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
                { $project: {_id:therapist._id, name:"$_id.name", description: therapist.description, imageUrl: therapist.imageUrl, averageRating: "$_id.avg", ratings: 1}},
            ])
            return therapistWithAverage
        } else {
            return [therapist]
        }
    }
    res.render('viewTherapist', {
        title: therapist.name,
        therapist: await checkIfTherapistHasReviews(therapist),
        reviews: therapist.therapist_rating,
        reviewed: await checkIfAlreadyReviewed(therapist),
        group: group
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
