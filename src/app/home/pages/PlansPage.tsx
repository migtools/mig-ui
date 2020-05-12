import React from 'react';
import { Card, PageSection } from '@patternfly/react-core';
import DetailViewComponent from '../DetailViewComponent';
import { DataListItems } from '../HomeComponent';

export const PlansPage: React.FunctionComponent<{}> = () => (
  <PageSection>
    <Card>
      <DetailViewComponent expanded={{ [DataListItems.PlanList]: true }} />
    </Card>
  </PageSection>
);
