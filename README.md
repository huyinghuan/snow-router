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
e.g.
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

use`:xxx` will parse data to req.params

e.g.

```
router.get("/a/:id", (req, response)=>{ 
  //when url is /a/1
  console.log(req.params) // log is  {id:1}
})
```

### router.get(string or regexp, (request, response, next)=>{})
### router.post(string or regexp, (request, response, next)=>{})
### router.update(string or regexp, (request, response, next)=>{})
### router.patch(string or regexp, (request, response, next)=>{})
### router.delete(string or regexp, (request, response, next)=>{})
### router.all(string or regexp, (request, response, next)=>{})

all of above you can use chained calls 
e.g.

```
router.get("xxx", ()=>{})
    .get("xxxx", ()=>{})
    .post("xxx", ()=>{})
```

### router.url(pathname or regexp).get((request, response, next)=>{})

use chained calls:

```
router.url("/a").get((request, response, next)=>{}).post((request, response, next)=>{}).update(...).delete(...).all(...)

equals:

router.get("/a", ()=>{})
    .post("/a", ()=>{})
    .update("/a", ()=>{})
    .delete("/a", ()=>{})
```