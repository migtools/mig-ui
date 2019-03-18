import fetch from "cross-fetch";
import { Creators } from "./actions";
const alertSuccess = Creators.alertSuccess;
const alertError = Creators.alertError;
const alertClear = Creators.alertClear;
export default {
  alertSuccess,
  alertError,
  alertClear,
};
