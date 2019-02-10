import React from 'react'
import useDarkMode from 'use-dark-mode'

import './Toggle.scss'

const ToggleControl = ({ checked, onChange }) => (
  <span className="toggle-control">
    <input
      className="dmcheck"
      type="checkbox"
      checked={checked}
      onChange={onChange}
      id="dmcheck"
    />
    <label htmlFor="dmcheck" />
  </span>
)

const Toggle = () => {
  const darkMode = useDarkMode(false)

  return (
    <div className="dark-mode-toggle">
      <button onClick={darkMode.disable}>
        ☀
      </button>
      <ToggleControl checked={darkMode.value} onChange={darkMode.toggle} />
      <button onClick={darkMode.enable}>
        ☾
      </button>
    </div>
  )
}

export default Toggle 