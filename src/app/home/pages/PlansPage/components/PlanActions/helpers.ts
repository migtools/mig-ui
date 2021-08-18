export const returnPVCNameObj = (sourcePVCName: string) => {
  const includesMapping = sourcePVCName.includes(':');
  if (includesMapping) {
    const mappedNsArr = sourcePVCName.split(':');
    editedPV = values.editedPVs.find(
      (editedPV) =>
        editedPV.oldName === mappedNsArr[0] && editedPV.namespace === pvItem.pvc.namespace
    );
    if (mappedNsArr[0] === mappedNsArr[1]) {
      sourcePVCName = mappedNsArr[0];
      targetPVCName = editedPV ? editedPV.newName : mappedNsArr[0];
    } else {
      sourcePVCName = mappedNsArr[0];
      targetPVCName = editedPV ? editedPV.newName : mappedNsArr[1];
    }
  }
};
