// @flow
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider, Subscribe, Container } from '../src/unstated';

function render(element) {
  return ReactTestRenderer.create(element).toJSON();
}

async function click({ children = [] }, id) {
  const el: any = children.find(({ props = {} }) => props.id === id);
  el.props.onClick();
}

class CounterContainer extends Container<{ count: number }> {
  state = { count: 0 };
  increment(amount = 1) {
    this.setState({ count: this.state.count + amount });
  }
  decrement(amount = 1) {
    this.setState({ count: this.state.count - amount });
  }
}

function Counter() {
  return (
    <Subscribe to={[CounterContainer]}>
      {counter => (
        <div>
          <span>{counter.state.count}</span>
          <button id="decrement" onClick={() => counter.decrement()}>
            -
          </button>
          <button id="increment" onClick={() => counter.increment()}>
            +
          </button>
        </div>
      )}
    </Subscribe>
  );
}

test('should incresase/decrease state counter in container', async () => {
  let counter = new CounterContainer();
  let tree = render(
    <Provider inject={[counter]}>
      <Counter />
    </Provider>
  );

  expect(counter.state.count).toBe(0);

  await click(tree, 'increment');
  expect(counter.state.count).toBe(1);

  await click(tree, 'decrement');
  expect(counter.state.count).toBe(0);
});

test('should remove subscriber listeners if component is unmounted', () => {
  let counter = new CounterContainer();
  let tree = ReactTestRenderer.create(
    <Provider inject={[counter]}>
      <Counter />
    </Provider>
  );
  const testInstance = tree.root.findByType(Subscribe)._fiber.stateNode;

  expect(counter._listeners.length).toBe(1);
  expect(testInstance.unmounted).toBe(false);

  tree.unmount();

  expect(counter._listeners.length).toBe(0);
  expect(testInstance.unmounted).toBe(true);
});

test('should throw an error if <Subscribe> component is not wrapper with <Provider>', () => {
  spyOn(console, 'error');
  expect(() => render(<Counter />)).toThrowError(
    'You must wrap your <Subscribe> components with a <Provider>'
  );
});
