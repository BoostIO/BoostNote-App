import React from 'react'
import Head from 'next/head'

import GlobalStyle from './GlobalStyle'
import Header from './organisms/Header'
import Footer from './organisms/Footer'

const DefaultLayout: React.FC = ({ children }) => (
  <>
    <Head>
      <title>Boost Note - An open sourced markdown editor for developers</title>

      <meta charSet='utf-8' />

      <meta httpEquiv='X-UA-Compatible' content='IE=edge' />

      <meta
        name='viewport'
        content='width=device-width, initial-scale=1, maximum-scale=1'
      />
      <meta name='subject' content='Boost Note' />
      <meta
        name='description'
        content="Boost Note is an intuitive and stylish markdown editor for developers. It's fully open-source."
      />
      <meta
        name='keyword'
        content='markdown editor, note app,note-taking,typora,stackedit,development,programmer,evernote,open source,hackmd'
      />
      <meta name='author' content='BoostIO, kazz@boostio.co' />
      <meta name='robots' content='INDEX,FOLLOW' />

      <meta property='og:type' content='website' />
      <meta property='og:title' content='Boost Note' />
      <meta
        property='og:description'
        content="Boost Note is an intuitive and stylish markdown editor for developers. It's fully open-source."
      />
      <meta property='og:image' content='https://boostnote.io/static/ogp.jpg' />
      <meta property='og:image:alt' content='Image of Boost Note App' />
      <meta property='og:url' content='https://boostnote.io/' />
      <meta property='og:site_name' content='Boost Note' />
      <meta property='fb:app_id' content='966242223397117' />

      <meta name='twitter:card' content='summary' />
      <meta name='twitter:url' content='https://boostnote.io/' />
      <meta name='twitter:title' content='Boost Note' />
      <meta
        name='twitter:description'
        content="Boost Note is an intuitive and stylish markdown editor for developers. It's fully open-source."
      />
      <meta
        name='twitter:image:src'
        content='https://boostnote.io/static/ogp.jpg'
      />
      <meta name='twitter:site' content='Boost Note' />

      <link rel='icon' href='/static/favicon.ico' />
      <link
        rel='apple-touch-icon'
        sizes='180x180'
        href='/static/apple-touch-icon.png'
      />
    </Head>

    <GlobalStyle />

    <Header />

    <main>{children}</main>

    <Footer />
  </>
)

export default DefaultLayout
