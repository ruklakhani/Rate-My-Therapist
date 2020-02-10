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


exports.searchTherapists = (req, res) => {
    Therapist.aggregate([
        { $match: {"name": "Bill Smith"} },
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
   ]).then(function (res) {
     console.log(res);
   });;

};