const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const _ = require('lodash');
const validator = require('validator');
const mailChecker = require('mailchecker');
const User = require('../models/User');
const Therapist = require('../models/Therapist');

const randomBytesAsync = promisify(crypto.randomBytes);


exports.searchTherapists = async (req, res, next) =>  {

    const therapists = await Therapist.find({ name: { $regex: req.params.query } }) // Get therapists by name

    const results = therapists.map(therapist => { // Calculate star averages for each therapist
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
                { $project: {_id:0, name:"$_id.name", averageRating: "$_id.avg", ratings: 1}}
        ]);
    });

    const therapistsWithAverages = await Promise.all(results) // Wrap up all therapist objects with star averages
    res.render('listTherapists', {
        therapists: therapistsWithAverages
    });

};

exports.getAddForm = (req, res) => {
  res.render('addTherapist', {
  title: 'Add Therapist'
  });
};

exports.getRate = (req, res) => {
  res.render('rateTherapist', {
  title: 'Rate a Therapist'
  });
};

exports.addTherapist = (req, res) => {
    var newTherapist = new Therapist({
        name: req.body.therapistName,
        group: req.body.group,
        therapist_rating: []
    });
    newTherapist.save(function (err) {
        if (err) return console.error(err);
    });
    req.flash('success', { msg: "Therapist added!" });
    res.redirect("/rate")
};
