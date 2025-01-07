import React from "react";
import PropTypes from "prop-types";

const FilterBox = ({ filterText, setFilterText }) => (
    <div className="relative">
      <input
        type="text"
        placeholder="Filter..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {filterText && (
        <button
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
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
