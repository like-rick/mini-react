import { describe, it, expect } from "vitest";
import MiniReact from "./MiniReact";


describe('concurrent reconciler react test', () => {
    it('should render jsx', async () => {
        const container = document.createElement('div');
        const element = (
            <div id="foo">
                <div id="bar"></div>
                <button></button>
            </div>
        )
        const root = MiniReact.createRoot(container);
        await MiniReact.act(() => {
            root.render(element); 
            expect(container.innerHTML).toBe('');
        })
        expect(container.innerHTML).toBe('<div id="foo"><div id="bar"></div><button></button></div>');
    });
    it('should support Function Component', async () => {
        const container = document.createElement('div');
        const Text = function ({value}) {
            return (
                <span>{value}</span>
            )
        }
        const App = function ({id, children}) {
            return (
                <div id="foo">
                    <div id="bar">{id}</div>
                    <button></button>
                    <Text value={1}/>
                </div>
            )
        }

        const root = MiniReact.createRoot(container);
        await MiniReact.act(() => {
            root.render(<App id="1"><App id='2'></App></App>); 
            expect(container.innerHTML).toBe('');
        })
        expect(container.innerHTML).toBe('<div id="foo"><div id="bar">1</div><button></button><span>1</span></div>');
    });
    it('should support useState', async () => {
        const container = document.createElement('div');
        const globalObj = {};
    
        function App() {
          const [count, setCount] = MiniReact.useState(100);
          globalObj.count = count;
          globalObj.setCount = setCount;
    
          return <div>{count}</div>;
        }
        const root = MiniReact.createRoot(container);
        await MiniReact.act(() => {
          root.render(<App />);
        });
        await MiniReact.act(() => {
          globalObj.setCount((count) => count + 1);
        });
        await MiniReact.act(() => {
          globalObj.setCount(globalObj.count + 1);
        });
        expect(globalObj.count).toBe(102);
    });
    it.only('should support useState', async () => {
        const container = document.createElement('div');
        const globalObj = {};
    
        function reducer(state, action) {
          switch (action.type) {
            case 'add':
              return state + 1;
            case 'sub':
              return state - 1;
          }
        }
    
        function App() {
          const [count, dispatch] = MiniReact.useReducer(reducer, 100);
          globalObj.count = count;
          globalObj.dispatch = dispatch;
    
          return <div>{count}</div>;
        }
        const root = MiniReact.createRoot(container);
        await MiniReact.act(() => {
          root.render(<App />);
        });
        await MiniReact.act(() => {
          globalObj.dispatch({ type: 'add' });
          globalObj.dispatch({ type: 'add' });
        });
        expect(globalObj.count).toBe(102);
    });
})