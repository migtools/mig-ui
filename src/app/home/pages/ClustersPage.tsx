import React from 'react';
import { Card } from '@patternfly/react-core';
import DetailViewComponent from '../DetailViewComponent';
import { DataListItems } from '../HomeComponent';

export const ClustersPage: React.FunctionComponent<{}> = () => (
  <Card>
    <DetailViewComponent expanded={{ [DataListItems.ClusterList]: true }} />
  </Card>
);
