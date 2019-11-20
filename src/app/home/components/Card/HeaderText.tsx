import React from 'react';

const HeaderText = ({ type, dataList, ...props }) => {
  const clusterText =
    dataList.length === 1 ? `${dataList.length} Cluster` : `${dataList.length} Clusters`;
  const storageText =
    dataList.length === 1
      ? `${dataList.length} Replication repository`
      : `${dataList.length} Replication repositories`;
  const planText =
    dataList.length === 1
      ? `${dataList.length} Migration plan`
      : `${dataList.length} Migration plans`;
  return (
    <React.Fragment>
      {type === 'clusters' && clusterText}
      {type === 'repositories' && storageText}
      {type === 'plans' && planText}
    </React.Fragment>
  );
};

export default HeaderText;
