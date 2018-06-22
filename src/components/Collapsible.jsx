import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, PanelGroup, Panel } from 'react-bootstrap';
import uniqueId from 'lodash/uniqueId';

export default function Collapsible(props) {
  return (
    <PanelGroup
      accordion
      id={uniqueId('panel-collapsible-')}
      bsClass="panel-group accordion"
      defaultActiveKey={props.isOpen ? '1' : null}
    >
      <Panel className={props.className} eventKey="1">
        <Panel.Heading>
          <Panel.Title toggle>{props.header}</Panel.Title>
        </Panel.Heading>
        <Panel.Body collapsible>
          <Row>
            <Col sm={12}>{props.children}</Col>
          </Row>
        </Panel.Body>
      </Panel>
    </PanelGroup>
  );
}

Collapsible.defaultProps = {
  className: '',
  isOpen: false
};

Collapsible.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  header: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  isOpen: PropTypes.bool
};