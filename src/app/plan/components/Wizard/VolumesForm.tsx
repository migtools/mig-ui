import React, { useEffect } from 'react';
import VolumesTable from './VolumesTable';

const VolumesForm = props => {
  const {
    setFieldValue,
    values,
    isPVError,
    currentPlan,
    currentPlanStatus,
    getPVResourcesRequest,
    pvResourceList,
    isFetchingPVResources,
    isEdit,
    planUpdateRequest,
    isPollingStatus,
  } = props;

  useEffect(() => {
    //kick off pv discovery once volumes form is reached with current selected namespaces
    let isRerunPVDiscovery = null;
    if (currentPlan) {
      isRerunPVDiscovery = true;
      planUpdateRequest(values, isRerunPVDiscovery);
    } else {
      planUpdateRequest(values, isRerunPVDiscovery);
    }
  }, []);

  return (
    <VolumesTable
      isEdit={isEdit}
      isPVError={isPVError}
      setFieldValue={setFieldValue}
      values={values}
      currentPlan={currentPlan}
      currentPlanStatus={currentPlanStatus}
      getPVResourcesRequest={getPVResourcesRequest}
      pvResourceList={pvResourceList}
      isFetchingPVResources={isFetchingPVResources}
      isPollingStatus={isPollingStatus}
    />
  );
};
export default VolumesForm;
