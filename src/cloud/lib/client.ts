import axios, { AxiosInstance } from 'axios'
import { stringify } from 'querystring'
import { getAccessToken } from './stores/electron'

export function createClient(): AxiosInstance {
  const client = axios.create()
  client.defaults.paramsSerializer = stringify
  client.defaults.baseURL = process.env.BOOST_HUB_BASE_URL
  const accessToken = getAccessToken()
  if (accessToken != null) {
    client.defaults.headers = {
      Authorization: `Bearer ${accessToken}`,
    }
  }
  return client
}
