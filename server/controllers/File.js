const models = require('../models');
const File = models.File;

const retrieveFile = async (req, res) => {
    if (!req.query._id) {
        return res.status(400).json({ error: 'Missing file id!' });
    }

    let doc;
    try {
        // First we attempt to find the file by the _id sent by the user.
        doc = await File.findOne({ _id: req.query._id }).exec();
    } catch (err) {
        // If we have an error contacting the database, let the user know something happened.
        console.log(err);
        return res.status(400).json({ error: 'Something went wrong retrieving file!' });
    }
    if (!doc) {
        return res.status(404).json({ error: 'File not found!' });
    }

    res.set({
        'Content-Type': doc.mimetype,
        'Content-Length': doc.size,
        'Content-Disposition': `filename="${doc.name}"`, /* `attachment; filename="${doc.name}"` */
    });
    return res.send(doc.data);
};

module.exports = {
    retrieveFile,
};