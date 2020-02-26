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


    let therapistsWithAverages = [];

    Therapist.find(
        { name: { $regex: req.params.query } }
        ).then(therapists => {

            therapists.map(therapist => {

                Therapist.aggregate([
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
        });




















    // Therapist.find(
    //     { name: { $regex: req.params.query } }
    //     ).then(therapists => {



    //         let therapistResults = [];

    //         await function buildTherapists() {
    //             const x = await new Promise(r => {
    //                 for(let i = 0; i < therapists.length; i++) {
    //                     Therapist.aggregate([
    //                         { $match: { _id: therapists[i]._id} },
    //                         { $unwind: "$therapist_rating" },
    //                         {
    //                             $group: {
    //                                 _id : "$name",
    //                                 avg: {$avg: "$therapist_rating.therapist_rating" },
    //                                 ratings: {$push: "$therapist_rating.therapist_rating" }
    //                             }
    //                         },
    //                         { $unwind: "$ratings" },
    //                         { 
    //                             $group: {
    //                                 _id: { name: "$_id", num: "$ratings", avg: "$avg" },
    //                                 count: { $sum: 1 }              
    //                             }
    //                         },
    //                         {
    //                             $group: {
    //                                 _id: { name: "$_id.name", avg: "$_id.avg" },
    //                                 ratings: { $push: { num: "$_id.num", count: "$count" }}
    //                             }
    //                         },
    //                         { $project: {_id:0, name:"$_id.name", averageRating: "$_id.avg", ratings: 1}}
    //                     ]).then(function (results) {
    //                         therapistResults.push(results);
    //                         console.log(results)
    //                     });
    //                 }
    //             })
    //         }

          
    //         console.log(x)










        // console.log(therapistResults);
        // res.render('listTherapists', {
        //     therapists: therapistResults
        // });

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

exports.showTherapist = (req, res) => {
    res.render('viewTherapist', {
        title: 'Therapist Reviews',
        therapist: {
            'name': 'Henry Crow',
            'group': 'The Group',
            'averageRating': 3.9,
            'therapist_rating': [
                {'rating': 5, 'name': 'cool_guy', 'content': "great dude!"},
                {'rating': 1, 'name': 'am_angery', 'content': "he kinda sucks tho"},
                {'rating': 5, 'name': 'bill_boi42', 'content': "been seeing him for years"},
                {'rating': 4.5, 'name': 'bro0o0o0o', 'content': "rad"},
                {'rating': 3, 'name': 'idkman1437', 'content': "ok i guess"},
                {'rating': 5, 'name': 'heuhehueh', 'content': "!!!!!!SO COOL!!!!!"}
            ],
        }
    });
};