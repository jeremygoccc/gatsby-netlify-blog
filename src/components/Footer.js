import React from 'react'

import { rhythm } from '../utils/typography'

class Footer extends React.Component {
  render() {
    return (
      <footer
        style={{
          marginTop: rhythm(2.5),
          paddingTop: rhythm(1)
        }}
      >
        <a
          href="https://mobile.twitter.com/jeremy_0523"
          target="_blank"
          rel="noopener noreferrer"
        >
          Twitter
        </a> &bull;{' '}
        <a
          href="https://github.com/fxbabys"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github
        </a>
      </footer>
    )
  }
}

export default Footer