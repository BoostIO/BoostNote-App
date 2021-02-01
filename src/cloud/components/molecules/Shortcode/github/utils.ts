import { is } from 'ramda'

interface Label {
  color: string
  id: string
  name: string
}

interface GithubCommon {
  created_at: string
  state: string
  title: string
  html_url: string
  labels: Label[]
  number: number
  user: { login: string }
}

export interface GithubPullRequest extends GithubCommon {
  merged: boolean
}

export interface GithubIssue extends GithubCommon {
  closed: boolean
}

export function isGithubPr(data: any): data is GithubPullRequest {
  return is(Boolean, data.merged) && isGithubCommon(data)
}

export function isGithubIssue(data: any): data is GithubIssue {
  return isGithubCommon(data)
}

function isGithubCommon(data: any): data is GithubCommon {
  if (data == null) {
    return false
  }

  return (
    is(String, data.created_at) &&
    is(String, data.state) &&
    is(String, data.title) &&
    is(String, data.html_url) &&
    is(Number, data.number) &&
    data.user != null &&
    is(String, data.user.login) &&
    is(Array, data.labels) &&
    data.labels.every(isLabel)
  )
}

function isLabel(label: any): label is Label {
  return (
    is(String, label.color) && is(Number, label.id) && is(String, label.name)
  )
}
