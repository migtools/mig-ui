import { createSelector } from 'reselect';
import { IReduxState } from '../../../reducers';

const planSelector = (state: IReduxState) => state.plan.migPlanList.map((p) => p);
const tokenSelector = (state: IReduxState) => state.token.tokenList.map((t) => t);

const getTokensWithStatus = createSelector([planSelector, tokenSelector], (plans, tokens) => {
  const tokensWithStatus = tokens.map((token) => {
    const isAssociatedPlans = plans.some(
      (plan) =>
        (plan.MigPlan.spec.destMigTokenRef &&
          plan.MigPlan.spec.destMigTokenRef.name === token.MigToken.metadata.name) ||
        (plan.MigPlan.spec.srcMigTokenRef &&
          plan.MigPlan.spec.srcMigTokenRef.name === token.MigToken.metadata.name)
    );
    return { ...token, isAssociatedPlans: isAssociatedPlans };
  });
  return tokensWithStatus;
});
export default {
  getTokensWithStatus,
};
