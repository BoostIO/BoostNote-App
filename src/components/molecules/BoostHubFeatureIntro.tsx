import React, { useCallback } from 'react'
import Image from '../atoms/Image'
import Icon from '../atoms/Icon'
import { mdiAccountPlus, mdiHistory, mdiChartBar } from '@mdi/js'
import styled from '../../lib/styled'
import { flexCenter, border } from '../../lib/styled/styleFunctions'
import { openNew } from '../../lib/platform'
import { boostHubLearnMorePageUrl } from '../../lib/boosthub'

const BoostHubFeatureIntro = () => {
  const openLearnMorePage = useCallback(() => {
    openNew(boostHubLearnMorePageUrl)
  }, [])

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
        <Image src='/static/boosthub.png' />
      </div>
    </Container>
  )
}
export default BoostHubFeatureIntro

const Container = styled.div`
  display: flex;
  .featureList {
    list-style: none;
    width: 300px;
    margin: 0;
    margin-right: 20px;
    padding: 0;
    & > .featureLearnMoreItem {
      text-align: right;
      color: ${({ theme }) => theme.primaryColor};
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  .featureList > .featureListItem {
    ${border}
    display: flex;
    padding: 0 5px;
    margin-bottom: 10px;
    border-radius: 5px;
    padding: 10px 5px 10px 10px;
    background-color: ${({ theme }) => theme.navItemBackgroundColor};
    & > .featureListItemIcon {
      ${flexCenter}
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
      ${border}
      border-radius: 5px;
    }
  }
`
