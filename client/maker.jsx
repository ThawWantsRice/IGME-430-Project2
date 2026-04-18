const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

const handleDomo = (e, onDomoAdded) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector("#domoName").value;
    const age = e.target.querySelector("#domoAge").value;
    const phrase = e.target.querySelector("#domoPhrase").value;

    if (!name || !age || !phrase) {
        helper.handleError("All Fields are required!");
        return false;
    }

    helper.sendPost(e.target.action, { name, age, phrase }, onDomoAdded);
    return false;
}

const DomoForm = (props) => {
    return (
        <form id='domoForm'
            onSubmit={(e) => handleDomo(e, props.triggerReload)}
            name='domoForm'
            action="/maker"
            method='POST'
            className='domoForm'
        >

            <label htmlFor="name">Name:</label>
            <input type="text" id='domoName' name='name' placeholder='Domo Name' />
            <label htmlFor="age">Age:</label>
            <input type="number" name="age" id="domoAge" min="0" />
            <label htmlFor="phrase">Phrase:</label>
            <input type="text" id='domoPhrase' name='phrase' placeholder='Domo Catchphrase' />
            <input type="submit" className='makeDomoSubmit' value="Make Domo" />
        </form>
    );
}

const DomoList = (props) => {
    const [domos, setDomos] = React.useState(props.domos);

    const deleteDomoHandler = async (id) => {
        await helper.sendPost('/deleteDomo', { id });
        props.triggerReload();
    }

    useEffect(() => {
        const loadDomosFromServer = async () => {
            const res = await fetch('/getDomos');
            const data = await res.json();
            setDomos(data.domos);
        };
        loadDomosFromServer();
    }, [props.reloadDomos]);

    if (domos.length === 0) {
        return (
            <div className="domoList">
                <h3 className="emptyDomo">No Domos yet!</h3>
            </div>
        )
    }

    const domoNodes = domos.map(domo => {
        return (
            <div key={domo._id} className="domo">
                <img src="/assets/img/domoface.jpeg" alt="domo face" className="domoFace" />
                <h3 className="domoName">Name: {domo.name}</h3>
                <h3 className="domoAge">Age: {domo.age}</h3>
                <h3 className="domoPhrase">Phrase: {domo.phrase}</h3>

                <button className='deleteDomo' onClick={() => deleteDomoHandler(domo._id)}>Delete</button>
            </div>
        );
    });
    return (
        <div className='domoList'>
            {domoNodes}
        </div>
    )
}

const App = () => {
    const [reloadDomos, setReloadDomos] = useState(false);

    return (
        <div>
            <div id='makeDomo'>
                <DomoForm triggerReload={() => setReloadDomos(!reloadDomos)} />
            </div>
            <div id='domos'>
                <DomoList domos={[]} reloadDomos={reloadDomos} triggerReload={() => setReloadDomos(!reloadDomos)}/>
            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;
