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
      ? `View cluster`
      : `View clusters`;
  const storageText =
    dataList.length === 1
      ? `View repository`
      : `View repositories`;
  const planText =
    dataList.length === 1 ? `View plan` : `View plans`;
  return (
    <a href={expandRefs[type]} onClick={expandDetails}>
      {type === 'clusters' && clusterText}
      {type === 'repositories' && storageText}
      {type === 'plans' && planText}
    </a>
  );
};

export default FooterText;
