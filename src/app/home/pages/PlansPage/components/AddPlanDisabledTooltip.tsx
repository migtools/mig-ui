import React from 'react';
import { IAddPlanDisabledObjModel } from '../types';
import { Tooltip } from '@patternfly/react-core';

interface IAddPlanDisabledTooltipProps {
  addPlanDisabledObj: IAddPlanDisabledObjModel;
  children: React.ReactElement;
}

const AddPlanDisabledTooltip: React.FunctionComponent<IAddPlanDisabledTooltipProps> = ({
  addPlanDisabledObj,
  children,
}: IAddPlanDisabledTooltipProps) =>
  addPlanDisabledObj.isAddPlanDisabled ? (
    <Tooltip position="top" content={<div>{addPlanDisabledObj.disabledText}</div>}>
      {children}
    </Tooltip>
  ) : (
    children
  );

export default AddPlanDisabledTooltip;
