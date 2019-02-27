import { authentication } from "./authentication.reducer";
import { alert } from "./alert.reducer";
import { createStore, combineReducers } from "redux";

const rootReducer = combineReducers({
  authentication,
  alert
});

export default rootReducer;
