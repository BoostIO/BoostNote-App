import React from 'react'
import Page from '../../components/Page'
import Application from '../../components/Application'
import { LazyDefaultLayout } from '../../components/layouts/DefaultLayout'
import { getBookmarksListPageData } from '../../api/pages/teams/bookmarks'
import BookmarkLists from '../../components/organisms/BookmarksList'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import InviteCTAButton from '../../components/molecules/InviteCTAButton'

const BookmarksListPage = () => {
  return (
    <Page>
      <LazyDefaultLayout>
        <Application
          content={{
            header: 'Bookmarks',
            topbar: {
              controls: [
                {
                  type: 'node',
                  element: <InviteCTAButton key='invite-cta' />,
                },
              ],
            },
          }}
        >
          <BookmarkLists />
        </Application>
      </LazyDefaultLayout>
    </Page>
  )
}

BookmarksListPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const result = await getBookmarksListPageData(params)
  return result
}

export default BookmarksListPage
