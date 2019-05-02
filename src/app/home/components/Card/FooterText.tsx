import React from 'react';

const FooterText = ({ type, dataList, ...props }) => {
    const clusterText = dataList.length === 1 ? `View ${dataList.length} Cluster`
        :
        `View all ${dataList.length} Clusters`;
    const storageText = dataList.length === 1 ? `View ${dataList.length} Repository`
        :
        `View all ${dataList.length} Repositories`;
    const planText = dataList.length === 1 ? `View ${dataList.length} Plan`
        :
        `View all ${dataList.length} Plans`;
    return (
        <a href="#">
            {type === 'clusters'
                && clusterText}
            {type === 'repositories'
                && storageText}
            {type === 'plans'
                && planText}
        </a>
    );
};

export default FooterText;
