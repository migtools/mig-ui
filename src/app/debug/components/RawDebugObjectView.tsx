import {
  PageSection,
  Alert,
  Card,
  CardHeader,
  Title,
  Popover,
  PopoverPosition,
  CardExpandableContent,
  Bullseye,
  EmptyState,
  Spinner,
  CardBody,
  Split,
  CardActions,
  Checkbox,
  Dropdown,
  KebabToggle,
  Button,
} from '@patternfly/react-core';
import { QuestionCircleIcon, TimesIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import React, { useState } from 'react';
import ReactJson from 'react-json-view';
import { useDispatch, useSelector } from 'react-redux';
import { clearJSONView } from '../duck/slice';

const RawDebugObjectView: React.FunctionComponent = () => {
  const [isOpen, setIsOpen] = useState(true);
  const debug = useSelector((state) => state.debug);
  const dispatch = useDispatch();
  const closeJSONView = () => {
    dispatch(clearJSONView());
  };
  return (
    <>
      <PageSection>
        {debug.errMsg ? (
          <Alert variant="danger" title={`Error loading JSON`}>
            <p>{debug.errMsg}</p>
          </Alert>
        ) : (
          <Card id="image-card" isExpanded={isOpen}>
            <CardHeader
              onExpand={() => {
                setIsOpen(!isOpen);
              }}
              toggleButtonProps={{
                id: 'toggle-button',
                'aria-label': 'debug-details',
                'aria-expanded': isOpen,
              }}
            >
              <Title headingLevel="h1" size="xl" className={spacing.mrLg}>
                Resource JSON view
              </Title>
              <Popover
                position={PopoverPosition.bottom}
                bodyContent={
                  <>
                    <Title headingLevel="h2" size="xl">
                      <>JSON view</>
                    </Title>
                    <p className={spacing.mtMd}>View the JSON for the selected resource.</p>
                  </>
                }
                aria-label="json-view"
                closeBtnAriaLabel="close--details"
                maxWidth="30rem"
              >
                <span>
                  <span className="pf-c-icon pf-m-info">
                    <QuestionCircleIcon size="md" />
                  </span>
                </span>
              </Popover>
              <CardActions>
                <Button variant="plain" aria-label="Action" onClick={() => closeJSONView()}>
                  <TimesIcon />
                </Button>
              </CardActions>
            </CardHeader>
            <CardExpandableContent>
              <div>
                {debug.isLoadingJSONObject ? (
                  <Bullseye>
                    <EmptyState variant="large">
                      <div className="pf-c-empty-state__icon">
                        <Spinner size="xl" />
                      </div>
                      <Title headingLevel="h2" size="xl">
                        Loading...
                      </Title>
                    </EmptyState>
                  </Bullseye>
                ) : (
                  <CardBody>
                    <Split hasGutter></Split>
                    <ReactJson src={debug.objJson} enableClipboard={true} />
                  </CardBody>
                )}
              </div>
            </CardExpandableContent>
          </Card>
        )}
      </PageSection>
    </>
  );
};
export default RawDebugObjectView;
