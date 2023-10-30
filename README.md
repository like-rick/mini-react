# mini-react
the purpose of this project is to dive into react and write a simplied framework

1. stack reconciler react
it using recursive algoritm update dom. when we have plenty of dom node, it will spend a lot of time in updating, and that will delay users reponses

2. concurrent reconciler react

tag v1.0:    
we use fiber to represent virtual dom. fiber includes some important filed which is symbol for the dom properties.
we can easily iterate all fiber nodes by linking different fibers. Notice that in tag v1.0, we still update dom in synchronous mode.    

tag v2.0:    
in v2.0, we support concurrent mode by simulate requestIdleCallback. and support Function Component.   

tag v3.0:    
in v3.1, we support useState and useReducer
