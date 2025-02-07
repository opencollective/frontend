import React from 'react';

import LoadingGrid from '../components/LoadingGrid';

const Loading = props => {
  return (
    <div className="Loading">
      <div className="flex flex-wrap justify-center lg:justify-start" {...props}>
        <div className="flex w-full justify-center py-3">
          <LoadingGrid />
        </div>
      </div>
    </div>
  );
};

export default Loading;
