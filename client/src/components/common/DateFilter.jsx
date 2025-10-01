import React from 'react';
import '../../styles/components/DateFilter.css';

const DateFilter = ({ selected, onChange }) => {
  const options = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

  return (
    <div className="date-filter">
      {options.map(option => (
        <button
          key={option.value}
          className={`filter-btn ${selected === option.value ? 'active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default DateFilter;