import React from 'react';
import '../../DetailViewComponent';

const expandRefs = {
  'clusters': '#cluster-toggle',
  'repositories': '#storage-toggle',
  'plans': '#plan-toggle',
};

const FooterText = ({ type, expandDetails }) => {
  const clusterText = 'View Clusters';
  const storageText = 'View repositories';
  const planText = 'View Plans';
  return (
    <a href={expandRefs[type]} onClick={expandDetails}>
      {type === 'clusters' && clusterText}
      {type === 'repositories' && storageText}
      {type === 'plans' && planText}
    </a>
  );
};

export default FooterText;
