type JsonPrimitiveTypeTag = 'number' | 'string' | 'boolean'
type JsonArrayTypeTag = `${JsonPrimitiveTypeTag}[]`

export type JsonTypeDef =
  | JsonPrimitiveTypeTag
  | JsonArrayTypeTag
  | { [key: string]: JsonTypeDef }

const abstractGithubIssueEventDef: JsonTypeDef = {
  //action: 'string',
  issue: {
    id: 'number',
    number: 'number',
    title: 'string',
    body: 'string',
    state: 'string',
    url: 'string',
    html_url: 'string',
  },
  repository: {
    id: 'number',
    name: 'string',
    full_name: 'string',
    url: 'string',
    html_url: 'string',
    private: 'boolean',
    owner: {
      login: 'string',
      id: 'number',
    },
  },
}

const supportedEvents: Record<string, JsonTypeDef> = {
  'github.issues.opened': abstractGithubIssueEventDef,
  'github.issues.edited': {
    ...abstractGithubIssueEventDef,
    changes: {
      body: { from: 'string' },
      title: { from: 'string' },
    },
  },
  'github.issues.labeled': {
    ...abstractGithubIssueEventDef,
    label: {
      id: 'number',
      url: 'string',
      color: 'string',
      name: 'string',
      default: 'boolean',
    },
  },
}

export default supportedEvents
