import { Struct, Str, Num, Bool, TypeDef } from '../types'

const userSchema = Struct({
  login: Str(),
  id: Num(),
})

const issueSchema = Struct({
  id: Num(),
  number: Num(),
  title: Str(),
  body: Str(),
  state: Str(),
  url: Str(),
  html_url: Str(),
})

const repositorySchema = Struct({
  id: Num(),
  name: Str(),
  full_name: Str(),
  url: Str(),
  html_url: Str(),
  private: Bool(),
  owner: userSchema,
})

const labelSchema = Struct({
  id: Num(),
  url: Str(),
  color: Str(),
  name: Str(),
})

const supportedEvents: Record<string, TypeDef<never>> = {
  'github.issues.opened': Struct({
    issue: issueSchema,
    repository: repositorySchema,
  }),
  'github.issues.edited': Struct({
    issue: issueSchema,
    repository: repositorySchema,
    changes: Struct({
      body: Struct({ from: Str() }),
      title: Struct({ from: Str() }),
    }),
  }),
  'github.issues.labeled': Struct({
    action: Str(),
    issue: issueSchema,
    repository: repositorySchema,
    label: labelSchema,
  }),
}

export default supportedEvents
