import { createActions } from "reduxsauce";

const { Creators, Types } = createActions({
  logout: [],
  requestToken: [],
  receiveToken: ["token", "username"]
});

export { Creators, Types };
