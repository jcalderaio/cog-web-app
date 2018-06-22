import React from 'react';

import MaleIcon from '../../../../assets/images/chart-icons/male_symbol.inline.svg?name=MaleIcon';

class MaleIconShape extends React.Component {

  render () {
    console.log('inlined svg', MaleIcon);

    return (
      <MaleIcon className='normal' />
    );
  }

}

export default MaleIconShape;