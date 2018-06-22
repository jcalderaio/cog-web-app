import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'react-bootstrap';

// Components
import Header from '../components/Header';
import Footer from '../components/Footer';

import { withConfig } from '@cognosante/react-app';

const _defaultLayoutOptions = { showFooter: true, gridLayout: true };

class PublicTemplate extends React.Component {
  LayoutOptions = _defaultLayoutOptions;

  render() {    
    return (
      <div className="app">
        <Header
          location={this.props.location}
        />
        {this.LayoutOptions.gridLayout ? (
          <main id="main">
            <Grid className="content">{this.props.children}</Grid>
          </main>
        ) : (
          <main>{this.props.children}</main>
        )}
        <div className="push" />

        {this.LayoutOptions.showFooter ? <Footer /> : null}
      </div>
    );
  }
}

PublicTemplate.propTypes = {
  children: PropTypes.node
};

export default withConfig(PublicTemplate);
