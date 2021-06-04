import {
  PageSection,
  Alert,
  Card,
  CardHeader,
  Title,
  Popover,
  PopoverPosition,
  Bullseye,
  EmptyState,
  Spinner,
  CardBody,
  CardActions,
  Button,
} from '@patternfly/react-core';
import { QuestionCircleIcon, TimesIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import React, { useEffect } from 'react';
import ReactJson from 'react-json-view';
import { useDispatch, useSelector } from 'react-redux';
import { DefaultRootState } from '../../../configureStore';
import { debugObjectFetchRequest } from '../duck/slice';
import { DEBUG_PATH_SEARCH_KEY } from '../duck/types';

const RawDebugObjectView: React.FunctionComponent = () => {
  const debug = useSelector((state: DefaultRootState) => state.debug);
  const dispatch = useDispatch();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    dispatch(debugObjectFetchRequest(decodeURI(params.get(DEBUG_PATH_SEARCH_KEY))));
  }, []);

  return (
    <>
      <PageSection>
        {debug.errMsg ? (
          <Alert variant="danger" title={`Error loading JSON`}>
            <p>{debug.errMsg}</p>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
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
            </CardHeader>
            <CardBody>
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
                  <ReactJson src={debug.objJson} enableClipboard={true} />
                )}
              </div>
            </CardBody>
          </Card>
        )}
      </PageSection>
    </>
  );
};
export default RawDebugObjectView;
