import { observable, action } from 'mobx'
import DataStore from './DataStore';

interface AppStatusProps {
  data: DataStore
}

export default class AppStatus {
  @observable dataIsInitialized: boolean
  @observable data: DataStore = new DataStore()

  constructor ({
    data
  }: AppStatusProps) {
    this.data = data
  }

  @action setDataIsInitialized (value: boolean) {
    this.dataIsInitialized = value
  }

  async initializeData () {
    await this.data.init()
    this.setDataIsInitialized(true)
  }
}
