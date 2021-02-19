import React from 'react'
import Page from '../../components/Page'
import AppLayout from '../../components/layouts/AppLayout'
import { LazyDefaultLayout } from '../../components/layouts/DefaultLayout'
import { getBookmarksListPageData } from '../../api/pages/teams/bookmarks'
import BookmarkLists from '../../components/organisms/BookmarksList'
import { GetInitialPropsParameters } from '../../interfaces/pages'

const BookmarksListPage = () => {
  return (
    <Page>
      <LazyDefaultLayout>
        <AppLayout rightLayout={{ header: 'Bookmarks' }}>
          <BookmarkLists />
        </AppLayout>
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
