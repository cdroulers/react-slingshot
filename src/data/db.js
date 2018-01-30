import PouchDB from "pouchdb";
import store from "../store/configureStore";
import { LOAD_FUEL_SAVINGS } from "../constants/actionTypes";

const remoteDB = new PouchDB("http://localhost:5984/fuel");

const db = new PouchDB("fuel");

db
  .sync(remoteDB, {
    live: true,
    retry: true
  })
  .on("change", function(change) {
    // yo, something changed!
    if (
      change.direction === "pull" &&
      change.change.docs &&
      change.change.docs[0] &&
      change.change.docs[0]._id === "all"
    ) {
      store.dispatch({
        type: LOAD_FUEL_SAVINGS,
        settings: change.change.docs[0].savings
      });
    }
  })
  .on("error", function() {
    // yo, we got an error! (maybe the user went offline?)
  });

export default db;
