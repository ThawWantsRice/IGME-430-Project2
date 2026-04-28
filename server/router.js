const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
    app.get('/getItems', mid.requiresLogin, controllers.Item.getItems);
    app.get('/retrieve', mid.requiresLogin, controllers.File.retrieveFile);

    app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
    app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

    app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

    app.get('/changePassword', mid.requiresLogin, controllers.Account.changePassword);
    app.post('/changePassword', mid.requiresLogin, controllers.Account.changePassword);

    app.get('/logout', mid.requiresLogin, controllers.Account.logout);

    app.get('/maker', mid.requiresLogin, controllers.Item.makerPage);
    app.post('/maker', mid.requiresLogin, controllers.Item.makeItem);

    app.post('/placeBid', mid.requiresLogin, controllers.Item.placeBid);
    app.post('/deleteItem', mid.requiresLogin, controllers.Item.deleteItem);

    app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

    app.get('/*notfound', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;