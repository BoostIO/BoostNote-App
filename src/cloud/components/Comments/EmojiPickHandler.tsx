import { Comment } from '../../interfaces/db/comments'
import { SerializedUser } from '../../interfaces/db/user'
import React, { useCallback } from 'react'
import { useEmoji } from '../../../design/lib/stores/emoji'
import { useToast } from '../../../design/lib/stores/toast'

export type EmojiPickHandlerProps = {
  comment?: Comment
  addReaction: (comment: Comment, emoji: string) => Promise<any>
  removeReaction: (comment: Comment, reactionId: string) => Promise<any>
  user?: SerializedUser
  className?: string
}

const EmojiPickHandler: React.FC<EmojiPickHandlerProps> = ({
  children,
  comment,
  addReaction,
  removeReaction,
  user,
  className,
}) => {
  const { openEmojiPicker } = useEmoji()
  const { pushMessage } = useToast()

  const setEmoji = useCallback(
    (emoji?: string | undefined) => {
      if (emoji != null && comment != null) {
        const userReactions = comment.reactions.filter(
          (reaction) =>
            user != null &&
            reaction.emoji == emoji &&
            reaction.teamMember.userId == user.id
        )
        if (userReactions.length > 0) {
          removeReaction(comment, userReactions[0].id).catch((err) => {
            pushMessage({
              title: 'Cannot remove reaction.',
              description: JSON.stringify(err),
            })
          })
        } else {
          addReaction(comment, emoji).catch((err) => {
            pushMessage({
              title: 'Cannot add reaction.',
              description: JSON.stringify(err),
            })
          })
        }
      }
    },
    [addReaction, comment, pushMessage, removeReaction, user]
  )
  const emojiPickerClickHandler = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      openEmojiPicker(event, setEmoji)
    },
    [openEmojiPicker, setEmoji]
  )

  return (
    <div className={className} onClick={(e) => emojiPickerClickHandler(e)}>
      {children}
    </div>
  )
}

export default EmojiPickHandler
