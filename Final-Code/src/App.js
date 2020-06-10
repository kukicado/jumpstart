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
      <iframe
        width="640"
        height="480"
        src="https://charts.mongodb.com/charts-project-0-jndfc/embed/charts?id=031ffe79-42a5-4cd3-82d3-295d46c53fe3&autorefresh=10&theme=light"
      ></iframe>
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
