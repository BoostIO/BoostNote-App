import React from 'react'
import Image from '../atoms/Image'
import styled from '../../lib/styled'
import { useTranslation } from 'react-i18next'
import { borderBottom } from '../../lib/styled/styleFunctions'

const Container = styled.div`
  user-select: none;
  position: relative;
`

const DraggableArea = styled.div`
  height: 40px;
  ${borderBottom}
  -webkit-app-region: drag;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  img {
    width: 310px;
    max-width: 100%;
    padding: 10px 40px;
  }

  section {
    margin: auto;
    display: flex;
    width: 70%;
    text-align: center;

    div {
      text-align: center;
      margin: 0 auto;
      display: block;
    }
  }

  h2 {
    font-weight: normal;

    span {
      margin: 5px auto;
      padding: 5px 10px;
      width: max-content;
      background: #333;
      border-radius: 8px;
      box-shadow: 0 4px #404040;
    }
  }
  h3 {
    margin: 20px auto;
    font-weight: normal;
  }
  h4 {
    margin: 0;
    font-weight: normal;
  }

  @media only screen and (max-width: 970px) {
    section {
      width: 100%;
      display: block;
    }
  }
`

const IdleNoteDetail = () => {
  const { t } = useTranslation()
  return (
    <Container>
      <DraggableArea />
      <Content>
        <Image src={'/app/static/logo_index.svg'} />
        <h3>{t('note.createkeymessage1')}</h3>
        <section>
          <div>
            <h2>
              <span>Ctrl</span> + <span>{t('note.createKey')}</span>
            </h2>
            <h4>{t('note.createKeyWinLin')}</h4>
          </div>
          <h3>{t('note.createKeyOr')}</h3>
          <div>
            <h2>
              <span>⌘</span> + <span>{t('note.createKey')}</span>
            </h2>
            <h4>{t('note.createKeyMac')}</h4>
          </div>
        </section>
      </Content>
    </Container>
  )
}

export default IdleNoteDetail
