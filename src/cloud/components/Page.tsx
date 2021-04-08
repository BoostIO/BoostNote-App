import React from 'react'
import Helmet from 'react-helmet'

interface PageProps {
  title?: string
  privatePage?: boolean
  calendly?: boolean
}

const Page: React.FC<PageProps> = ({
  children,
  title = 'Boost Note is a powerful, lightspeed collaborative workspace for developer teams',
  privatePage = false,
  calendly = true,
}) => (
  <div
    className='root'
    onDrop={(event: React.DragEvent) => {
      event.preventDefault()
    }}
  >
    <Helmet>
      <title>{title}</title>
      <meta property='og:image' content='/static/images/ogp.jpg' />
      <link
        href='https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@900&display=swap'
        rel='stylesheet'
      ></link>
      {privatePage && <meta name='robots' content='noindex, nofollow' />}
    </Helmet>
    {calendly && (
      <Helmet>
        <link
          href='https://assets.calendly.com/assets/external/widget.css'
          rel='stylesheet'
        />
        <script
          src='https://assets.calendly.com/assets/external/widget.js'
          type='text/javascript'
        />
      </Helmet>
    )}
    {children}
  </div>
)

export default Page
