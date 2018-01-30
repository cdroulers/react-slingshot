import * as types from "../constants/actionTypes";
import db from "../data/db";

import { getFormattedDateTime } from "../utils/dates";

// example of a thunk using the redux-thunk middleware
export function saveFuelSavings(settings) {
  return function(dispatch) {
    dispatch({
      type: types.SAVING_FUEL_SAVINGS
    });
    return db
      .get("all")
      .then(oldDoc => {
        return withDoc(oldDoc, settings, dispatch);
      })
      .catch(() => {
        return withDoc({}, settings, dispatch);
      });
  };
}

function withDoc(oldDoc, settings, dispatch) {
  const doc = {
    _id: "all",
    _rev: oldDoc._rev,
    savings: settings
  };
  return db.put(doc).then(() => {
    return dispatch({
      type: types.SAVE_FUEL_SAVINGS,
      dateModified: getFormattedDateTime(),
      settings
    });
  });
}

export function loadFuelSavings() {
  return dispatch => {
    dispatch({
      type: types.LOADING_FUEL_SAVINGS
    });
    return db
      .get("all")
      .then(doc => {
        return dispatch({
          type: types.LOAD_FUEL_SAVINGS,
          settings: doc.savings
        });
      })
      .catch(() => {});
  };
}

export function calculateFuelSavings(settings, fieldName, value) {
  return {
    type: types.CALCULATE_FUEL_SAVINGS,
    dateModified: getFormattedDateTime(),
    settings,
    fieldName,
    value
  };
}
