import dayjs from 'dayjs';
import { IMigHook } from '../../home/pages/HooksPage/types';
import { IMigPlan, IMigration, IPlan, IPlanSpecHook } from './types';

const convertMigHookToUIObject = (currentPlanHookRef: IPlanSpecHook, hookRef: IMigHook) => {
  const hookImageType = hookRef.spec.custom ? 'custom' : 'ansible';
  const customContainerImage = hookRef.spec.custom ? hookRef.spec.image : null;
  const ansibleRuntimeImage = !hookRef.spec.custom ? hookRef.spec.image : null;
  let ansibleFile;
  if (!hookRef.spec.custom) {
    ansibleFile = atob(hookRef.spec.playbook);
  }
  let srcServiceAccountName,
    srcServiceAccountNamespace,
    destServiceAccountName,
    destServiceAccountNamespace,
    clusterTypeText;

  if (currentPlanHookRef?.reference?.name === hookRef.metadata.name) {
    srcServiceAccountName =
      hookRef.spec.targetCluster === 'source' ? currentPlanHookRef.serviceAccount : null;
    srcServiceAccountNamespace =
      hookRef.spec.targetCluster === 'source' ? currentPlanHookRef.executionNamespace : null;
    destServiceAccountName =
      hookRef.spec.targetCluster === 'destination' ? currentPlanHookRef.serviceAccount : null;
    destServiceAccountNamespace =
      hookRef.spec.targetCluster === 'destination' ? currentPlanHookRef.executionNamespace : null;
    clusterTypeText =
      hookRef.spec.targetCluster === 'destination' ? 'Target cluster' : 'Source cluster';
  }

  const uiHookObject = {
    hookName: hookRef.metadata.name,
    hookImageType,
    customContainerImage,
    ansibleRuntimeImage,
    ansibleFile,
    clusterType: hookRef.spec.targetCluster,
    clusterTypeText: clusterTypeText,
    srcServiceAccountName,
    srcServiceAccountNamespace,
    destServiceAccountName,
    destServiceAccountNamespace,
    phase: currentPlanHookRef?.phase,
    image: hookRef.spec.image,
    custom: hookRef.spec.custom,
  };
  return uiHookObject;
};

export function groupPlans(
  migPlans: Array<any>,
  migMigrationRefs: Array<any>,
  migAnalyticRefs: Array<any>,
  migHookRefs: Array<IMigHook>
): any {
  return migPlans.map((mp: IMigPlan) => {
    const fullPlan: IPlan = {
      MigPlan: mp,
      Migrations: [],
      Analytics: [],
      Hooks: [],
    };
    if (migMigrationRefs.length > 0) {
      const matchingMigrations = migMigrationRefs.filter(
        (i) => i.kind === 'MigMigration' && i.spec.migPlanRef.name === mp.metadata.name
      );
      fullPlan['Migrations'] = matchingMigrations;
    } else {
      fullPlan['Migrations'] = [];
    }
    if (migAnalyticRefs.length > 0) {
      const matchingMigAnalytics = migAnalyticRefs.filter(
        (i) => i.kind === 'MigAnalytic' && i.spec.migPlanRef.name === mp.metadata.name
      );
      fullPlan['Analytics'] = matchingMigAnalytics;
    } else {
      fullPlan['Analytics'] = [];
    }
    if (migHookRefs.length > 0) {
      const currentPlanHooks = mp.spec.hooks;
      const associatedHooks: Array<any> = [];
      if (currentPlanHooks) {
        currentPlanHooks.forEach((currentPlanHookRef) =>
          migHookRefs.forEach((hookRef) => {
            if (currentPlanHookRef.reference.name === hookRef.metadata.name) {
              const uiHookObject = convertMigHookToUIObject(currentPlanHookRef, hookRef);
              associatedHooks.push(uiHookObject);
            }
          })
        );
      }

      fullPlan['Hooks'] = associatedHooks;
    } else {
      fullPlan['Hooks'] = [];
    }
    return fullPlan;
  });
}

const groupPlan: any = (plan: IPlan, response: any) => {
  const fullPlan: any = {
    MigPlan: plan.MigPlan,
    Migrations: [],
  };
  if (response.data.items.length > 0) {
    const sortMigrations = (migrationList: IMigration[]) =>
      migrationList.sort((left, right) => {
        return dayjs
          .utc(right.metadata.creationTimestamp)
          .diff(dayjs.utc(left.metadata.creationTimestamp));
      });

    const matchingMigrations: IMigration[] = response.data.items.filter(
      (i: IMigration) =>
        i.kind === 'MigMigration' && i.spec.migPlanRef.name === plan.MigPlan.metadata.name
    );

    fullPlan['Migrations'] = sortMigrations(matchingMigrations);
  } else {
    fullPlan['Migrations'] = [];
  }
  return fullPlan;
};
export default {
  convertMigHookToUIObject,
  groupPlan,
  groupPlans,
};
