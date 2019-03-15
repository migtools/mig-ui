import { combineReducers } from "redux";
import homeReducer from "./app/home/duck";
import authReducer from "./app/auth/duck";
import commonReducer from "./app/common/duck";
import { connectRouter } from "connected-react-router";
import { history } from "./helpers";

const rootReducer = combineReducers({
  router: connectRouter(history),
  home: homeReducer,
  auth: authReducer,
  common: commonReducer
});

export default rootReducer;
