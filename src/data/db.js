import PouchDB from "pouchdb";
import store from "../store/configureStore";
import { LOAD_FUEL_SAVINGS } from "../constants/actionTypes";

const serverUrl = "http://localhost:5984/";
const currentUserName = localStorage.getItem("userName") || "fuel";
const remoteDB = new PouchDB(serverUrl + currentUserName);

const db = new PouchDB(currentUserName);

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

const ddoc = {
  _id: "_design/cases",
  views: {
    by_name: {
      map: function(doc) {
        if (doc.type === "case") {
          emit(doc.name);
        }
      }.toString()
    }
  }
};

db
  .put(ddoc)
  .then(() => {
    console.log("Put new view in");
  })
  .catch(err => {
    console.log(err);
  });
db
  .query("cases/by_name", { include_docs: true, limit: 10 })
  .then(function(res) {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  });

window.db = db;
export default db;

export function setUserName(userName) {
  localStorage.setItem("userName", userName);
  const remoteDB = new PouchDB(serverUrl, { name: userName });
  remoteDB
    .get("id")
    .then(() => document.location.reload())
    .catch(() => document.location.reload());
}
