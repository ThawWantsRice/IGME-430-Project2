const helper = require('./helper.js');
const { toast, ToastContainer } = require('react-toastify');
require("react-toastify/dist/ReactToastify.css");
const React = require('react');
const { createRoot } = require('react-dom/client');

const handleLogin = (e) => {
    e.preventDefault();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if (!username || !pass) {
        toast.error('Username or password is empty!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass });
    return false;
}

const handleSignup = (e) => {
    e.preventDefault();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if (!username || !pass || !pass2) {
        toast.error('All fields are required!');
        return false;
    }

    if (pass !== pass2) {
        toast.error('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass, pass2 });
    return false;
}

const LoginWindow = (props) => {
    return (
        <div className='infoBox'><form id="loginForm"
            name="loginForm"
            onSubmit={handleLogin}
            action="/login"
            method="POST"
            className="mainForm"
        >
            <label htmlFor='username'>Username:</label>
            <input id="user" type="text" name='username' placeholder='username' />
            <label htmlFor="pass">Password:</label>
            <input type="password" name="pass" id="pass" placeholder="password" />
            <input type="submit" className="formSubmit" value="Sign in" />
        </form></div>
    );
};

const SignupWindow = (props) => {
    return (
        <div className='infoBox'><form id="signupForm"
            name="signupForm"
            onSubmit={handleSignup}
            action="/signup"
            method="POST"
            className="mainForm"
        >
            <label htmlFor='username'>Username</label>
            <input id="user" type="text" name='username' placeholder='username' />
            <label htmlFor="pass">Password:</label>
            <input type="password" name="pass" id="pass" placeholder="password" />
            <label htmlFor='pass'>Password:</label>
            <input type="password" name="pass2" id="pass2" placeholder="retype password" />
            <input type="submit" className="formSubmit" value="Sign up" />
        </form></div>
    );
};

const init = () => {
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');

    const root = createRoot(document.getElementById('content'));

    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<><LoginWindow /> <ToastContainer /> </>);
        return false;
    });

    signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<><SignupWindow /> <ToastContainer /> </>)
        return false;
    });

    root.render(<><LoginWindow /> <ToastContainer /> </>);
};

window.onload = init;