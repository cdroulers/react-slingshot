/* eslint-disable import/no-named-as-default */
import React from "react";
import PropTypes from "prop-types";
import { Switch, NavLink, Route } from "react-router-dom";
import HomePage from "./HomePage";
import FuelSavingsPage from "./containers/FuelSavingsPage";
import AboutPage from "./AboutPage";
import NotFoundPage from "./NotFoundPage";
import CaseList from "./cases/CaseList";
import ApolloCaseList from "./cases/ApolloCaseList";
import { setUserName } from "../data/db";

// This is a class-based component because the current
// version of hot reloading won't hot reload a stateless
// component at the top-level.

class App extends React.Component {
  render() {
    const activeStyle = { color: "blue" };
    return (
      <div>
        <div>
          <NavLink exact to="/" activeStyle={activeStyle}>
            Home
          </NavLink>
          {" | "}
          <NavLink to="/fuel-savings" activeStyle={activeStyle}>
            Demo App
          </NavLink>
          {" | "}
          <NavLink to="/about" activeStyle={activeStyle}>
            About
          </NavLink>
          {" | "}
          <NavLink to="/cases" activeStyle={activeStyle}>
            Cases
          </NavLink>
          {" | "}
          <NavLink to="/apollo-cases" activeStyle={activeStyle}>
            Apollo Cases
          </NavLink>
          <form
            onSubmit={e => {
              e.preventDefault();
              setUserName(e.target.username.value);
            }}
          >
            <input type="text" name="username" defaultValue={localStorage.getItem("userName")} />
            <input type="submit" value="set username" />
          </form>
        </div>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/fuel-savings" component={FuelSavingsPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/cases" component={CaseList} />
          <Route path="/apollo-cases" component={ApolloCaseList} />
          <Route component={NotFoundPage} />
        </Switch>
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.element
};

export default App;
