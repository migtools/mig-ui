import React from 'react';
import {
  Button,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Popover,
  PopoverPosition,
  Text,
  TextContent,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

const styles = require('./TreeWarningsGrid.module').default;

interface ITreeWarningsGridProps {
  warningTextArr: any[];
}

const TreeWarningsGrid: React.FunctionComponent<ITreeWarningsGridProps> = ({
  warningTextArr,
}: ITreeWarningsGridProps) => (
  <>
    <Title headingLevel="h2" size="xl">
      <span className={spacing.mlMd}>Warning list:</span>
    </Title>
    <Grid
      hasGutter
      className={`${styles.conditionsGrid} ${spacing.mtMd} ${spacing.mxAuto} ${spacing.mbLg}`}
    >
      {warningTextArr.map((warningText, warningTextIndex) => (
        <React.Fragment key={warningTextIndex}>
          <GridItem span={1} className={alignment.textAlignRight}>
            <span className="pf-c-icon pf-m-warning">
              <ExclamationTriangleIcon size={'sm'} />
            </span>
          </GridItem>
          <GridItem span={11}>
            <Flex>
              <FlexItem>
                <span id="warning-message">{warningText}</span>
              </FlexItem>
            </Flex>
          </GridItem>
        </React.Fragment>
      ))}
    </Grid>
  </>
);

export default TreeWarningsGrid;
