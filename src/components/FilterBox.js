import React from "react";
import PropTypes from "prop-types";

const FilterBox = ({ filterText, setFilterText }) => (
  <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-md shadow-md">
    <input
      type="text"
      placeholder="Filter..."
      value={filterText}
      onChange={(e) => setFilterText(e.target.value)}
      className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {filterText && (
      <button
        className="text-gray-500 hover:text-gray-700 focus:outline-none"
        onClick={() => setFilterText("")}
      >
        ✕
      </button>
    )}
  </div>
);

FilterBox.propTypes = {
  filterText: PropTypes.string.isRequired,
  setFilterText: PropTypes.func.isRequired,
};

export default FilterBox;
