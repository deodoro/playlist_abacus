import React from "react";
import PropTypes from "prop-types";

const SavePanel = ({steps, applyChanges, revertChanges, undoLastChange}) => {

    return (
    <div className='p-4 bg-grey-900 sticky bottom-0'>
    <h3 className='text-lg font-semibold text-white'>
       {steps.length} change{steps.length > 1 ? 's' : ''} to be
       applied
    </h3>
    <div className='flex justify-between mt-2'>
       <button
          className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
          onClick={applyChanges}
       >
          Apply
       </button>
       <button
          className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
          onClick={revertChanges}
       >
          Revert
       </button>
       <button
          className='bg-purple-500 text-white px-4 py-2 rounded hover:bg-red-600'
          onClick={undoLastChange}
       >
          Undo Last Operation
       </button>
    </div>
 </div>
    )
};

SavePanel.propTypes = {
    steps: PropTypes.array.isRequired,
    applyChanges: PropTypes.func.isRequired,
    revertChanges: PropTypes.func.isRequired,
    undoLastChange: PropTypes.func.isRequired,
};

export default SavePanel;
