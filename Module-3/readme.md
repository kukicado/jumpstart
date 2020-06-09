# Jumpstart! An Introduction to MongoDB's Most Indispensable Tools for Developers

## Module 3

### Set up a MongoDB Realm Application

- Navigate to your MongoDB Atlas dashboard at
  [https://cloud.mongodb.com/](https://cloud.mongodb.com/)
- Navigate to the **Realm** tab in the top menu (Note: It may say **Stitch**)
- Click the **Create a New App** button and name it **Gif-Battle**
- Select the cluster you created your gif-battle database in in the **Link your
  Database** section

### Enable Access to Gif-Battle Database

- Navigate to the **Rules** tab in the MongoDB Realm dashboard
- Select the **gif-battle** database and the **gifs** collection
- Click the **Configure Collection** button leaving all the defaults on
- Click the **read** and **write** options under the **default** rule to enable
  read and write access for all (Note: You would not do this in production)
-

### Enable Anonymous User Authentication

- Navigate to the **Users** tab in the MongoDB Realm dashboard
- Navigate to the **Providers** tab in the Users section
- Hit the **Edit** button on **Allow users to log in anonymously**
- Set the **Provider Enabled** toggle to on and hit **Save**

### Deploy Realm Application Changes

- Click the **Review & Deploy Changes** button
- Click the **Deploy** button to update the Realm Application with the changes
  we've made above

### Creating the Backend Functionality

- Navigate to the **Functions** tab in the MongoDB Realm Dashboard
- Click on the **Create New Function** button
- Name the function **getAllGifs** and leave all the defaults
- Navigate to the **Function Editor** tab and add the following code

```
exports = function(arg){

  let collection = context.services.get("mongodb-atlas").db("gif-battle").collection("gifs");

  return collection.find({});
}
```

- Click the **Save** button to save your changes
- Navigate back to the **Functions** tab in the MongoDB Realm Dashboard
- Click on the **Create New Function** button
- Name the function **getSingleGif** and leave all the defaults
- Navigate to the **Function Editor** tab and add the following code

```
exports = function(arg){

  let collection = context.services.get("mongodb-atlas").db("gif-battle").collection("gifs");

  return collection.findOne({_id: BSON.ObjectId(arg)});
}
```

- Click the **Save** button to save your changes
- Click the **Review & Deploy Changes** button
- Click the **Deploy** button to update the Realm Application with the changes
  we've made above

### Setting up a React Application

Note: You'll need a recent version of Node.js and NPM installed on your machine
to be able to create the React application. Please ensure you have those
installed before continuing.

- Create a new React application using Create React App by running
  `npx create-react-app gif-battle` in your terminal
- Navigate to the **gif-battle** directory by executing `cd gif-battle` in your
  terminal
- Start the application by executing `npm start` in your terminal
- Open up the `index.html` file located under the `public` directory and in
  between the `<head>` tags add a reference to Tailwind.css:
  `<link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">`
- Execute `npm install react-router-dom --save` in your terminal to add a React
  Router
- Execute `npm install mongodb-stitch-browser-sdk --save` (Note: You may be able
  to run `npm install mongodb-realm-browser-sdk --save` as well)

### Implementing the User Interface

- Create a new file in the `src` directory and call it `Realm.js`
- Create a new file in the `src` directory and call it `Home.js`
- Create a new file in the `src` directory and call it `GifDetails.js`

**Realm/Stitch Serverless Functionality (Realm.js)**

- Open up `Realm.js`
- Add the following code:

```js
import { Stitch, RemoteMongoClient } from "mongodb-stitch-browser-sdk";

// Note: Your app client can be found in your MongoDB Realm dashboard
let client = Stitch.initializeDefaultAppClient("gif-battle-ltdfe");
let mongodb = client.getServiceClient(
  RemoteMongoClient.factory,
  "mongodb-atlas"
);
let db = mongodb.db("gif-battle");

const getAllGifs = () => {
  return client.callFunction("getAllGifs");
};

const getSingleGif = (id) => {
  return client.callFunction("getSingleGif", [id]);
};

const voteCaption = (id, caption, direction) => {
  return db.collection("gifs").updateOne(
    {
      _id: { $oid: id },
      "captions.text": caption.text,
    },
    { $inc: { "captions.$.votes": direction } }
  );
};

const putCaption = (id, caption) => {
  return db
    .collection("gifs")
    .updateOne(
      { _id: { $oid: id } },
      { $push: { captions: { votes: 1, text: caption } } }
    );
};

export { client, getAllGifs, getSingleGif, voteCaption, putCaption };
```

**Home Component (Home.js)**

- Open up `Home.js`
- Add the following code:

```js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from "react-router-dom";

import { client, getAllGifs } from "./Realm";
import { AnonymousCredential } from "mongodb-stitch-browser-sdk";

function Home() {
  let [gifs, setGifs] = useState([]);

  useEffect(() => {
    if (!client.auth.user) {
      client.auth.loginWithCredential(new AnonymousCredential()).then(() => {
        getAllGifs().then((data) => {
          setGifs(data);
        });
      });
    } else {
      getAllGifs().then((data) => {
        setGifs(data);
      });
    }
  }, []);

  return (
    <div className="bg-gray-100">
      <div className="container mx-auto text-center">
        <div className="flex flex-wrap py-5 pb-32">
          {gifs &&
            gifs.map((gif) => (
              <Link to={"/gif/" + gif._id.toString()} key={gif._id.toString()}>
                <Gif gif={gif} />
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}

function Gif({ gif }) {
  if (gif.captions) {
    gif.captions.sort((a, b) => (b.votes > a.votes ? 1 : -1));
  }
  return (
    <div className="w-full p-5 m-5 text-white relative">
      <img src={gif.url} className="w-full" alt="Gif" />
      <h2 className="-mt-12 font-semibold text-2xl">
        {gif.captions && gif.captions[0].text}
      </h2>
    </div>
  );
}

export default Home;
```

**GifDetails Component (GifDetails.js)**

- Open up `GifDetails.js`
- Add the following code:

```js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from "react-router-dom";

import {
  client,
  getAllGifs,
  getSingleGif,
  voteCaption,
  putCaption,
} from "./Realm";
import { AnonymousCredential } from "mongodb-stitch-browser-sdk";

function GifDetails() {
  let { id } = useParams();
  let [gif, setGif] = useState({});
  let [caption, setCaption] = useState("");

  const handleChangeEvent = (e) => {
    setCaption(e.target.value);
  };

  const insertCaption = (e) => {
    e.preventDefault();

    putCaption(id, caption).then(() => {
      gif.captions = gif.captions || [];
      gif.captions.push({ text: caption, votes: 1 });
      setCaption("");
      setGif(gif);
    });
  };

  const vote = (id, caption, direction) => {
    voteCaption(id, caption, direction).then((data) => {
      getSingleGif(id).then((data) => {
        setGif(data);
      });
      console.log(data);
    });
  };

  if (gif.captions) {
    gif.captions.sort((a, b) => (b.votes > a.votes ? 1 : -1));
  }

  useEffect(() => {
    getSingleGif(id).then((data) => {
      console.log(data);
      setGif(data);
    });
  }, [id]);

  return (
    <div class="container mx-auto py-16">
      <div className="flex flex-wrap">
        <div className="w-1/2">
          <img src={gif.url} alt="Gif" className="min-w-full px-10" />
          <h2 className="-mt-16 text-center  text-white font-semibold text-3xl">
            {gif.captions && gif.captions[0].text}
          </h2>
        </div>
        <div className="w-1/2">
          {gif.captions &&
            gif.captions.map((caption) => (
              <div className="bg-gray-200 my-2 flex flex-wrap">
                <div className="w-8/12 py-5 text-lg pl-2">
                  {caption.text} ({caption.votes})
                </div>
                <div
                  className="w-2/12 bg-green-300 text-lg text-center py-5"
                  onClick={() => vote(gif._id.toString(), caption, 1)}
                >
                  +
                </div>
                <div
                  className="w-2/12 bg-red-300 text-lg text-center py-5"
                  onClick={() => vote(gif._id.toString(), caption, -1)}
                >
                  -
                </div>
              </div>
            ))}

          <form onSubmit={(e) => insertCaption(e)}>
            <input
              className="w-full border border-gray-300 block py-2 px-5"
              type="text"
              placeholder="Add your own caption"
              value={caption}
              onChange={(e) => handleChangeEvent(e)}
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default GifDetails;
```

**App Component (App.js)**

- Open up `App.js`
- Add the following code:

```js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from "react-router-dom";

import Home from "./Home";
import GifDetails from "./GifDetails";

function App() {
  return (
    <Router>
      <div className="flex bg-green-500 text-white p-5">
        <div className="w-1/12">Mongo Gif-Battle</div>
        <div className="w-11/12 font-bold">
          <Link to="/">Home</Link>
        </div>
      </div>
      <Switch>
        <Route path="/gif/:id">
          <GifDetails />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
```
