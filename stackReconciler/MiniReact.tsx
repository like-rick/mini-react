function createElement(type: string, props: any, ...children: []) {
    return {
        type,
        props: {
            ...props,
            children: children.map((child) => {
                return typeof child !== 'object' ? createTextElement(child) : child;
            }),
        }
    }
}

function createTextElement(text) {
    return {
        type: 'HostText',
        props: {
            nodeValue: text,
            children: [],
        }
    }
}

interface Element {
    type: string;
    props: {
        nodeValue?: string;
        children: Element[];
    },
}

const isProperty = (key: string): boolean => key !== 'children';

class MiniReact {

    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }
    
    renderImpl(element: Element, parent: HTMLElement) {
        const { type, props } = element;
        const { nodeValue = '', children } = props;
        const isHostTextDom = type === 'HostText';
        const dom = isHostTextDom ? document.createTextNode(nodeValue) : document.createElement(type);
        Object.keys(props).map(key => {
            if (isProperty(key)) {
                dom[key] = props[key];
            }
        })
        if (dom instanceof HTMLElement) {
            children.forEach(child => {
                this.renderImpl(child, dom);
            })
        }
        parent.appendChild(dom);
    }

    render(element: Element) {
        this.renderImpl(element, this.container);
    }

}

function createRoot(container) {
    return new MiniReact(container);
}

export default { createElement, createRoot };