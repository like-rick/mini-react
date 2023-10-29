import '../requestIdleCallbackPolyfill';
function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.flat().map(child => {
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
    alternate: Ifiber | null,
    props: Element['props'],
    sibling?: Ifiber,
    child?: Ifiber,
    memorizedState?: Array<any>, // store Function Component state
}

interface IinternalRoot {
    current: {alternate: {stateNode: HTMLElement, props: { children: Element[] }}} | any,
    containerInfo: HTMLElement,
}

const isProperty = (key) => key !== 'children';

let workInProgress: IinternalRoot['current']['alternate'] | null = null; // current working node
let workInProgressRoot: IinternalRoot; // virtual root node

let currentHookFiber: Ifiber; // 
let currentHookFiberIndex: number  = 0;

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

    // if current render peroid complete, then switch workInProgressRoot's alternate property with current property, and set alternate property to null
    if (!workInProgress && workInProgressRoot.current.alternate) { 
        workInProgressRoot.current = workInProgressRoot.current.alternate;
        workInProgressRoot.current.alternate = null;
    }
}

function performUnitOfWork(fiber) {
    // process current fiber : create fiber dom and traverse it`s children and craet a link between fiber and child
    const isFunctionComponent = typeof fiber.type === 'function';   
    if (isFunctionComponent) {  
        currentHookFiber = fiber;
        currentHookFiber.memorizedState = []
        currentHookFiberIndex = 0;
        fiber.props.children = [fiber.type(fiber.props)]; 
    } else if (!fiber.stateNode) { 
        // crate dom 
        fiber.stateNode = fiber.type === 'HostText' ? document.createTextNode(fiber.nodeValue) : document.createElement(fiber.type);
        // add property
        Object.keys(fiber.props).filter(isProperty).forEach(key => fiber.stateNode[key] = fiber.props[key]);
    }

    if (fiber.return) { 
        // because Function Component does have not its own stateNode property, we find fiber forward by the link relation until which has stateNode peoperty
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
    // in mount period, there do not exist alternate in fiber  and when corresponing fiber mounted it will own alternate fiber. so here we firstly check whether the fiber is mounted or not
    let oldFiber: Ifiber | undefined = fiber.alternate?.child;
    fiber.props.children.forEach((child, index) => {
        let newFiber: Ifiber;
        if (!oldFiber) {
            // mount period
            newFiber = {
                type: child.type,
                stateNode: null,
                props: child.props,
                return: fiber,
                alternate: null,
            };
        } else {
            // update period
            newFiber = {
                type: child.type,
                stateNode: oldFiber.stateNode,
                props: child.props,
                return: fiber,
                alternate: oldFiber,
            };
        }

        // find corresponding oldFiber
        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }

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

function useState(initialState) {
    const oldHook = currentHookFiber.alternate?.memorizedState?.[currentHookFiberIndex];
    const hook = {
        state: oldHook ? oldHook.state : initialState,
        queue: [],
        dispatch: oldHook ? oldHook.dispatch : null,
    }
 
    const actions = oldHook ? oldHook.queue : [];
    actions.forEach(action => {
        hook.state = typeof action === 'function' ? action(hook.state) : action;
    });
    if (!hook.dispatch) {
        hook.dispatch = function (oldHook) {
            return (action) => {
                oldHook.queue.push(action);   
                // re-rerender 
                workInProgressRoot.current.alternate = {
                    stateNode: workInProgressRoot.current.containerInfo,
                    props: workInProgressRoot.current.props,
                    alternate: workInProgressRoot.current, // 重要，交换 alternate
                };
                workInProgress = workInProgressRoot.current.alternate;
                window.requestIdleCallback(workLoop);
            }
        }
    }
    const setState = hook.dispatch(hook); 
    currentHookFiber.memorizedState?.push(hook);
    currentHookFiberIndex++;
    return [hook.state, setState];
}
function useReducer(reducer, initialState) {
    const [state, setState] = useState(initialState);
    const dispatch = (action) => {
      // reducer = (oldState, action) => newState
      setState((state) => reducer(state, action));
    };
    return [state, dispatch];
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

export default { createElement, createRoot, sleep, act, useState, useReducer }