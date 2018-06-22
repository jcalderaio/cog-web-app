// Libs
import React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';
import VersionNumber from './VersionNumber';

import { withConfig } from '@cognosante/react-app';

export class Footer extends React.Component {

  getBackgroundStyle(backgroundImageURL) {
    if (backgroundImageURL) {    
      return {
        // see _layout.scss
        background: `transparent url(${backgroundImageURL}) no-repeat top right`,
        backgroundSize: '180px 37px'  
      }
    }
    else {
      return {
        visibility: 'hidden'
      }
    }
  }

  render() {
    const backgroundStyle = this.getBackgroundStyle(this.props.config.footerImage);
    // Note: using ref here is a bit of a yuck...But it's a great way to calculate available height.
    // Since we aren't manipulating it or anything, should be fine.
    // window.innerHeight - window.HeaderComponent.clientHeight - window.FooterComponent.clientHeight
    return (
    <footer id="footer" ref={(element) => { window.FooterComponent = element; }}>
      <Grid>
        <Row>
          <Col className="col-xxs-6">
            <p>&copy; {new Date().getFullYear()} All Rights Reserved</p>
            <p><VersionNumber /></p>
          </Col>
          <Col className="col-xxs-6">
            <div id="logo-cognosante" style={backgroundStyle}></div>
          </Col>
        </Row>
      </Grid>
    </footer>
    );
  }
}

export default withConfig(Footer);
