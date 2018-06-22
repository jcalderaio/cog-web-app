import React, { Component } from 'react';
import PropTypes from 'prop-types'; 
import _ from 'lodash';
import { Pager } from 'react-bootstrap';


export default class PagerGraphQL extends Component {
  constructor(props) {
    super(props);

    this.haveNextPage = this.haveNextPage.bind(this);
    this.reset = this.reset.bind(this);
  }

  haveNextPage(curPage) {
    const props = this.props;
    if (curPage < this.numberPages && props.edgeCount !== props.totalEdgeCount) {
      const nextPage = curPage + 1;
      return (props.edgeCount < (props.pageSize * nextPage))
    }
    return true;
  }

  reset() {
    return new Promise((resolve, reject) => {
      this.setState(
        { activePage: 1 },
        () => resolve()); // resolve with callback, when state reset
    });
  }

  render() {
    return (
      <div className='pagination-graphql'>
        <Pager>
          <Pager.Item disabled={this.props.previousButtonDisabled} onSelect={this.props.fetchPrevious}>
            &larr; Previous 25</Pager.Item>
          <Pager.Item disabled={this.props.nextButtonDisabled} onSelect={this.props.fetchNext}>
            Next 25 &rarr;</Pager.Item>
        </Pager>
      </div>
    );
  }
}

PagerGraphQL.defaultProps = {
  pageSize: 25,
  previousButtonDisabled: false,
  nextButtonDisabled: false,
}

PagerGraphQL.propTypes = {
  totalEdgeCount: PropTypes.number.isRequired,
  edgeCount: PropTypes.number.isRequired,
  fetchNextPage: PropTypes.func,
  pageSize: PropTypes.number
}
