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

class Router{
  constructor(){}
  __all(method, pathname, controller){
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
  get(pathname, controller){this.__all("get", pathname, controller)}
  update(pathname, controller){this.__all("update", pathname, controller)}
  post(pathname, controller){this.__all("post", pathname, controller)}
  patch(pathname, controller){this.__all("patch", pathname, controller)}
  delete(pathname, controller){this.__all("delete", pathname, controller)}
 
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
    let queue = [].concat(ControllerPool['all']).concat(ControllerPool[method])
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