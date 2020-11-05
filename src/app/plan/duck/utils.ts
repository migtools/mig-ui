import dayjs from 'dayjs';

function groupPlans(migPlans: any[], migMigrationRefs: any[], migAnalyticRefs: any[]): any[] {
  return migPlans.map((mp) => {
    const fullPlan = {
      MigPlan: mp,
    };
    if (migMigrationRefs[0].data.items.length > 0) {
      const matchingMigrations = migMigrationRefs[0].data.items.filter(
        (i) => i.kind === 'MigMigration' && i.spec.migPlanRef.name === mp.metadata.name
      );
      fullPlan['Migrations'] = matchingMigrations;
    } else {
      fullPlan['Migrations'] = [];
    }
    if (migAnalyticRefs[0].data.items.length > 0) {
      const matchingMigAnalytics = migAnalyticRefs[0].data.items.filter(
        (i) => i.kind === 'MigAnalytic' && i.spec.migPlanRef.name === mp.metadata.name
      );
      fullPlan['Analytics'] = matchingMigAnalytics;
    } else {
      fullPlan['Analytics'] = [];
    }
    return fullPlan;
  });
}
const groupPlan: any = (plan, response) => {
  const fullPlan = {
    ...plan.MigPlan,
  };
  if (response.data.items.length > 0) {
    const sortMigrations = (migrationList) =>
      migrationList.sort((left, right) => {
        return dayjs
          .utc(right.metadata.creationTimestamp)
          .diff(dayjs.utc(left.metadata.creationTimestamp));
      });

    const matchingMigrations = response.data.items.filter(
      (i) => i.kind === 'MigMigration' && i.spec.migPlanRef.name === plan.MigPlan.metadata.name
    );

    fullPlan['Migrations'] = sortMigrations(matchingMigrations);
  } else {
    fullPlan['Migrations'] = [];
  }
  return fullPlan;
};

export default {
  groupPlan,
  groupPlans,
};
