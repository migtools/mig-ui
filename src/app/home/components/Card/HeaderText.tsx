import React from 'react';

const HeaderText = ({ type, dataList, ...props }) => {
  const clusterText =
    dataList.length === 1 ? `${dataList.length} Cluster` : `${dataList.length} Clusters`;
  const storageText =
    dataList.length === 1
      ? `${dataList.length} Replication Repository`
      : `${dataList.length} Replication Repositories`;
  const planText =
    dataList.length === 1
      ? `${dataList.length} Migration Plan`
      : `${dataList.length} Migration Plans`;
  return (
    <React.Fragment>
      {type === 'clusters' && clusterText}
      {type === 'repositories' && storageText}
      {type === 'plans' && planText}
    </React.Fragment>
  );
};

export default HeaderText;
