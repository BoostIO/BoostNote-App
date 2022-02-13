import { Comment } from '../../interfaces/db/comments'
import { SerializedUser } from '../../interfaces/db/user'
import CommentEmoji from '../CommentEmoji'
import React, { useCallback, useMemo } from 'react'
import Button from '../../../design/components/atoms/Button'
import { mdiPlus } from '@mdi/js'
import { EmojiReactionData } from './CommentList'
import styled from '../../../design/lib/styled'
import EmojiPickHandler from './EmojiPickHandler'
import { CommentReaction } from '../../interfaces/db/commentReaction'
import { Emoji } from 'emoji-mart'

export type CommentReactionsProps = {
  comment: Comment
  users: SerializedUser[]
  addReaction: (comment: Comment, emoji: string) => Promise<any>
  removeReaction: (comment: Comment, reactionId: string) => Promise<any>
  user?: SerializedUser
}

const CommentReactions = ({
  comment,
  addReaction,
  removeReaction,
  users,
  user,
}: CommentReactionsProps) => {
  const filteredReactions = useMemo(() => {
    const emojiReduce = (reactions: CommentReaction[], key: string) =>
      Object.values(
        reactions.reduce((acc, reaction) => {
          const value = reaction[key]

          if (!acc[value]) {
            acc[value] = {
              id: reaction.id,
              emoji: value,
              count: 0,
              userIds: [reaction.teamMember.userId],
            } as EmojiReactionData
          } else {
            acc[value].userIds.push(reaction.teamMember.userId)
          }
          acc[value].count++
          return acc
        }, {})
      )
    const emojiMap = emojiReduce(comment.reactions, 'emoji')
    return emojiMap as EmojiReactionData[]
  }, [comment.reactions])

  const removeOrAddReaction = useCallback(
    async (comment: Comment, emoji: string) => {
      const userReactions = comment.reactions.filter(
        (reaction) =>
          user != null &&
          reaction.emoji == emoji &&
          reaction.teamMember.userId == user.id
      )
      if (userReactions.length > 0) {
        await removeReaction(comment, userReactions[0].id)
      } else {
        await addReaction(comment, emoji)
      }
    },
    [addReaction, removeReaction, user]
  )

  const getCommentReactionUserNames = useCallback(
    (reaction: EmojiReactionData) => {
      const usersData = []
      for (const userMember of users) {
        if (reaction.userIds.indexOf(userMember.id) > -1) {
          usersData.push(userMember.displayName)
        }
      }

      const commentReactionString = ` reacted with :${reaction.emoji}:`
      return (
        <ReactionTooltipContainer>
          <div className={'tooltip__emoji__icon'}>
            <Emoji emoji={reaction.emoji} set='apple' size={50} />
          </div>
          <span>{usersData.join(', ')}</span>
          <span className={'tooltip__reaction__reacted_text'}>
            {commentReactionString}
          </span>
        </ReactionTooltipContainer>
      )
    },
    [users]
  )

  return (
    <CommentReactionsContainer>
      {filteredReactions.map((reaction) => (
        <CommentEmoji
          key={reaction.id}
          tooltip={getCommentReactionUserNames(reaction)}
          tooltipDelay={500}
          size={20}
          className={'thread__comment__reaction'}
          emoji={reaction.emoji}
          onClick={() => removeOrAddReaction(comment, reaction.emoji)}
          emojiTextContent={
            <div className={'thread__comment__reaction_count'}>
              {reaction.count > 999 ? '999+' : `${reaction.count}`}
            </div>
          }
        />
      ))}
      {filteredReactions.length > 0 && (
        <EmojiPickHandler
          comment={comment}
          addReaction={addReaction}
          removeReaction={removeReaction}
          user={user}
        >
          <Button
            className={'comment__add__reaction__button'}
            variant={'icon-secondary'}
            iconPath={mdiPlus}
          />
        </EmojiPickHandler>
      )}
    </CommentReactionsContainer>
  )
}

const CommentReactionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;

  .thread__comment__reaction {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    border-radius: 6px;
    padding: 4px;
    .thread__comment__reaction_count {
      padding-left: ${({ theme }) => theme.sizes.spaces.sm}px;
      padding-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
      margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
      font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    }

    .tooltip__base {
      word-wrap: normal;
      max-width: 150px;
    }
  }
`

const ReactionTooltipContainer = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};

  .tooltip__emoji__icon {
    width: 50%;
    margin: auto auto 5px;
  }

  .tooltip__reaction__reacted_text {
    font-weight: bold;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

export default CommentReactions
