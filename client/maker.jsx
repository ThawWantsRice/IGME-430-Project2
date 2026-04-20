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

    helper.sendPost(e.target.action, { name, description, startingPrice }, onItemAdded);
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
        >

            <label htmlFor="name">Item Name:</label>
            <input type="text" id='itemName' name='name' placeholder='Item Name' />

            <label htmlFor="description">Description:</label>
            <input type="text" id='itemDescription' name='description' placeholder='Item Description' />

            <label htmlFor="price">Starting Price:</label>
            <input type="number" id="itemPrice" name="startingPrice" min="1" />

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

const App = () => {
    const [reloadItems, setReloadItems] = useState(false);

    return (
        <div>
            <div id='makeItem'>
                <ItemForm triggerReload={() => setReloadItems(!reloadItems)} />
            </div>
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
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;
