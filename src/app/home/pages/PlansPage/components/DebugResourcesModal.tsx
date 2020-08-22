import React, { useEffect } from 'react';
import { Modal, Button } from '@patternfly/react-core';
import { TreeView, ITreeDataItem } from '../../../../common/components/TreeView';
import { connect } from 'react-redux';
import { DebugActions, IDebugReducerState } from '../../../../debug/duck';
import { IPlan } from '../../../../plan/duck/types';
import { convertRawTreeToViewTree } from '../../../../debug/duck/utils';
import { push } from 'connected-react-router';
import {
  IDecompDebugObject,
  DEBUG_PATH_SEARCH_KEY,
  RAW_OBJECT_VIEW_ROUTE,
} from '../../../../debug/duck/types';
import crawl from 'tree-crawl';

interface IDebugResourcesModalProps {
  onClose: () => void;
  debug: IDebugReducerState;
  plan: IPlan;
  fetchDebugTree: (IPlan) => void;
  routeRawDebugObject: (IDecompDebugObject) => void;
}

const DebugResourcesModal: React.FunctionComponent<IDebugResourcesModalProps> = ({
  onClose,
  debug,
  plan,
  fetchDebugTree,
  routeRawDebugObject,
}: IDebugResourcesModalProps) => {
  useEffect(() => {
    fetchDebugTree(plan);
  }, []);

  const refreshTrigger = () => {
    fetchDebugTree(plan);
  };

  const viewRawDebugObject = (decomp: IDecompDebugObject) => {
    crawl(
      debug.tree,
      (node, ctx) => {
        if (node.name === decomp.name) {
          ctx.break();
          routeRawDebugObject(node.objectLink);
        }
      },
      { order: 'pre' }
    );
  };

  const modalContents = () => {
    if (debug.errMsg) {
      return debug.errMsg;
    } else if (debug.isLoading) {
      return 'Loading...';
    }
    return (
      <TreeView
        data={convertRawTreeToViewTree(debug.tree)}
        viewRawDebugObject={viewRawDebugObject}
      />
    );
  };

  return (
    <Modal
      id="debug-resources-modal"
      width={'60%'}
      title="Migration plan resources (DEBUG)"
      isOpen
      onClose={onClose}
      actions={[
        <Button key="close" variant="primary" onClick={onClose}>
          Close
        </Button>,
        <Button key="refresh" variant="primary" onClick={refreshTrigger}>
          Refresh
        </Button>,
      ]}
    >
      {modalContents()}
    </Modal>
  );
};

export default connect(
  (state) => ({
    debug: state.debug,
  }),
  (dispatch) => ({
    fetchDebugTree: (plan: IPlan) => dispatch(DebugActions.debugTreeFetchRequest(plan)),
    routeRawDebugObject: (path: string) => {
      const encodedPath = encodeURI(path);
      dispatch(
        push({
          pathname: RAW_OBJECT_VIEW_ROUTE,
          search: `?${DEBUG_PATH_SEARCH_KEY}=${encodedPath}`,
        })
      );
    },
  })
)(DebugResourcesModal);
