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
