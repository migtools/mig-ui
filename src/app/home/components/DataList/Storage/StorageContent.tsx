import React from 'react';
import {
    DataList,
    DataListContent,
} from '@patternfly/react-core';
import StorageItem from './StorageItem';

const StorageContent = ({ dataList, isLoading, isExpanded, associatedPlans, ...props }) => {
    return (
        <DataListContent
            noPadding
            aria-label="storage-items-content-container"
            isHidden={!isExpanded}
        >
            <DataList aria-label="storage-item-list">
                {dataList.map((storage, storageIndex) => {
                    return (
                        <StorageItem
                            key={storageIndex}
                            isLoading
                            storage={storage}
                            storageIndex={storageIndex}
                            associatedPlans={associatedPlans}
                        />
                    );
                })}
            </DataList>
        </DataListContent>
    );
};
export default StorageContent;
