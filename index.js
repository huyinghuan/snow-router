const _url = require('url')
const _path = require('path')
var ControllerPool = {
  "get":[],
  "post":[],
  "delete":[],
  "patch":[],
  "update":[],
  "all":[]
}
const  macthRouter = (pathname, match)=>{
  if(match instanceof RegExp){
    if(match.test(pathname)){
      return {}
    }
    return false
  }
  if(pathname == match){
    return {}
  }
  let pathArray = pathname.split('/')
  let matchArray = match.split('/')
  //长度不一样，且不包含通配符, /a/b/c 匹配 /a/:x/:x , /a/** , 不匹配 /a/*
  if(pathArray.length != matchArray.length && match.indexOf('**') != (match.length - 2)){
    return false
  }
  var params = {}
  for(let i = 0, length = pathArray.length; i < length; i++){
    if(pathArray[i] == matchArray[i]){
      continue
    }
    if(matchArray[i] == "**" || matchArray == "*"){
      return params
    }
    if(matchArray[i].indexOf(":")==0){
      params[matchArray[i].replace(':',"")] = pathArray[i]
      continue
    }
    return false
  }
  return params
}

const getMatchRouter = (method, pathname)=>{
  let queue = []
  let copyArray = [].concat(ControllerPool[method])
  copyArray.forEach((control)=>{
    let params = macthRouter(pathname, control.match)
    if(!params){
      return
    }
    control.params = params
    queue.push(control)
  })
  return queue
}

const saveAllRouter = (pathname, controller)=>{
  ["get", "post", "delete", "update", "patch"].forEach((method)=>{ saveRouter(method, pathname, controller)})
}
const saveRouter = (method, pathname, controller)=>{
  pathname = ("/"+pathname).replace(/\/+/g, "/")
  let pathArr = pathname.split('/')
  for(let i = 0, length = pathArr.length; i < length; i++){
    if(pathArr[i] == ""){
      continue
    }
    if(pathArr[i] == "*" || pathArr[i] == "**"){
      if(i != length - 1){
        throw new Error(`* just can use in the path end, Error path:${pathname}`)
      }
      break
    }
    if(!/^[\:]?[A-z0-9\_\-\+\=]+$/.test(pathArr[i])){
      throw new Error(`path must macth regexp '/^[\:]?[A-z0-9\_\-\+\=]+$/', Error path:${pathArr[i]},${pathname}`)
    }
  }
  let processControl = {
    match: pathname,
    controller: controller
  }
  if(!ControllerPool[method]){
    ControllerPool[method] = [processControl]
  }else{
    ControllerPool[method].push(processControl)
  }
}

class RouterURL{
  constructor(pathname){this.pathname = pathname || "/"}
  all(controller){ 
    saveAllRouter(this.pathname, controller);
    return this
  }
  _save(method, pathname, controller){
    if(! controller instanceof Function){
      throw new Error(`Controller must be Function, error define in ${pathname}`)
    }
    if(pathname instanceof Function){
      controller = pathname
      pathname = ""
    }else{
      this.pathname = _path.resolve(this.pathname, pathname)
    }
   
    saveRouter(method,  this.pathname, controller);
    return this
  }
  get(pathname, controller){ return this._save('get', pathname, controller)}
  update(pathname, controller){ return this._save('update', pathname, controller)}
  post(pathname, controller){return this._save('post', pathname, controller)}
  delete(pathname, controller){return this._save('delete', pathname, controller)}
  patch(pathname, controller){return this._save('patch', pathname, controller)}
}

class Router{
  constructor(base){
    this.base = base || "/"
  }
  _getPathname(pathname){
    return _path.resolve(this.base, pathname)
  }
  _save(method, pathname, controller ){
    saveRouter(method, this._getPathname(pathname), controller);
    return this
  }
  url(pathname){ return new RouterURL(this._getPathname(pathname))}
  get(pathname, controller){return this._save('get', pathname, controller) }
  update(pathname, controller){return this._save('update', pathname, controller)}
  post(pathname, controller){return this._save('post', pathname, controller)}
  patch(pathname, controller){return this._save('patch', pathname, controller)}
  delete(pathname, controller){return this._save('delete', pathname, controller)}
  all(pathname, controller){saveAllRouter(this._getPathname(pathname), controller); return this}
  use(controller){saveAllRouter("**", controller); return this}
  async koa(ctx, next){
    let method = ctx.method.toLowerCase()
    let urlObj = _url.parse(ctx.url)
    let pathname = urlObj.pathname.replace(/\/+/,"/")
    //不允许路径中包含*, :
    if(pathname != pathname.replace(/\*/g, "").replace(/\:/g, "")){
      return next()
    }
    if(!ControllerPool[method].length){
      return next()
    }
    let middleQueue = getMatchRouter(method, pathname)
    let middle = async function(){
      let control = middleQueue.pop()
      //返回给koa
      if(!control){
        return next()
      }
      ctx.request.params = control.params
      await control.controller(ctx, middle)
    }
    await middle()
  }

  express(request, response, nextStep){
    let method = request.method.toLowerCase()
    let urlObj = _url.parse(request.url)
    let pathname = urlObj.pathname.replace(/\/+/,"/")
    //不允许路径中包含*, :
    if(pathname != pathname.replace(/\*/g, "").replace(/\:/g, "")){
      return nextStep()
    }
    let middleQueue = getMatchRouter(method, pathname)
    let next = function(){
      let control = middleQueue.pop()
      //返回给koa
      if(!control){
        return next()
      }
      request.params = control.params
      control.controller(request, response, next)
    }
    next()
  }
  pure(request, response){
    let method = request.method.toLowerCase()
    let urlObj = _url.parse(request.url)
    let pathname = urlObj.pathname.replace(/\/+/,"/")
    //不允许路径中包含*, :
    if(pathname != pathname.replace(/\*/g, "").replace(/\:/g, "")){
      response.statusCode = 404
      response.end()
      return
    }
    let middleQueue = getMatchRouter(method, pathname)
    let next = function(){
      let control = middleQueue.pop()
      //返回给koa
      if(!control){
        return next()
      }
      request.params = control.params
      control.controller(request, response, next)
    }
    next()
  }
}

module.exports = Router