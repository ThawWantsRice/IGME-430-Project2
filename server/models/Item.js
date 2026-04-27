const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        set: setName,
    },
    description: {
        type: String,
        required: true,
    },
    startingPrice: {
        type: Number,
        min: 1,
        required: true,
    },
    currentPrice: {
        type: Number,
    },
    imageId: {
        type: mongoose.Schema.ObjectId,
        ref: 'File'
    },
    bids: [
        {
            bidder: {
                type: mongoose.Schema.ObjectId,
                ref: 'Account',
                required: true,
            },
            amount: {
                type: Number,
                required: true,
                min: 0,
            },
            createdDate: {
                type: Date,
                default: Date.now,
            }
        },
    ],
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Account',
    },
    expiredTime: {
        type: Date,
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
});

ItemSchema.statics.toAPI = (doc) => ({
    name: doc.name,
    description: doc.description,
    currentPrice: doc.currentPrice,
    createdDate: doc.createdDate,
});

const ItemModel = mongoose.model('Item', ItemSchema);
module.exports = ItemModel;