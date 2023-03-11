import React from "react";
import Select from 'react-select';
import styles from "./Select.module.css";

const Multiselect = ({ label, name, error, options, value, setValue, ...props }) => {

  const handleSelect = e => {
    setValue(e.map(item => {
      return item.value
    }));
  };

  return (

    <div className={styles.wrapper}>

      <label htmlFor={name} className={styles.label}>
        {label}
      </label>

      <Select
        isMulti
        id={name}
        name={name}
        options={options}
        className="basic-multi-select"
        classNamePrefix="select"
        onChange={handleSelect}
        defaultValue={options.filter(function(option) {
          return (value.indexOf(option.value) !== -1)  ;
        })}

      />

      {error && <p className={styles.error}>{error}</p>}

    </div>
  );

};

export default Multiselect;


