# Jumpstart! An Introduction to MongoDB's Most Indispensable Tools for Developers

## Module 5

### Enable MongoDB Atlas Charts

- Navigate to your MongoDB Atlas dashboard at
  [https://cloud.mongodb.com/](https://cloud.mongodb.com/)
- Navigate to the **Charts** tab
- Click the **Activate MongoDB Charts** button
- Click the **Data Sources** tab and then **Add Data Source** button
- Select your cluster with the **gif-battle** database as the data source
- Enable the **gif-battle** database and the **gifs** collection as the data
  source for our Charts

### Creating a MongoDB Atlas Chart

- Navigate to the **Dashboard** tab in the Charts user interface
- Click on the **New Dashboard** button and name your dashboard whatever you
  want
- Click the **Add Chart** button to create a new chart
- In the New Chart user interface click the **Data Source** button and choose
  `gif-battle.gifs`
- Select **Column** as the Chart Type
- For the X Axis, drag the **url** field
- For the Y Axis, drag the **votes** field from **captions** and for Array
  Reduction select **unwind**, for the aggregation type select **max**
- Navigate to the **Filter** tab and drag and drop the **votes** field to the
  filter
- Enable **min** and set the value to 2

### Adding a MongoDB Atlas Chart to our React Application

- Hover over the newly created chart and click on the **...** button and select
  **Embed Chart** option
- Click the **Configure External Sharing** button and switch the toggle to the
  **On** state
- Select **Unauthenticated and Authenticated Access** and click **Go Back**
- Click the **Enable unauthenticated access** button
- Select **Iframe** as the Embed Option
- Set the auto-refresh to 10 seconds
- Copy the Embed Code
- Open up the `App.js` file in your react application and add the following code
  for a final result of:

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
```

- Note: Be sure to remove the `style` attribute from the embed code as it will
  cause React to crash as JSX can't process it in it's current form.
