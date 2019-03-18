import { createActions } from "reduxsauce";

const { Creators, Types } = createActions({
  migrationClusterFetchSuccess: ["migrationClusterList"],
});

export { Creators, Types };
