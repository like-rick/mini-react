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
    it.only('should support Function Component', async () => {
        const container = document.createElement('div');
        const App = function () {
            return (
                <div id="foo">
                    <div id="bar"></div>
                    <button></button>
                </div>
            )
        }
        const root = MiniReact.createRoot(container);
        await MiniReact.act(() => {
            root.render(<App id="1"/>); 
            expect(container.innerHTML).toBe('');
        })
        expect(container.innerHTML).toBe('<div id="foo"><div id="bar"></div><button></button></div>');
    })
})