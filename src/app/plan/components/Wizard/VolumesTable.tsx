/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { css } from '@emotion/core';
import { Flex, Box, Text } from '@rebass/emotion';
import styled from '@emotion/styled';
import StatusIcon from '../../../common/components/StatusIcon';
import {
  Table,
  TableBody,
  TableHeader,
  cellWidth
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
  SelectVariant,
} from '@patternfly/react-core';
import theme from '../../../../theme';
import ReactJson from 'react-json-view';
import { BlueprintIcon, WarningTriangleIcon } from '@patternfly/react-icons';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';
import { isPlaceholder } from '@babel/types';

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
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isToggleIcon, setToggleIcon] = useState(false);
  const [selected, setSelected] = useState(null);
  const [expandedDropdownMap, setExpandedDropdownMap] = useState({});

  const columns = [
    'PV Name',
    'Project',
    'Storage Class',
    'Size',
    'Claim',
    'Type',
    'Details'
  ];

  const onToggle = (isOpen, index) => {
    const newSelected = Object.assign({}, expandedDropdownMap);
    newSelected[index] = !expandedDropdownMap[index];
    setExpandedDropdownMap(newSelected);
  };


  const buildNewRows = () => {
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
            if (rowVal && rowVal.selection) {
              pvAction = rowVal.selection.action;
            }
            else {
              pvAction = 'copy'; // Default to copy
              // pvAction = rowVal.type;
            }
          }
          const pfSelectOptionsWithPlaceholder = planVolume.supported.actions.map((action, index) => {
            return { value: action }
          });
          // pfSelectOptionsWithPlaceholder.push({ value: 'Choose action...', isPlaceholder: true })

          const rowCells = [
            { title: planVolume.name },
            { title: planVolume.pvc.namespace },
            { title: planVolume.selection.storageClass || 'None' },
            { title: planVolume.capacity },
            { title: planVolume.pvc.name },
            {
              title: (
                <Select
                  selections={selected}
                  isExpanded={expandedDropdownMap[pvIndex] === true}
                  onToggle={(isOpen) => {
                    onToggle(isOpen, pvIndex)
                  }}
                  onSelect={(e, selection) => {
                    onSelect(e, selection)
                  }}
                >
                  {pfSelectOptionsWithPlaceholder.map((action, index) => {
                    // console.log('supported Actions', row.original.supportedActions, action)
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

              )
            },
            { title: '' }
            // { title: pfSelectOptionsWithPlaceholder }
          ];
          return {
            cells: rowCells
          };
        });
      } else {
        mappedPVs = discoveredPersistentVolumes.map(planVolume => {
          const pvAction = 'copy'; // Default to copy
          const pfSelectOptionsWithPlaceholder = planVolume.supported.actions.map((action, index) => {
            return { value: action }
          });
          pfSelectOptionsWithPlaceholder.push({ value: 'Choose action...', isPlaceholder: true })
          const rowCells = [
            { title: planVolume.name },
            { title: planVolume.pvc.namespace },
            { title: planVolume.selection.storageClass || '' },
            { title: planVolume.capacity },
            { title: planVolume.pvc.name },
            { title: pvAction },
            { title: '' }
            // { pfSelectOptionsWithPlaceholder }
          ];
          return {
            cells: rowCells
          };

        });
      }
      setFieldValue('persistentVolumes', mappedPVs);
      // setRows(mappedPVs);
      return mappedPVs;
    }
    return [];
  };


  useEffect(() => {
    const newRows = buildNewRows();
    setRows(newRows);
  }, [currentPlan, isFetchingPVList, expandedDropdownMap]);
  // useEffect(() => {
  // }, [currentPlan, isFetchingPVList]); // Only re-run the effect if fetching value changes

  // columns={[
  //   {
  //     Header: () => (
  //       <div
  //         style={{
  //           textAlign: 'left',
  //           fontWeight: 600,
  //         }}
  //       >
  //         PV Name
  //       </div>
  //     ),
  //     accessor: 'name',
  //     width: 180,
  //   },
  //   {
  //     Header: () => (
  //       <div
  //         style={{
  //           textAlign: 'left',
  //           fontWeight: 600,
  //         }}
  //       >
  //         Project
  //       </div>
  //     ),
  //     accessor: 'project',
  //     width: 150,
  //   },
  //   {
  //     Header: () => (
  //       <div
  //         style={{
  //           textAlign: 'left',
  //           fontWeight: 600,
  //         }}
  //       >
  //         Storage Class
  //       </div>
  //     ),
  //     accessor: 'storageClass',
  //     width: 150,
  //   },
  //   {
  //     Header: () => (
  //       <div
  //         style={{
  //           textAlign: 'left',
  //           fontWeight: 600,
  //         }}
  //       >
  //         Size
  //       </div>
  //     ),
  //     accessor: 'size',
  //     width: 75,
  //   },
  //   {
  //     Header: () => (
  //       <div
  //         style={{
  //           textAlign: 'left',
  //           fontWeight: 600,
  //         }}
  //       >
  //         Claim
  //       </div>
  //     ),
  //     accessor: 'claim',
  //     width: 180,
  //   },
  //   {
  //     Header: () => (
  //       <div
  //         style={{
  //           textAlign: 'left',
  //           fontWeight: 600,
  //         }}
  //       >
  //         Type
  //       </div>
  //     ),
  //     accessor: 'type',
  //     width: 120,
  //     style: { overflow: 'visible' },
  //     Cell: row => (
  //       <Select
  //         selections={selected}
  //         isExpanded={isDropdownOpen}
  //         onToggle={onToggle}
  //         onSelect={(e, selection) => {
  //           console.log('on select', e)
  //           onSelect(e, row, selection)
  //         }}
  //       >
  //         {row.original.supportedActions.map((action, index) => {
  //           // console.log('supported Actions', row.original.supportedActions, action)
  //           return (
  //             <SelectOption
  //               key={index}
  //               value={action.value}
  //             >
  //               {/* {capitalize(action.value)} */}
  //             </SelectOption>
  //           )
  //         })}
  //       </Select>
  //     ),
  //   },
  //   {
  //     Header: () => (
  //       <div
  //         style={{
  //           textAlign: 'left',
  //           fontWeight: 600,
  //         }}
  //       >
  //         Details
  //       </div>
  //     ),
  //     accessor: 'details',
  //     width: 200,
  //     resizable: false,
  //     textAlign: 'left',
  //     Cell: row => {
  //       const matchingPVResource = pvResourceList.find(
  //         pvResource => pvResource.metadata.name === row.original.name
  //       );
  //       return (
  //         <Popover
  //           css={css`
  //                 overflow-y: scroll;
  //                 max-height: 20rem;
  //                 width: 40rem;
  //           `}
  //           position={PopoverPosition.bottom}
  //           bodyContent={
  //             <React.Fragment>
  //               {matchingPVResource ?
  //                 <ReactJson src={matchingPVResource} enableClipboard={false} /> :
  //                 <EmptyState variant={EmptyStateVariant.small}>
  //                   <EmptyStateIcon icon={WarningTriangleIcon} />
  //                   <Title headingLevel="h5" size="sm">
  //                     No PV data found
  //                 </Title>
  //                   <EmptyStateBody>
  //                     Unable to retrieve PV data
  //                 </EmptyStateBody>
  //                 </EmptyState>
  //               }
  //             </React.Fragment>
  //           }
  //           aria-label="pv-details"
  //           closeBtnAriaLabel="close-pv-details"
  //           maxWidth="200rem"
  //         >
  //           <Flex>
  //             <Box>
  //               <Button isDisabled={isFetchingPVResources} variant="link" icon={<BlueprintIcon />}>
  //                 View JSON
  //               </Button>
  //             </Box>
  //           </Flex>
  //         </Popover>
  //       );
  //     },
  //   },
  // ]}

  // const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // const updateTableData = (rowIndex, updatedValue) => {
  //   const rowsCopy = [...rows];
  //   if (currentPlan !== null && values.persistentVolumes) {
  //     const updatedRow = { ...rowsCopy[rowIndex], type: updatedValue };

  //     rowsCopy[rowIndex] = updatedRow;
  //   }

  //   setRows(rowsCopy);
  //   setFieldValue('persistentVolumes', rowsCopy);
  // };




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


  // const onSelect = (e, row, selection) => {
  //   setDropdownOpen(!isDropdownOpen);
  //   updateTableData(row.index, selection);
  //   setSelected(selection);
  // };


  const clearSelection = () => {
    setDropdownOpen(false);
    setSelected(null);
  };

  const onSelect = (event, selection) => {
    console.log('selection', selection)
    setDropdownOpen(!isDropdownOpen);
    // updateTableData(row.index, selection);
    setSelected(selection);
    //   updateTableData(row.index, selection);
  }


  return (
    <Table
      aria-label="migrations-history-table"
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
