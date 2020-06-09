# Jumpstart! An Introduction to MongoDB's Most Indispensable Tools for Developers

## Module 4

### Enable MongoDB Atlas Search

- Navigate to your MongoDB Atlas dashboard at
  [https://cloud.mongodb.com/](https://cloud.mongodb.com/)
- Select the Cluster that has the **gif-battle** database and hit the
  **collections** button
- Navigate to the **collections** tab and select the **gif-battle** database
- Navigate to the **Search** tab and click the **Create Search Index** button
- Click the **Create Index** button to create a dynamic search index

### Create a Search Function using MongoDB Realm

- Navigate to the **Realm** tab and select the **Gif-Battle** application
- In the Realm dashboard, navigate to the **Functions** tab and click the
  **Create New Function** button
- Name the function **searchGifs**
- Navigate to the **Function Editor** tab and add the following code:

```js
exports = function (arg) {
  let collection = context.services
    .get("mongodb-atlas")
    .db("gif-battle")
    .collection("gifs");

  return collection.aggregate([
    {
      $search: {
        search: {
          query: arg,
          path: ["tags", "captions.text"],
        },
      },
    },
    {
      $limit: 5,
    },
  ]);
};
```

- Click the **Save** button to save your changes
- Click the **Review & Deploy Changes** button
- Click the **Deploy** button to update the Realm Application with the changes
  we've made above

### Update Realm.js to Use the SearchGifs Function

- Open up `Realm.js`
- Add the following code:

```js
const searchGifs = (query) => {
  return client.callFunction("searchGifs", [query]);
};
```

Final result will look like this:

```js
import { Stitch, RemoteMongoClient } from "mongodb-stitch-browser-sdk";

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

const searchGifs = (query) => {
  return client.callFunction("searchGifs", [query]);
};

export {
  client,
  getAllGifs,
  searchGifs,
  getSingleGif,
  voteCaption,
  putCaption,
};
```

- Navigate to the **Users** tab in the MongoDB Realm dashboard
- Navigate to the **Providers** tab in the Users section
- Hit the **Edit** button on **Allow users to log in anonymously**
- Set the **Provider Enabled** toggle to on and hit **Save**

### Update Home.js to add Search Functionality

- Open up `Home.js`
- Add the following code so the final result looks like this:

```js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from "react-router-dom";

import { client, getAllGifs, searchGifs } from "./Realm";
import { AnonymousCredential } from "mongodb-stitch-browser-sdk";

function Home() {
  let [gifs, setGifs] = useState([]);
  let [searchTerm, setSearchTerm] = useState("");

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

  const handleSearchChangeEvent = (event) => {
    setSearchTerm(event.target.value);
  };

  const executeSearch = (event) => {
    event.preventDefault();

    if (searchTerm.length > 0) {
      searchGifs(searchTerm).then((results) => {
        setSearchTerm("");
        setGifs(results);
      });
    }
  };

  return (
    <div className="bg-gray-100">
      <form onSubmit={(e) => executeSearch(e)}>
        <input
          className="w-full border border-gray-300 block py-2 px-5"
          type="text"
          placeholder="Search for a gif"
          value={searchTerm}
          onChange={(e) => handleSearchChangeEvent(e)}
        />
      </form>
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
