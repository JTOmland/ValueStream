

module.exports = function errorHandler(err, req, res, next) {
    console.log("This is the errorHandler error", err);
    res.status(500).send(err);
    //res.render('app_error', { error: err });
};