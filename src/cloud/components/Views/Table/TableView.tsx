import { mdiTrashCanOutline } from '@mdi/js'
import React from 'react'
import { LoadingButton } from '../../../../design/components/atoms/Button'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import styled from '../../../../design/lib/styled'
import { SerializedView } from '../../../interfaces/db/view'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import ViewsSelector, { ViewsSelectorProps } from '../ViewsSelector'

type TableViewProps = { view: SerializedView } & ViewsSelectorProps

const TableView = ({ view, ...viewsSelectorProps }: TableViewProps) => {
  const { sendingMap, deleteViewApi } = useCloudApi()
  return (
    <Container>
      <Flexbox justifyContent='space-between' className='views__header'>
        <ViewsSelector {...viewsSelectorProps} />
        <Flexbox flex='0 0 auto'>
          <LoadingButton
            spinning={sendingMap.get(view.id.toString()) === 'delete'}
            disabled={sendingMap.get(view.id.toString()) != null}
            variant='icon'
            iconPath={mdiTrashCanOutline}
            onClick={() => deleteViewApi(view)}
          />
        </Flexbox>
      </Flexbox>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;

  .views__header {
    width: 100%;
  }
`

export default TableView
