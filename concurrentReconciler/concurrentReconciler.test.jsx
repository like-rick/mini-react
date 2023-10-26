import { describe, it, expect } from "vitest";
import MiniReact from "./MiniReact";
describe('concurrent reconciler react test', () => {
    it.only('should render jsx', () => {
        const container = document.createElement('div');
        const element = (
            <div id="foo">
                <div id="bar"></div>
                <button></button>
            </div>
        )
        const root = MiniReact.createRoot(container);
        root.render(element)
        expect(container.innerHTML).toBe('<div id="foo"><div id="bar"></div><button></button></div>');
    });
    it('should render jsx with text', () => {
        const container = document.createElement('div');
        const element = (
            <div id="foo">
                <div id="bar"></div>
                <button></button>
                123
            </div>
        )
        const root = MiniReact.createRoot(container);
        root.render(element)
        expect(container.innerHTML).toBe('<div id="foo"><div id="bar"></div><button></button>123</div>');
    })
})