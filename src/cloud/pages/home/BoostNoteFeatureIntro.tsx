import React, { useCallback } from 'react'
import Icon from '../../../design/components/atoms/Icon'
import { mdiAccountPlus, mdiChartBar, mdiHistory } from '@mdi/js'
import styled from '../../../design/lib/styled'
import { border, flexCenter } from '../../../design/lib/styled/styleFunctions'
import { useElectron } from '../../lib/stores/electron'
import { boostHubBaseUrl } from '../../lib/consts'
import Image from '../../../design/components/atoms/Image'

const BoostNoteFeatureIntro = () => {
  const { sendToElectron, usingElectron } = useElectron()

  const openLearnMorePage = useCallback(() => {
    if (usingElectron) {
      sendToElectron('open-external-url', boostHubBaseUrl + `/features`)
    }
  }, [sendToElectron, usingElectron])

  return (
    <Container>
      <ul className='featureList'>
        <li className='featureListItem'>
          <div className='featureListItemIcon'>
            <Icon path={mdiAccountPlus} />
          </div>
          <div className='featureListItemBody'>
            <h2>Real-time Coauthoring</h2>
            <p>
              You can edit markdown documents with your colleagues synchronously
            </p>
          </div>
        </li>
        <li className='featureListItem'>
          <div className='featureListItemIcon'>
            <Icon path={mdiHistory} />
          </div>
          <div className='featureListItemBody'>
            <h2>Revision History</h2>
            <p>
              Every change of a document will be saved and accessible without
              time expiry
            </p>
          </div>
        </li>
        <li className='featureListItem'>
          <div className='featureListItemIcon'>
            <Icon path={mdiChartBar} />
          </div>
          <div className='featureListItemBody'>
            <h2>Diagram Supports</h2>
            <p>
              LaTeX math equation and most of popular diagrams(Chart.js, Mermaid
              and PlantUML) are available
            </p>
          </div>
        </li>
        <li className='featureLearnMoreItem'>
          <a onClick={openLearnMorePage}>Learn more</a>
        </li>
      </ul>
      <div className='screenShot'>
        <Image src='/static/img_ui_no-annotation.jpg' />
      </div>
    </Container>
  )
}
export default BoostNoteFeatureIntro

const Container = styled.div`
  display: flex;
  padding: 0 10px;

  .featureList {
    list-style: none;
    width: 300px;
    margin: 0 20px 0 0;
    padding: 0;

    & > .featureLearnMoreItem {
      text-align: right;
      color: ${({ theme }) => theme.colors.text.primary};
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .featureList > .featureListItem {
    ${border};
    display: flex;
    margin-bottom: 20px;
    border-radius: 5px;
    padding: 10px 5px 10px 10px;
    background-color: ${({ theme }) => theme.colors.background.secondary};

    & > .featureListItemIcon {
      ${flexCenter};
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    & > .featureListItemBody {
      margin-left: 7px;

      & > h2 {
        font-size: 18px;
        margin-top: 0;
        margin-bottom: 10px;
      }

      & > p {
        font-size: 14px;
        margin: 0;
      }
    }
  }

  .screenShot {
    flex: 1;

    img {
      width: 100%;
      ${border};
      border-radius: 5px;
    }
  }
`
