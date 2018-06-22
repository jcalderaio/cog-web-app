import React from 'react';
import PropTypes from 'prop-types';
import { withConfig, signOut } from '@cognosante/react-app';

class Logout extends React.Component {
  static propTypes = {
    config: PropTypes.object.isRequired
  };

  componentDidMount() {
    setTimeout(() => signOut(), 750);
  }

  render() {
    return (
      this.props.config &&
      this.props.config.sesLogoutUrl && (
        <div id="redirecting">
          <h1>Redirecting...</h1>
          <div className="preloader" />
          <iframe
            title="logout-iframe"
            sandbox="allow-same-origin allow-scripts"
            src={this.props.config.sesLogoutUrl}
            ref={f => {
              this.ifr = f;
            }}
            style={{ display: 'none' }}
          />
        </div>
      )
    );
  }
}

export default withConfig(Logout);
