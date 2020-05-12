import React from 'react';
import { Card, PageSection } from '@patternfly/react-core';
import DetailViewComponent from '../DetailViewComponent';
import { DataListItems } from '../HomeComponent';

export const StoragesPage: React.FunctionComponent<{}> = () => (
  <PageSection>
    <Card>
      <DetailViewComponent expanded={{ [DataListItems.StorageList]: true }} />
    </Card>
  </PageSection>
);
