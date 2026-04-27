const models = require('../models');
const Item = models.Item;
const File = models.File;

const makerPage = (req, res) => {
    return res.render('app');
};

const getItems = async (req, res) => {
    try {
        const query = {};
        const docs = await Item.find(query).select('name description currentPrice expiredTime imageId').lean().exec();

        return res.json({ items: docs });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving items!' });
    }
};

const makeItem = async (req, res) => {
    if (!req.body.name || !req.body.description || !req.body.startingPrice) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    let fileId;

    if (req.files && req.files.image) {
        const file = req.files.image;

        const newFile = new File({
            name: file.name,
            data: file.data,
            size: file.size,
            mimetype: file.mimetype,
        });

        const savedFile = await newFile.save();
        fileId = savedFile._id;
    }

    const itemData = {
        name: req.body.name,
        description: req.body.description,
        startingPrice: req.body.startingPrice,
        currentPrice: req.body.startingPrice,
        owner: req.session.account._id,
        expiredTime: new Date(Date.now() + 5 * 60 * 1000), //5 min test also milliseconds
        imageId: fileId,
    };

    try {
        const newItem = new Item(itemData);
        await newItem.save();

        return res.status(201).json({
            name: newItem.name,
            description: newItem.description,
            currentPrice: newItem.currentPrice,
            expiredTime: newItem.expiredTime,
            imageId: fileId,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error creating item!' });
    }
};

const deleteItem = async (req, res) => {
    try {
        const itemId = req.body.id;

        const result = await Item.deleteOne({
            _id: itemId,
            owner: req.session.account._id,
        });

        if (result.deletedCount === 0) {
            return res.status(400).json({ error: "Not your item!" });
        }
        return res.json({ success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Error deleting item!" });
    }
};

const placeBid = async (req, res) => {
    if (!req.body.itemId || !req.body.amount) {
        return res.status(400).json({ error: 'Item ID and amount required' });
    }

    try {
        const item = await Item.findById(req.body.itemId);

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        if (Date.now() > item.expiredTime) {
            return res.status(400).json({ error: 'Auction expired' });
        }

        // Check bid is bigger
        // "Honey 120 is a lower amount"
        if (req.body.amount <= item.currentPrice) {
            return res.status(400).json({ error: 'Bid must be higher than current price' });
        }

        // Add bid
        item.bids.push({
            bidder: req.session.account._id,
            amount: req.body.amount,
        });

        item.currentPrice = req.body.amount;

        await item.save();

        return res.status(200).json({
            success: true,
            currentPrice: item.currentPrice,
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error placing bid' });
    }
}

module.exports = {
    makerPage,
    makeItem,
    getItems,
    deleteItem,
    placeBid,
}