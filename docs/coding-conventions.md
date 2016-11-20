# Coding Conventions

## Bound callback

It should be placed inside of a constructor.

```js
class SomeComponent {
  constructor (props) {
    super(props)
    this.someHandler = e => {
      e.preventDefault()
      ...
    }
  }
}
```

Wrong cases

```jsx
class SomeAnotherComponent {
  constructor (props) {
    super(props)
  }

  // Wrong
  someHandler = e => {
    e.preventDefault()
    ...
  }

  // Wrong
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
