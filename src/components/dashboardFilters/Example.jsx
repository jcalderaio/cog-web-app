import React, { PureComponent } from 'react';

// DashboardExampleFilter shows an extremely basic example of how to create a composable filter for use with DashboardFilter
export default class DashboardExampleFilter extends PureComponent {

  state = {
    example: ""
  };

  handleChange(event) {
    this.setState({example: event.target.value});
    this.props.addFilter({"example": event.target.value}, false);
  }

  render() {
    // this.props will contain a few things when in used with <DashboardFilter />
    // this.props.filters   - Will include the observable object with all filters applied (yes, it will update)
    // this.props.addFilter - Will be a function that can be called to add a new filter value
    //                        DashboardFilter then publishes the new filters object and this.props.filters will be updated
    //                        This function takes an object, key being the filter field name value being the filter value.
    //
    // A little extra work for working with "clear all" from the parent <DashboardFilter />
    // See: https://reactjs.org/docs/forms.html#controlled-components
    // Essentially we need to watch for the value to be cleared out in this.props.filters
    // and empty the input component here. This will vary based on the component being used.
    //
    // console.log('composed filter props', this.props);
    
    return (
      <div className="filter-input">
        <label>Example Composed Filter</label>
        <div>
          <input
            className="form-control"
            style={{height: '34px'}}
            type="text"
            onChange={this.handleChange.bind(this)}
            value={(this.props.filters && this.props.filters.get('example') === undefined) ? "":this.state.example}
          />
        </div>
      </div>
    );
  }
}