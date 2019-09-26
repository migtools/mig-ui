/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import { css } from '@emotion/core';
import { Flex, Box, Text } from '@rebass/emotion';
import styled from '@emotion/styled';
import StatusIcon from '../../../common/components/StatusIcon';
import {
  Table,
  TableBody,
  TableHeader,
} from '@patternfly/react-table';
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
  Select,
  SelectOption,
} from '@patternfly/react-core';
import theme from '../../../../theme';
import ReactJson from 'react-json-view';
import { BlueprintIcon, WarningTriangleIcon } from '@patternfly/react-icons';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';

const VolumesTable = (props) => {
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

  const columns = [
    'PV Name',
    'Project',
    'Storage Class',
    'Size',
    'Claim',
    'Type',
    'Details'
  ];
  const [rows, setRows] = useState([]);
  const [selectedActionMap, setSelectedActionMap] = useState({});
  const [expandedDropdownMap, setExpandedDropdownMap] = useState({});

  const onSelect = (selection, index, pvName) => {
    const newExpandedMap = Object.assign({}, expandedDropdownMap);
    newExpandedMap[index] = !expandedDropdownMap[index];
    setExpandedDropdownMap(newExpandedMap);

    const newSelectedActionMap = Object.assign({}, selectedActionMap);
    const pvObj = {
      action: selection,
      name: pvName
    }
    newSelectedActionMap[index] = pvObj;
    setSelectedActionMap(newSelectedActionMap);
    const updatedPVFormValues = values.persistentVolumes.map((pv) => {
      if (pv.name === pvName) {
        pv.selection.action = selection
      }
      return pv;
    })
    setFieldValue('persistentVolumes', updatedPVFormValues);

  }

  const onToggle = (isOpen, index) => {
    const newExpandedMap = Object.assign({}, expandedDropdownMap);
    newExpandedMap[index] = !expandedDropdownMap[index];
    setExpandedDropdownMap(newExpandedMap);
  };


  const buildNewRows = () => {
    let selectedValue;
    let expandedValue;
    if (currentPlan) {
      const discoveredPersistentVolumes = currentPlan.spec.persistentVolumes || [];
      const getPVResources = (pvList = [], clusterName = '') => {
        getPVResourcesRequest(pvList, clusterName);
      };
      getPVResources(discoveredPersistentVolumes, values.sourceCluster);
      let mappedPVs;
      if (values.persistentVolumes) {
        mappedPVs = discoveredPersistentVolumes.map((planVolume, pvIndex) => {
          let pvAction = 'copy'; // Default to copy
          if (values.persistentVolumes.length !== 0) {
            const rowVal = values.persistentVolumes.find(v => v.name === planVolume.name);

            // //set initial pv map
            const newSelectedActionMap = Object.assign({}, selectedActionMap);

            if (rowVal && rowVal.selection && rowVal.selection.action) {
              const pvObj = {
                action: rowVal.selection.action,
                name: planVolume.name
              }
              newSelectedActionMap[pvIndex] = pvObj;
              setSelectedActionMap(newSelectedActionMap);
              selectedValue = 'copy';
              if (newSelectedActionMap[pvIndex] && newSelectedActionMap[pvIndex].action) {
                selectedValue = newSelectedActionMap[pvIndex].action
              }
              expandedValue = expandedDropdownMap[pvIndex] === true;
              const updatedPVFormValues = values.persistentVolumes.map((pv) => {
                if (pv.name === planVolume.name) {
                  pv.selection.action = rowVal.selection.action;
                }
                return pv;
              })
              setFieldValue('persistentVolumes', updatedPVFormValues);

            }
            else {
              const pvObj = {
                action: "copy",
                name: planVolume.name
              }
              newSelectedActionMap[pvIndex] = pvObj;
              setSelectedActionMap(newSelectedActionMap);
              selectedValue = 'copy';
              if (newSelectedActionMap[pvIndex] && newSelectedActionMap[pvIndex].action) {
                selectedValue = newSelectedActionMap[pvIndex].action
              }
              expandedValue = expandedDropdownMap[pvIndex] === true;

              const updatedPVFormValues = values.persistentVolumes.map((pv) => {
                if (pv.name === planVolume.name) {
                  pv.selection.action = "copy";
                }
                return pv;
              })
              setFieldValue('persistentVolumes', updatedPVFormValues);

            }
          }
          const pfSelectOptions = planVolume.supported.actions.map((action) => {
            return { value: action }
          });

          const matchingPVResource = pvResourceList.find(
            pvResource => pvResource.metadata.name === planVolume.name
          );


          const rowCells = [
            { title: planVolume.name },
            { title: planVolume.pvc.namespace },
            { title: planVolume.selection.storageClass || 'None' },
            { title: planVolume.capacity },
            { title: planVolume.pvc.name },
            {
              title: (
                <Select
                  selections={selectedValue}
                  isExpanded={expandedValue}
                  onToggle={(isOpen) => {
                    onToggle(isOpen, pvIndex)
                  }}
                  onSelect={(e, selection) => {
                    onSelect(selection, pvIndex, planVolume.name)
                  }}
                >
                  {pfSelectOptions.map((action, index) => {
                    return (
                      <SelectOption
                        key={index}
                        value={action.value}
                      >
                        {capitalize(action.value)}
                      </SelectOption>
                    )
                  })}
                </Select>

              ),

            },
            {
              title: (
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

              )
            }
          ];

          return {
            cells: rowCells
          };
        });
      } else {
        mappedPVs = discoveredPersistentVolumes.map(planVolume => {
          const pvAction = 'copy';
          const rowCells = [
            { title: planVolume.name },
            { title: planVolume.pvc.namespace },
            { title: planVolume.selection.storageClass || '' },
            { title: planVolume.capacity },
            { title: planVolume.pvc.name },
            { title: pvAction },
            { title: '' }
          ];

          return {
            cells: rowCells
          };

        });
      }
      return mappedPVs;
    }
    return [];
  };


  useEffect(() => {
    const newRows = buildNewRows();
    setRows(newRows);
  }, [currentPlan, isFetchingPVList, expandedDropdownMap]);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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
    <Table
      aria-label="volumes-table"
      cells={columns}
      rows={rows}
      className="pf-m-vertical-align-content-center"
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};

export default VolumesTable;
