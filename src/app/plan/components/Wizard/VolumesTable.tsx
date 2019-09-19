/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Select from 'react-select';
import { css } from '@emotion/core';
import { Flex, Box, Text } from '@rebass/emotion';
import styled from '@emotion/styled';
import StatusIcon from '../../../common/components/StatusIcon';
import {
  Bullseye,
  TextContent,
  Popover,
  PopoverPosition,
  Title,
  Button,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateBody,
} from '@patternfly/react-core';
import theme from '../../../../theme';
import ReactJson from 'react-json-view';
import { BlueprintIcon, WarningTriangleIcon } from '@patternfly/react-icons';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';

const capitalize = (s: string) => {
  if (s.charAt(0)) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  } else {
    return s;
  }
};

const VolumesTable = (props): any => {
  const {
    setFieldValue,
    currentPlan,
    values,
    isPVError,
    isFetchingPVList,
    getPVResourcesRequest,
    isFetchingPVResources,
    pvResourceList,
    isEdit
  } = props;
  const [rows, setRows] = useState([]);

  const handleTypeChange = (row, option) => {
    updateTableData(row.index, option.value);
  };

  const updateTableData = (rowIndex, updatedValue) => {
    const rowsCopy = [...rows];
    if (currentPlan !== null && values.persistentVolumes) {
      const updatedRow = { ...rowsCopy[rowIndex], type: updatedValue };

      rowsCopy[rowIndex] = updatedRow;
    }

    setRows(rowsCopy);
    setFieldValue('persistentVolumes', rowsCopy);
  };

  const getPVResources = (pvList = [], clusterName = '') => {
    getPVResourcesRequest(pvList, clusterName);
  };

  useEffect(() => {
    if (currentPlan) {
      const discoveredPersistentVolumes = currentPlan.spec.persistentVolumes || [];
      getPVResources(discoveredPersistentVolumes, values.sourceCluster);
      let mappedPVs;
      if (values.persistentVolumes) {
        mappedPVs = discoveredPersistentVolumes.map(planVolume => {
          let pvAction = 'copy'; // Default to copy
          if (values.persistentVolumes.length !== 0) {
            const rowVal = values.persistentVolumes.find(v => v.name === planVolume.name);
            if (rowVal && rowVal.selection) {
              pvAction = rowVal.selection.action;
            }
            else {
              pvAction = rowVal.type;
            }
          }
          return {
            name: planVolume.name,
            project: planVolume.pvc.namespace,
            storageClass: planVolume.selection.storageClass || 'None',
            size: planVolume.capacity,
            claim: planVolume.pvc.name,
            type: pvAction,
            details: '',
            supportedActions: planVolume.supported.actions,
          };
        });
      } else {
        mappedPVs = discoveredPersistentVolumes.map(planVolume => {
          const pvAction = 'copy'; // Default to copy
          return {
            name: planVolume.name,
            project: planVolume.pvc.namespace,
            storageClass: planVolume.selection.storageClass || '',
            size: planVolume.capacity,
            claim: planVolume.pvc.name,
            type: pvAction,
            details: '',
            supportedActions: planVolume.supported.actions,
          };
        });
      }
      setFieldValue('persistentVolumes', mappedPVs);
      setRows(mappedPVs);
    }
  }, [currentPlan, isFetchingPVList]); // Only re-run the effect if fetching value changes

  const StyledTextContent = styled(TextContent)`
    margin: 1em 0 1em 0;
  `;

  //TODO: added this component level error state to handle the case of no PVs
  // showing up after 3 checks of the interval. When the isPVError flag is checked,
  // the volumes form will show this error. Need to add redux actions & state to encapsulate
  // validation so that this error state enables the user to go to next page( that possibly
  // shows a different set of forms catered to stateless apps)

  if (isPVError) {
    return (
      <Box
        css={css`
          text-align: center;
        `}
      >
        <StyledTextContent>
          <Text color={theme.colors.statusRed} fontSize={[2, 3, 4]}>
            <StatusIcon isReady={false} />
            Unable to find PVs
          </Text>
        </StyledTextContent>
      </Box>
    );
  }
  if (isFetchingPVList) {
    return (
      <Bullseye>
        <EmptyState variant="large">
          <div className="pf-c-empty-state__icon">
            <Spinner size="xl" />
          </div>
          <Title headingLevel="h2" size="xl">
            Discovering persistent volumes attached to source projects...
          </Title>
        </EmptyState>
      </Bullseye>
    );
  }

  return (
    <ReactTable
      css={css`
            font-size: 14px;
            .rt-td{
              margin: auto 0;
            }
      `}
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
              onChange={(option: any) => handleTypeChange(row, option)}
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
          textAlign: 'left',
          Cell: row => {
            const matchingPVResource = pvResourceList.find(
              pvResource => pvResource.metadata.name === row.original.name
            );
            return (
              <Popover
                css={css`
                      overflow-y: scroll;
                      max-height: 20rem;
                      width: 40rem;
                `}
                position={PopoverPosition.bottom}
                bodyContent={
                  <React.Fragment>
                    {matchingPVResource ?
                      <ReactJson src={matchingPVResource} enableClipboard={false} /> :
                      <EmptyState variant={EmptyStateVariant.small}>
                        <EmptyStateIcon icon={WarningTriangleIcon} />
                        <Title headingLevel="h5" size="sm">
                          No PV data found
                      </Title>
                        <EmptyStateBody>
                          Unable to retrieve PV data
                      </EmptyStateBody>
                      </EmptyState>
                    }
                  </React.Fragment>
                }
                aria-label="pv-details"
                closeBtnAriaLabel="close-pv-details"
                maxWidth="200rem"
              >
                <Flex>
                  <Box>
                    <Button isDisabled={isFetchingPVResources} variant="link" icon={<BlueprintIcon />}>
                      View JSON
                    </Button>
                  </Box>
                </Flex>
              </Popover>
            );
          },
        },
      ]}
      defaultPageSize={5}
      className="-striped -highlight"
    />
  );
};

export default VolumesTable;
