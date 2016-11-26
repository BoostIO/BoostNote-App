# Coding Conventions

## Binding callback

It should be placed inside of a constructor.

```js
class SomeComponent {
  constructor (props) {
    super(props)
  }

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

