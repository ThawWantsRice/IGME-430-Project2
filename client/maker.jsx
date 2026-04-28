const helper = require('./helper.js');
const React = require('react');
const { toast, ToastContainer } = require('react-toastify');
require("react-toastify/dist/ReactToastify.css");
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

const handleItem = (e, onItemAdded) => {
    e.preventDefault();

    const name = e.target.querySelector("#itemName").value;
    const description = e.target.querySelector("#itemDescription").value;
    const startingPrice = e.target.querySelector("#itemPrice").value;

    if (!name || !description || !startingPrice) {
        toast.error("All Fields are required!");
        return false;
    }

    fetch('/maker', {
        method: 'POST',
        body: new FormData(e.target),
    }).then(res => res.json()).then((result) => {
        if (result.error) {
            toast.error(result.error);
            return;
        }
        toast.success("Item created!");
        onItemAdded();
        e.target.reset();
    }).catch(err => {
        console.error(err);
        toast.error("Upload failed");
    });
    return false;
}

const ItemForm = (props) => {
    return (
        <form id='itemForm'
            onSubmit={(e) => handleItem(e, props.triggerReload)}
            name='itemForm'
            action="/maker"
            method='POST'
            className='itemForm'
            encType="multipart/form-data"
        >

            <label htmlFor="name">Item Name:</label>
            <input type="text" id='itemName' name='name' placeholder='Item Name' />

            <label htmlFor="description">Description:</label>
            <input type="text" id='itemDescription' name='description' placeholder='Item Description' />

            <label htmlFor="price">Starting Price:</label>
            <input type="number" id="itemPrice" name="startingPrice" min="1" />

            <label htmlFor="file">Upload File</label>
            <input type="file" name="image" accept="image/*" />

            <h4 className='warningCreate'>All auction items have a 3% commission rate.</h4>
            <input type="submit" className='makeItemSubmit' value="Create Item" />
        </form>
    );
}

const ItemList = (props) => {
    const [items, setItems] = React.useState(props.items);
    const [bidValues, setBidValues] = useState({});

    const handleBid = async (itemId, amount) => {
        await helper.sendPost('/placeBid', { itemId, amount });
        props.triggerReload();
    }

    const deleteItemHandler = async (id) => {
        await helper.sendPost('/deleteItem', { id });
        props.triggerReload();
    }

    const handleBidChange = (id, value) => {
        setBidValues(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const getTimeLeft = (expiredTime) => {
        //5 min timer from the model
        //Change it there
        const diff = new Date(expiredTime) - new Date();

        if (diff <= 0) return "Expired";

        const minutes = Math.floor(diff / 1000 / 60);
        const seconds = Math.floor((diff / 1000) % 60);

        return `${minutes}m ${seconds}s`;
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setItems(prev => [...prev]);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const loadItemsFromServer = async () => {
            const res = await fetch('/getItems');
            const data = await res.json();
            setItems(data.items);
        };
        loadItemsFromServer();
    }, [props.reloadItems]);

    if (items.length === 0) {
        return (
            <div className="itemList">
                <h3 className="emptyItem">No Items yet!</h3>
            </div>
        )
    }

    const itemNodes = items.map(item => {
        return (
            <div key={item._id} className="item">
                <h3 className="itemName">Name: {item.name}</h3>
                {item.imageId ? (<img src={`/retrieve?_id=${item.imageId}`} alt="item" width={150} />) : null}
                <h3 className="itemDesc">Description: {item.description}</h3>
                <h3 className="itemPrice">Current Price: ${item.currentPrice}</h3>
                <h3>Time Left: {getTimeLeft(item.expiredTime)}</h3>

                <input
                    type="number"
                    placeholder="Enter bid"
                    value={bidValues[item._id] || ''}
                    onChange={(e) => handleBidChange(item._id, e.target.value)}
                />

                <button className='bid-btn' disabled={!bidValues[item._id]} onClick={() =>
                    handleBid(item._id, (bidValues[item._id]))
                }>Place Bid</button>

                <button className='delete-btn' onClick={() => deleteItemHandler(item._id)}>
                    Delete
                </button>
            </div>
        );
    });

    return (
        <div className='itemList'>
            {itemNodes}
        </div>
    )
}

const handlePasswordChange = (e) => {
    e.preventDefault();

    const currentPass = e.target.querySelector('#currentPass').value;
    const newPass = e.target.querySelector('#newPass').value;
    const newPass2 = e.target.querySelector('#newPass2').value;

    if (!currentPass || !newPass || !newPass2) {
        toast.error('All fields are required!');
        return false;
    }

    if (newPass !== newPass2) {
        toast.error('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, { currentPass, newPass, newPass2 });
    return false;
}

const ChangePasswordWindow = (props) => {
    return (
        <div className='infoBox'>
            <h3 className='infoBoxHead'>Password Change</h3>
            <form id="changePasswordForm"
                name="changePasswordForm"
                onSubmit={handlePasswordChange}
                action="/changePassword"
                method="POST"
                className="mainForm"
            >
                <label htmlFor='username'>Current Password:</label>
                <input type="password" id="currentPass" type="text" name='currentPass' placeholder='Current Password' />
                <label htmlFor="pass">New Password:</label>
                <input type="password" name="newPass" id="newPass" placeholder="New Password" />
                <label htmlFor='pass'>Re-enter Password:</label>
                <input type="password" name="newPass2" id="newPass2" placeholder="Re-type New Password" />
                <input type="submit" className="formSubmit" value="Change Password" />
            </form></div>
    )
}

const App = () => {
    const [reloadItems, setReloadItems] = useState(false);
    const [showForm, setShowForm] = useState(false);

    return (
        <div>
            <button
                onClick={() => setShowForm(!showForm)}
                className="showFormBtn"
            >
                {showForm ? "Hide Form" : "Make Item"}
            </button>
            {showForm && (
                <div id='makeItem'>
                    <ItemForm triggerReload={() => setReloadItems(!reloadItems)} />
                </div>
            )}
            <div id='items'>
                <ItemList
                    items={[]}
                    reloadItems={reloadItems}
                    triggerReload={() => setReloadItems(!reloadItems)}
                />
            </div>
            <ToastContainer />
        </div>
    );
};

const init = () => {
    const changePasswordButton = document.getElementById('changePassword');

    const root = createRoot(document.getElementById('app'));

    changePasswordButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<><ChangePasswordWindow /> <ToastContainer /> </>);
        return false;
    });

    root.render(<><App /></>);
};

window.onload = init;
