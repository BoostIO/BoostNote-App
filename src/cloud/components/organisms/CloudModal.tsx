import React from 'react'
import Modal from '../../../shared/components/organisms/Modal'
import { useModal } from '../../../shared/lib/stores/modal'
import { usePathnameChangeEffect } from '../../lib/router'

const CloudModal = () => {
  const { closeAllModals } = useModal()
  usePathnameChangeEffect(closeAllModals)

  return <Modal />
}

export default CloudModal
