## Sample:

```
const Router = require('snow-router')
var router = new Router()
router.get("**", (req, resp, next)=>{
  console.log(1)
  next()
})
router.get("/:a/:b", (req, resp, next)=>{
  console.log(req.params)
  resp.end()
})
_http.createServer(function(req, resp){
  router.do(req, resp)
}).listen(9999)
```

## API

use `**` match one or more deep path, 
e.g.:
```
router.get("**", ()=>) #  match all router
router.get("/a/**", ()=>) #match all router begin with `/a/` for example: /a/x, /a/xx/x/x/x
```
use `*` match one deep path
e.g.
```
router.get("*", ()=>) #just match /a, /b, /c,  if path is `/a/b` , response 404 
router.get("/a/*", ()=>) #just match /a/1, /a/b, /a/2,  if path is `/a/b/1` , response 404 
```

### router.get(string or regexp, (request, response)=>{})
### router.post(string or regexp, (request, response)=>{})
### router.update(string or regexp, (request, response)=>{})
### router.patch(string or regexp, (request, response)=>{})
### router.delete(string or regexp, (request, response)=>{})
### router.all(string or regexp, (request, response)=>{})

