import React from 'react';
import { Modal, Title, BaseSizes, Button } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

export type VerifyWarningState = 'Unread' | 'Open' | 'Dismissed';

interface IVerifyCopyWarningModalProps {
  verifyWarningState: VerifyWarningState;
  setVerifyWarningState: (value: VerifyWarningState) => void;
  isSCC?: boolean;
}

export const VerifyCopyWarningModal: React.FunctionComponent<IVerifyCopyWarningModalProps> = ({
  verifyWarningState,
  setVerifyWarningState,
  isSCC = false,
}: IVerifyCopyWarningModalProps) => (
  <Modal
    aria-label="copy-options-modal"
    variant="small"
    title="Copy performance warning"
    header={
      <Title headingLevel="h1" size={BaseSizes['2xl']}>
        <ExclamationTriangleIcon
          color="var(--pf-global--warning-color--100)"
          className={spacing.mrMd}
        />
        Copy performance warning
      </Title>
    }
    isOpen={verifyWarningState === 'Open'}
    onClose={() => setVerifyWarningState('Dismissed')}
    actions={[
      <Button key="close" variant="primary" onClick={() => setVerifyWarningState('Dismissed')}>
        Close
      </Button>,
    ]}
  >
    Selecting checksum verification for a PV that will be copied using a filesystem copy method will
    severely impact the copy performance.
    {!isSCC ? (
      <>Enabling verification will essentially remove any time savings from incremental restore.</>
    ) : null}
    <br />
    <br />
    See the product documentation for more information.
  </Modal>
);
