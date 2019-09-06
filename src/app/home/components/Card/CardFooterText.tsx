import React from 'react';
import '../../DetailViewComponent';

const expandRefs = {
  'clusters': '#cluster-toggle',
  'repositories': '#storage-toggle',
  'plans': '#plan-toggle',
};

const FooterText = ({ type, dataList, expandDetails }) => {
  const clusterText =
    dataList.length === 1
      ? `View ${dataList.length} Cluster`
      : `View all ${dataList.length} Clusters`;
  const storageText =
    dataList.length === 1
      ? `View ${dataList.length} Repository`
      : `View all ${dataList.length} Repositories`;
  const planText =
    dataList.length === 1 ? `View ${dataList.length} Plan` : `View all ${dataList.length} Plans`;
  return (
    <a href={expandRefs[type]} onClick={expandDetails}>
      {type === 'clusters' && clusterText}
      {type === 'repositories' && storageText}
      {type === 'plans' && planText}
    </a>
  );
};

export default FooterText;
