// Libs
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router';

export default function NotFound() {
  return (
    <Row className="page-not-found">
      <Col sm={12}>
        <div id="page-header">
          <h2 className="page-heading">Page Not Found</h2>
        </div>
        <p><i className="icon-no-results zmdi zmdi-mood-bad" /></p>
        <p>We&#39;re sorry but we can&#39;t find the page you&#39;re looking for.</p>
        <p>Please choose a link from the navigation or <Link to="dashboard">visit the home page</Link>.</p>
      </Col>
    </Row>
  );
}
