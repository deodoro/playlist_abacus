import React from "react";
import PropTypes from "prop-types";

const FilterBox = ({ filterText, setFilterText }) => (
  <div className="filter-container">
    <input
      type="text"
      placeholder="Filter..."
      value={filterText}
      onChange={(e) => setFilterText(e.target.value)}
      className="filter-box"
    />
    {filterText && (
      <button className="clear-filter" onClick={() => setFilterText("")}>
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
