import { createActions } from "reduxsauce";

const { Creators, Types } = createActions({
  alertSuccess: ["success"],
  alertError: ["error"],
  alertClear: []
});

export { Creators, Types };
