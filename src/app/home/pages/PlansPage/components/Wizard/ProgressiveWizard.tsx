import React, { useState }from 'react';
import {
  Button,
  Radio,
  Wizard,
  WizardFooter,
  WizardContextConsumer,
  Alert,
} from '@patternfly/react-core';
// import SampleForm from './examples/SampleForm';
// import FinishedStep from './examples/FinishedStep';
import { IOtherProps } from './WizardContainer';

const ProgressiveWizardComponent = (props: IOtherProps) => {
  const [migrationType, setMigrationType] = useState(null);
  const [isAddHooksOpen, setIsAddHooksOpen] = useState(false);

    // this.state = {
    //   showCreateStep: false,
    //   showUpdateStep: false,
    //   showOptionsStep: false,
    //   showReviewStep: false,
    //   getStartedStepRadio: 'Create',
    //   createStepRadio: 'Quick',
    //   updateStepRadio: 'Quick',
    // };

    const closeWizard = () => {
      console.log('close wizard');
    };

    const onGoToStep = ({ id, name }, { prevId, prevName }) => {
      // Remove steps after the currently clicked step
      if (name === 'Get started') {
        // setState({
        //   showReviewStep: false,
        //   showOptionsStep: false,
        //   showCreateStep: false,
        //   showUpdateStep: false,
        // });
      } else if (name === 'Create options' || name === 'Update options') {
        // setState({
        //   showReviewStep: false,
        //   showOptionsStep: false,
        // });
      } else if (name.indexOf('Substep') > -1) {
        // setState({
        //   showReviewStep: false,
        // });
      }
    };
    this.getNextStep = (activeStep, callback) => {
      if (activeStep.name === 'Get started') {
        if (this.state.getStartedStepRadio === 'Create') {
          this.setState(
            {
              showCreateStep: true,
              showUpdateStep: false,
              showOptionsStep: false,
              showReviewStep: false,
            },
            () => {
              callback();
            }
          );
        } else {
          this.setState(
            {
              showCreateStep: false,
              showUpdateStep: true,
              showOptionsStep: false,
              showReviewStep: false,
            },
            () => {
              callback();
            }
          );
        }
      } else if (activeStep.name === 'Create options' || activeStep.name === 'Update options') {
        this.setState(
          {
            showOptionsStep: true,
            showReviewStep: false,
          },
          () => {
            callback();
          }
        );
      } else if (activeStep.name === 'Substep 3') {
        this.setState(
          {
            showReviewStep: true,
          },
          () => {
            callback();
          }
        );
      } else {
        callback();
      }
    };
    this.getPreviousStep = (activeStep, callback) => {
      if (activeStep.name === 'Review') {
        this.setState(
          {
            showReviewStep: false,
          },
          () => {
            callback();
          }
        );
      } else if (activeStep.name === 'Substep 1') {
        this.setState(
          {
            showOptionsStep: false,
          },
          () => {
            callback();
          }
        );
      } else if (activeStep.name === 'Create options') {
        this.setState(
          {
            showCreateStep: false,
          },
          () => {
            callback();
          }
        );
      } else if (activeStep.name === 'Update options') {
        this.setState(
          {
            showUpdateStep: false,
          },
          () => {
            callback();
          }
        );
      } else {
        callback();
      }
    };
  }

  render() {
    const {
      stepsValid,
      getStartedStepRadio,
      createStepRadio,
      updateStepRadio,
      showCreateStep,
      showUpdateStep,
      showOptionsStep,
      showReviewStep,
    } = this.state;

    const getStartedStep = {
      name: 'Get started',
      component: (
        <div>
          <Radio
            value="Create"
            isChecked={getStartedStepRadio === 'Create'}
            onChange={(_, event) =>
              this.setState({ getStartedStepRadio: event.currentTarget.value })
            }
            label="Create a new thing"
            name="radio-step-start"
            id="radio-step-start-1"
          />{' '}
          <Radio
            value="Update"
            isChecked={getStartedStepRadio === 'Update'}
            onChange={(_, event) =>
              this.setState({ getStartedStepRadio: event.currentTarget.value })
            }
            label="Update an existing thing"
            name="radio-step-start"
            id="radio-step-start-2"
          />
        </div>
      ),
    };

    const createStep = {
      name: 'Create options',
      component: (
        <div>
          <Radio
            value="Quick"
            isChecked={createStepRadio === 'Quick'}
            onChange={(_, event) => this.setState({ createStepRadio: event.currentTarget.value })}
            label="Quick create"
            name="radio-step-create"
            id="radio-step-create-1"
          />{' '}
          <Radio
            value="Custom"
            isChecked={createStepRadio === 'Custom'}
            onChange={(_, event) => this.setState({ createStepRadio: event.currentTarget.value })}
            label="Custom create"
            name="radio-step-create"
            id="radio-step-create-2"
          />
        </div>
      ),
    };

    const updateStep = {
      name: 'Update options',
      component: (
        <div>
          <Radio
            value="Quick"
            isChecked={updateStepRadio === 'Quick'}
            onChange={(_, event) => this.setState({ updateStepRadio: event.currentTarget.value })}
            label="Quick update"
            name="radio-step-update"
            id="radio-step-update-1"
          />{' '}
          <Radio
            value="Custom"
            isChecked={updateStepRadio === 'Custom'}
            onChange={(_, event) => this.setState({ updateStepRadio: event.currentTarget.value })}
            label="Custom update"
            name="radio-step-update"
            id="radio-step-update-2"
          />
        </div>
      ),
    };

    const optionsStep = {
      name: showCreateStep ? `${createStepRadio} Options` : `${updateStepRadio} Options`,
      steps: [
        {
          name: 'Substep 1',
          component: 'Substep 1',
        },
        {
          name: 'Substep 2',
          component: 'Substep 2',
        },
        {
          name: 'Substep 3',
          component: 'Substep 3',
        },
      ],
    };

    const reviewStep = {
      name: 'Review',
      component: (
        <div>
          <div>First choice: {getStartedStepRadio}</div>
          <div>Second choice: {showCreateStep ? createStepRadio : updateStepRadio}</div>
        </div>
      ),
    };

    const steps = [
      getStartedStep,
      ...(showCreateStep ? [createStep] : []),
      ...(showUpdateStep ? [updateStep] : []),
      ...(showOptionsStep ? [optionsStep] : []),
      ...(showReviewStep ? [reviewStep] : []),
    ];

    const CustomFooter = (
      <WizardFooter>
        <WizardContextConsumer>
          {({ activeStep, goToStepByName, goToStepById, onNext, onBack, onClose }) => {
            return (
              <>
                <Button
                  variant="primary"
                  type="submit"
                  onClick={() => this.getNextStep(activeStep, onNext)}
                >
                  {activeStep.name === 'Review' ? 'Finish' : 'Next'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => this.getPreviousStep(activeStep, onBack)}
                  className={activeStep.name === 'Get Started' ? 'pf-m-disabled' : ''}
                >
                  Back
                </Button>
                <Button variant="link" onClick={onClose}>
                  Cancel
                </Button>
              </>
            );
          }}
        </WizardContextConsumer>
      </WizardFooter>
    );
    const title = 'Progressive wizard';
    return (
      <Wizard
        navAriaLabel={`${title} steps`}
        mainAriaLabel={`${title} content`}
        onClose={this.closeWizard}
        footer={CustomFooter}
        onGoToStep={this.onGoToStep}
        steps={steps}
        height={400}
      />
    );
  }
}
