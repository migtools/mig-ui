import { createActions } from "reduxsauce";

const { Creators, Types } = createActions({
  migrationPlanFetchSuccess: ["migrationPlanList"],
  addPlanSuccess: ["newPlan"],
  addPlanFailure: ["error"],
  removePlanSuccess: ["id"]
});

export { Creators, Types };
