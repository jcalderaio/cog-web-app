import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import { hashHistory } from 'react-router';

/**
 * BackLink component renders a link with icon to go back to a previous path.
 * Uses react-router.
 * If `path` is not defined in props, it will use hashHistory to go back one.
 *
 * @export
 * @class BackLink
 * @extends {React.PureComponent}
 */
export default class BackLink extends React.PureComponent {
  // Expose router on context in order to goBack()
  static contextTypes = {
    router: PropTypes.object
  };

  /**
   * Where to link to.
   *
   * @param {String} path The path to go to, react router goBack() if not defined (browser history -1)
   */
  goToPage(path) {
    return () => (path ? hashHistory.push(path) : this.context.router.goBack());
  }

  render() {
    const {
      className = 'back-link',
      // optional overriding styles, because this link floats right by default for example
      style,
      iconSize = '2x',
      iconName = 'arrow-circle-left',
      path
    } = this.props;

    return (
      <div>
        <a className={className} style={style} onClick={this.goToPage(path)}>
          <FontAwesome className="widget-control" name={iconName} size={iconSize} />
          <span>Back</span>
        </a>
      </div>
    );
  }
}
