import moment from 'moment';

const getPlanPVs = plan => {
  const statusObj = { success: null, error: null };
  const PvsDiscoveredType = 'PvsDiscovered';

  if (plan.MigPlan.status) {
    const pvsDiscovered = !!plan.MigPlan.status.conditions.some(c => c.type === PvsDiscoveredType);

    if (pvsDiscovered) {
      statusObj.success = pvsDiscovered;
    }
  }

  return statusObj;
};


const getPlanStatus = plan => {
  const statusObj = { success: null, error: null };
  if (plan.MigPlan.status) {
    const hasReadyCondition = !!plan.MigPlan.status.conditions.some(c => c.type === 'Ready');
    if (hasReadyCondition) {
      statusObj.success = hasReadyCondition;
    }
  }
  return statusObj;
};

const getMigrationStatus = (plan, newResObject) => {
  const matchingMigration = plan.Migrations.find(
    s => s.metadata.name === newResObject.data.metadata.name
  );
  const statusObj = { success: null, error: null };

  if (matchingMigration && matchingMigration.status) {
    const hasSucceededCondition = !!matchingMigration.status.conditions.some(
      c => c.type === 'Succeeded'
    );
    statusObj.success = hasSucceededCondition;
    const hasErrorCondition = !!matchingMigration.status.conditions.some(c => c.type === 'Failed');
    statusObj.error = hasErrorCondition;
  }
  return statusObj;
};

function groupPlans(migPlans: any[], refs: any[]): any[] {
  return migPlans.map(mp => {
    const fullPlan = {
      MigPlan: mp,
    };
    if (refs[0].data.items.length > 0) {
      const matchingMigrations = refs[0].data.items.filter(
        i => i.kind === 'MigMigration' && i.spec.migPlanRef.name === mp.metadata.name
      );
      fullPlan['Migrations'] = matchingMigrations;
    } else {
      fullPlan['Migrations'] = [];
    }
    return fullPlan;
  });
}
const groupPlan: any = (plan, response) => {
  const fullPlan = {
    MigPlan: plan.MigPlan,
  };
  if (response.data.items.length > 0) {
    const sortMigrations = migrationList =>
      migrationList.sort((left, right) => {
        return moment
          .utc(right.metadata.creationTimestamp)
          .diff(moment.utc(left.metadata.creationTimestamp));
      });

    const matchingMigrations = response.data.items.filter(
      i => i.kind === 'MigMigration' && i.spec.migPlanRef.name === plan.MigPlan.metadata.name
    );

    fullPlan['Migrations'] = sortMigrations(matchingMigrations);
  } else {
    fullPlan['Migrations'] = [];
  }
  return fullPlan;
};

export default {
  getPlanPVs,
  getPlanStatus,
  getMigrationStatus,
  groupPlan,
  groupPlans,
};
