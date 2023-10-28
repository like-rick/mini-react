import '../requestIdleCallbackPolyfill';
function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child => {
                return typeof child !== 'object' ? createTextElement(child) : child;
            })
        }
    }
}

// text node only has nodeValus property and it`s type is HostText
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

interface Ifiber {
    type: string,
    return: Ifiber,
    stateNode: HTMLElement | null,
    props: Element['props'],
    sibling?: Ifiber,
    child?: Ifiber,
}

interface IinternalRoot {
    current: {alternate: {stateNode: HTMLElement, props: { children: Element[] }}} | any,
    containerInfo: HTMLElement,
}

const isProperty = (key) => key !== 'children';

let workInProgress: IinternalRoot['current']['alternate'] | null = null; // current working node
let workInProgressRoot: IinternalRoot | null = null; // virtual root node

class MiniReact {

    private _internalRoot: IinternalRoot;
    constructor(container: HTMLElement) {
        this._internalRoot = {
            current: null,
            containerInfo: container,
        }
    }

    render(element: Element) {
        this._internalRoot.current = {
            alternate: {
                stateNode: this._internalRoot.containerInfo,
                props: {
                    children: [element]
                }
            }
        }
        workInProgressRoot = this._internalRoot;
        workInProgress = workInProgressRoot.current.alternate;
        window.requestIdleCallback(workLoop); 
        // workLoop(workInProgress);
    }

}

function workLoop() { 
    while(workInProgress) {
        workInProgress = performUnitOfWork(workInProgress);
    }
}

function performUnitOfWork(fiber) {
    // process current fiber : create fiber dom and traverse it`s children and craet a link between fiber and child
    const isFunctionComponent = typeof fiber.type === 'function';
    if (isFunctionComponent) { 
        fiber.props.children = [fiber.type(fiber.props)]
    } else if (!fiber.stateNode) {
        // crate dom 
        fiber.stateNode = fiber.type === 'HostText' ? document.createTextNode(fiber.nodeValue) : document.createElement(fiber.type);
        // add property
        Object.keys(fiber.props).filter(isProperty).forEach(key => fiber.stateNode[key] = fiber.props[key]);
    }

    if (fiber.return) { 
        let parentFiber = fiber.return;
        while(!parentFiber.stateNode) {
            parentFiber = parentFiber.return;
        }
        if (fiber.stateNode) {
            parentFiber.stateNode.appendChild(fiber.stateNode);
        }
    }

    // create links
    let previousFiber: Ifiber | null = null;
    fiber.props.children.forEach((child, index) => {
        const newFiber: Ifiber = {
            type: child.type,
            return: fiber,
            props: child.props,
            stateNode: null,
        };

        if (index === 0) {
            fiber.child = newFiber;
        } else if (previousFiber) {
            previousFiber.sibling = newFiber;
        }
        previousFiber = newFiber;
    });

    return getNextFiber(fiber);
}

function getNextFiber(fiber: Ifiber) {
    if (fiber.child) {
        return fiber.child;
    }

    while(fiber) {
        if (fiber.sibling) {
            return fiber.sibling
        }
        fiber = fiber.return;
    }

    return null;
}

function createRoot(container) {
    // container is the root
    return new MiniReact(container);
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function act(callback): Promise<void> {
    callback();
    return new Promise((resolve) => {
        function loop() {
            if (workInProgress) {
                window.requestIdleCallback(loop);
            } else {
                resolve();
            }
        }
        loop();
    })
}

export default { createElement, createRoot, sleep, act }