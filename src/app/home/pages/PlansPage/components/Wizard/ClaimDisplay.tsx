import { PackageIcon, UnknownIcon, VirtualMachineIcon } from '@patternfly/react-icons';
import React from 'react';
import { IPlanPersistentVolume } from '../../../../../plan/duck/types';
import { pvcNameToString } from '../../helpers';

const styles = require('./PVStorageClassSelect.module').default;

interface IClaimDisplayProps {
  pv: IPlanPersistentVolume;
}

export const ClaimDisplay: React.FunctionComponent<IClaimDisplayProps> = ({
  pv,
}: IClaimDisplayProps) => {
  if (!pv) {
    return null;
  }
  if (!pv.pvc.ownerType) {
    return <span> {pvcNameToString(pv.pvc)}</span>;
  }
  if (pv.pvc.ownerType === 'VirtualMachine') {
    return (
      <>
        <VirtualMachineIcon title="Virtual Machine" />
        <span> {pvcNameToString(pv.pvc)}</span>
      </>
    );
  } else if (pv.pvc.ownerType === 'Unknown') {
    return (
      <>
        <UnknownIcon title="Unknown" />
        <span> {pvcNameToString(pv.pvc)}</span>
      </>
    );
  }
  return (
    <>
      <PackageIcon title={pv.pvc.ownerType} />
      <span> {pvcNameToString(pv.pvc)}</span>
    </>
  );
};
