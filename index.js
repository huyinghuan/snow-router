const _url = require('url')
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
const methods = ["get", "post", "delete", "update", "patch"]
const saveAllRouter = (pathname, controller)=>{
  methods.forEach((method)=>{ saveRouter(method, pathname, controller)})
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
  constructor(pathname){this.pathname = pathname}
  all(controller){ saveAllRouter(this.pathname, controller);return this}
  get(controller){ saveRouter("get", this.pathname, controller);return this}
  update(controller){ saveRouter("update", this.pathname, controller);return this}
  post(controller){ saveRouter("post", this.pathname, controller);return this}
  delete(controller){saveRouter("delete", this.pathname, controller);return this}
  patch(controller){saveRouter("patch", this.pathname, controller);return this}
}

class Router{
  constructor(){}
  url(pathname){ return new RouterURL(pathname)}
  get(pathname, controller){saveRouter("get", pathname, controller); return this}
  update(pathname, controller){saveRouter("update", pathname, controller); return this}
  post(pathname, controller){saveRouter("post", pathname, controller); return this}
  patch(pathname, controller){saveRouter("patch", pathname, controller); return this}
  delete(pathname, controller){saveRouter("delete", pathname, controller); return this}
  all(pathname, controller){saveAllRouter(pathname, controller); return this}
  use(controller){saveAllRouter("**", controller); return this}
  do(request, response){
    let method = request.method.toLowerCase()
    let urlObj = _url.parse(request.url)
    let pathname = urlObj.pathname.replace(/\/+/,"/")
    //不允许路径中包含*, :
    if(pathname != pathname.replace(/\*/g, "").replace(/\:/g, "")){
      response.statusCode = 404
      response.end()
      return
    }
    let queue = [].concat(ControllerPool[method]).reverse()
    let next = function(){
      let control = queue.pop()
      if(!control){
        response.statusCode = 404
        response.end()
        return
      }
      let params = macthRouter(pathname, control.match)
      if(params){
        request.params = params
        control.controller(request, response, next)
      }else{
        next()
      }
    }
    next()
  }
}

module.exports = Router