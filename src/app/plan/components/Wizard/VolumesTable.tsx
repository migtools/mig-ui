import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Select from 'react-select';
import {
  TextContent,
  Text,
  TextVariants,
  Popover,
  PopoverPosition,
  Title,
  Button,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateBody,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import ReactJson from 'react-json-view';
import { BlueprintIcon, WarningTriangleIcon } from '@patternfly/react-icons';

const styles = require('./VolumesTable.module');
const classNames = require('classnames');

const capitalize = (s: string) => {
  if (s.charAt(0)) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  } else {
    return s;
  }
};

const VolumesTable = (props): any => {
  // TODO add a typescript interface for these props
  const { isFetchingPVResources, pvResourceList, rows, onTypeChange } = props;

  const { volumesTableStyle } = styles;
  const tableClass = classNames('-striped', '-highlight', { volumesTableStyle });
  return (
    <Grid gutter="md">
      <GridItem>
        <TextContent>
          <Text component={TextVariants.p}>Choose to move or copy persistent volumes:</Text>
        </TextContent>
      </GridItem>
      <GridItem>
        <ReactTable
          className={tableClass}
          data={rows}
          columns={[
            {
              Header: () => (
                <div
                  style={{
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  PV Name
                </div>
              ),
              accessor: 'name',
              width: 180,
            },
            {
              Header: () => (
                <div
                  style={{
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Project
                </div>
              ),
              accessor: 'project',
              width: 150,
            },
            {
              Header: () => (
                <div
                  style={{
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Storage Class
                </div>
              ),
              accessor: 'storageClass',
              width: 150,
            },
            {
              Header: () => (
                <div
                  style={{
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Size
                </div>
              ),
              accessor: 'size',
              width: 75,
            },
            {
              Header: () => (
                <div
                  style={{
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Claim
                </div>
              ),
              accessor: 'claim',
              width: 180,
            },
            {
              Header: () => (
                <div
                  style={{
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Type
                </div>
              ),
              accessor: 'type',
              width: 120,
              style: { overflow: 'visible' },
              Cell: row => (
                <Select
                  onChange={(option: any) => onTypeChange(row.index, option.value)}
                  options={row.original.supportedActions.map((a: string) => {
                    // NOTE: Each PV may not support all actions (any at all even),
                    // we need to inspect the PV to determine this
                    return { value: a, label: capitalize(a) };
                  })}
                  name="persistentVolumes"
                  value={{
                    label: capitalize(row.original.type),
                    value: row.original.type,
                  }}
                />
              ),
            },
            {
              Header: () => (
                <div
                  style={{
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Details
                </div>
              ),
              accessor: 'details',
              width: 200,
              resizable: false,
              Cell: row => {
                const matchingPVResource = pvResourceList.find(
                  pvResource => pvResource.name === row.original.name
                );
                return (
                  <Popover
                    className={styles.popoverStyle}
                    position={PopoverPosition.bottom}
                    bodyContent={
                      <React.Fragment>
                        {matchingPVResource ? (
                          <ReactJson src={matchingPVResource} enableClipboard={false} />
                        ) : (
                          <EmptyState variant={EmptyStateVariant.small}>
                            <EmptyStateIcon icon={WarningTriangleIcon} />
                            <Title headingLevel="h5" size="sm">
                              No PV data found
                            </Title>
                            <EmptyStateBody>Unable to retrieve PV data</EmptyStateBody>
                          </EmptyState>
                        )}
                      </React.Fragment>
                    }
                    aria-label="pv-details"
                    closeBtnAriaLabel="close-pv-details"
                    maxWidth="200rem"
                  >
                    <Grid gutter="md">
                      <GridItem>
                        <Button
                          isDisabled={isFetchingPVResources}
                          variant="link"
                          icon={<BlueprintIcon />}
                        >
                          View JSON
                        </Button>
                      </GridItem>
                    </Grid>
                  </Popover>
                );
              },
            },
          ]}
          defaultPageSize={5}
        />
      </GridItem>
    </Grid>
  );
};

export default VolumesTable;
