import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Error404 from "../pages/ErrorPage/Error404";
import Register from "../pages/Register/Register";

const Routes = () => (
  <Router>
    <Switch>
      <Route path="/register" component={Register} />
      <Route component={Error404} />
    </Switch>
  </Router>
);

export default Routes;
