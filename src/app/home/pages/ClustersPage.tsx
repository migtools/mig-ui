import React from 'react';
import { Card, PageSection } from '@patternfly/react-core';
import DetailViewComponent from '../DetailViewComponent';
import { DataListItems } from '../HomeComponent';

export const ClustersPage: React.FunctionComponent<{}> = () => (
  <PageSection>
    <Card>
      <DetailViewComponent expanded={{ [DataListItems.ClusterList]: true }} />
    </Card>
  </PageSection>
);
