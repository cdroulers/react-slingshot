import {
  SAVE_FUEL_SAVINGS,
  SAVING_FUEL_SAVINGS,
  LOAD_FUEL_SAVINGS,
  LOADING_FUEL_SAVINGS,
  CALCULATE_FUEL_SAVINGS
} from "../constants/actionTypes";
import {
  necessaryDataIsProvidedToCalculateSavings,
  calculateSavings
} from "../utils/fuelSavings";
import objectAssign from "object-assign";
import initialState from "./initialState";

// IMPORTANT: Note that with Redux, state should NEVER be changed.
// State is considered immutable. Instead,
// create a copy of the state passed and set new values on the copy.
// Note that I'm using Object.assign to create a copy of current state
// and update values on the copy.
export default function fuelSavingsReducer(
  state = initialState.fuelSavings,
  action
) {
  let newState;

  switch (action.type) {
    case SAVING_FUEL_SAVINGS:
      return objectAssign({}, state, { saving: true });
    case SAVE_FUEL_SAVINGS:
      return objectAssign({}, state, { saving: false, dateModified: action.dateModified });

    case LOADING_FUEL_SAVINGS:
      return objectAssign({}, state, { loading: true });
    case LOAD_FUEL_SAVINGS:
      return objectAssign({}, state, { ...action.settings, loading: false });

    case CALCULATE_FUEL_SAVINGS:
      newState = objectAssign({}, state);
      newState[action.fieldName] = action.value;
      newState.necessaryDataIsProvidedToCalculateSavings = necessaryDataIsProvidedToCalculateSavings(
        newState
      );
      newState.dateModified = action.dateModified;

      if (newState.necessaryDataIsProvidedToCalculateSavings) {
        newState.savings = calculateSavings(newState);
      }

      return newState;

    default:
      return state;
  }
}
