import React from "react";
import styles from "./Select.module.css";

const Select = ({ label, name, error, options, value, setValue, ...props }) => {
  return (
    <div className={styles.wrapper}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        className={styles.select}
        value={value}
        onChange={({ target }) => setValue(target.value)}
        {...props}
      >
        <option value="" disabled>
          Selecione
        </option>
        {options.map((option) => (
          <option key={option.descricao} value={option.id}>
            {option.descricao}
          </option>
        ))}
      </select>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );

};

export default Select;


