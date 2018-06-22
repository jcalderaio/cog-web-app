import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button } from 'react-bootstrap';

export default class ErrorDisplay extends React.Component {
  static propTypes = {
    header: PropTypes.string,
    message: PropTypes.string,
    details: PropTypes.any
  };

  state = {
    showDetails: false
  };

  handleShowDetails() {
    this.setState({ showDetails: !this.state.showDetails });
  }

  render() {
    const { header = 'Oh snap! You got an error!', message, details } = this.props;
    const { showDetails } = this.state;
    return (
      <Alert bsStyle="danger">
        <h4>{header}</h4>
        {message && <p>{message}</p>}
        {details && (
          <div>
            <hr />
            {showDetails && <p>{JSON.stringify(details)}</p>}
            <p>
              <Button bsStyle="danger" onClick={() => this.handleShowDetails()}>
                <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
              </Button>
            </p>
          </div>
        )}
      </Alert>
    );
  }
}
