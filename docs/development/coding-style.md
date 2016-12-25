# Coding Conventions

We are following `feross/Standard`.

## Callbacks in template literal of Styled components

For shorthand, use `p` for `props`.

```js
styled.div`
  {p => p.theme.someStyleString}
`
```

## Ref

All `ref` should be a call back and bind it to instance directly. So, it can be accessed without calling `refs`.

If the element is wrapped by styled components, it is needed to use `innerRef`.

Also, expressions of the callbacks should be like `c => (this.someName = c)` to prevent the error of eslint. `c` stands for `component`

```jsx
import { MarkdownEditor } from 'components'
const Root = styled.div`
  ...
`

  render () {
    return (
      <Root
        innerRef={c => (this.root = c)}
      >
        <MarkdownEditor
          ref={c => (this.editor = c)}
          value={this.state.content}
          onChange={this.handleContentChange}
        />
      </Root>
    )
  }
```

## Binding callback

It should be placed inside of a constructor.

```js
class SomeComponent {
  someHandler = e => {
    e.preventDefault()
    ...
  }
}
```

Wrong cases

```jsx
class SomeAnotherComponent {
  constructor (props) {
    super(props)

    // This is wrong JUST FOR NOW because React Hot Loader doesn't support.
    this.someHandler = e => {
      e.preventDefault()
      ...
    }
  }

  someAnotherHandler () {
    e.preventDefault()
    ...
  }

  render () {
    return <button
      onClick={this.someAnotherHandler.bind(this)}
      onContextMenu={e => this.someAnotherHandler}
    />
  }
}
```

## `ref` for Styled components

If you tried to use `ref` for styled component, you will get a instance of the component not the element object.
To access the root element of it, you have to access children array.

The library give another option `innerRef`. We use this instead of accessing children.

```jsx
const CustomButton = styled.button`
  font-size: 24px;
`

class WrappedButton {
  someMethod () {
    this.button.focus()
  }

  render () {
    return <CustomButton
      innerRef={c => (this.button = c)}
    />
  }
}
```

