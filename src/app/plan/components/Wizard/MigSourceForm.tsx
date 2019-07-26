/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import { Box, Flex, Text } from '@rebass/emotion';
import theme from '../../../../theme';
import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
import Select from 'react-select';
import NamespaceTable from './NameSpaceTable';
import Loader from 'react-loader-spinner';
import styled from '@emotion/styled';
import { css } from '@emotion/core';

const MigSourceForm = props => {
  const [srcClusterOptions, setSrcClusterOptions] = useState([]);
  const [selectedSrcCluster, setSelectedSrcCluster] = useState(null);
  const {
    clusterList,
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    isFetchingNamespaceList,
    fetchNamespacesForCluster,
    sourceClusterNamespaces
  } = props;

  useEffect(() => {
    if (clusterList.length) {
      const myOptions: any = [];
      const len = clusterList.length;
      for (let i = 0; i < len; i++) {
        if (clusterList[i].MigCluster.metadata.name !== 'host') {
          myOptions.push({
            label: clusterList[i].MigCluster.metadata.name,
            value: clusterList[i].MigCluster.metadata.name,
          });
        }
      }
      setSrcClusterOptions(myOptions);

      if (values.sourceCluster !== null) {
        const matchingCluster = clusterList.filter(
          c => c.MigCluster.metadata.name === values.sourceCluster
        );
        setSelectedSrcCluster(
          {
            label: matchingCluster[0].MigCluster.metadata.name,
            value: matchingCluster[0].MigCluster.metadata.name,
          }
        );
      }
    } else {
      const myOptions: any = [];
      myOptions.push({
        label: 'No Valid Clusters Found',
        value: 'N/A',
      });
      setSrcClusterOptions(myOptions);
    }

  }, [values]);


  const handleSourceChange = option => {
    setFieldValue('sourceCluster', option.value);
    const matchingCluster = clusterList.find(
      c => c.MigCluster.metadata.name === option.value
    );
    setSelectedSrcCluster({
      label: matchingCluster.MigCluster.metadata.name,
      value: matchingCluster.MigCluster.metadata.name,
    });
    setFieldTouched('sourceCluster');
    fetchNamespacesForCluster(matchingCluster.MigCluster.metadata.name);
  };
  return (
    <Box>
      <TextContent>
        <TextList component="dl">
          <TextListItem component="dt">Source Cluster</TextListItem>
          <Select
            css={css`
                width: 20em;
              `}
            name="sourceCluster"
            onChange={handleSourceChange}
            options={srcClusterOptions}
            value={selectedSrcCluster}
          />
          {errors.sourceCluster && touched.sourceCluster && (
            <div id="feedback">{errors.sourceCluster}</div>
          )}
        </TextList>
      </TextContent>
      {isFetchingNamespaceList ? (
        <Flex
          css={css`
              height: 100%;
              text-align: center;
            `}
        >
          <Box flex="1" m="auto">
            <Loader type="ThreeDots" color={theme.colors.navy} height="100" width="100" />
            <Text fontSize={[2, 3, 4]}> Discovering namespaces</Text>
          </Box>
        </Flex>
      ) : (
          <NamespaceTable
            setFieldValue={setFieldValue}
            values={values}
            sourceClusterNamespaces={sourceClusterNamespaces}
          />
        )}
    </Box>
  );
};

export default MigSourceForm;
