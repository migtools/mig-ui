import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import GeneralForm from '../GeneralForm';

import { PvCopyMethod } from '../types';

describe('<GeneralForm />', () => {
  test('loads items eventually', async () => {
    const pvCopyMethod: PvCopyMethod = 'filesystem';

    const values = {
      planName: 'test',
      sourceCluster: 'test',
      targetCluster: 'test',
      selectedStorage: 'test',
      selectedNamespaces: [],
      persistentVolumes: [],
      pvStorageClassAssignment: {
        ['pvNameTest']: {
          name: 'test',
          provisioner: 'test',
        },
      },
      pvVerifyFlagAssignment: {
        ['pvNameTest']: false,
      },
      pvCopyMethodAssignment: {
        ['pvNameTest']: pvCopyMethod,
      },
    };

    const handleBlur = jest.fn();
    const handleChange = jest.fn();
    const setFieldTouched = jest.fn();

    const touched = {
      planName: true,
    };

    const { getByText, findByText } = render(
      <GeneralForm
        values={values}
        errors={''}
        handleBlur={() => {}}
        handleChange={() => {}}
        touched={touched}
        setFieldTouched={setFieldTouched}
        isEdit={true}
      />
    );

    fireEvent.select(getByText('Plan Name'));
  });
});
