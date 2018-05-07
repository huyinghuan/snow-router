## Sample:

```
//use with pure http server or express middleware
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

//use with koa
router.get("**", (ctx, next)=>{
  console.log(1)
  next()
})
router.get("/:a/:b", (ctx, next)=>{
  console.log(ctx.request.params)
  resp.end()
})


//pure http server
_http.createServer(router.pure).listen(9999)

//koa
koaApp.use(router.koa)

//express
expressAPp.use(route.express)
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


//pure or  express
router.get("/a/:id", async (request, response, next)=>{
  console.log(request.params) // log is  {id:1}
})

//koa
router.get("/a/:id", async (ctx, next)=>{
  console.log(ctx.request.params) // log is  {id:1}
})

```

### router.get(string or regexp, pure Function or koa Middleware or express Middleware)
### router.post
### router.update
### router.patch
### router.delete
### router.all

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

or

```
router.url("/a").get(fn).post(fn).get("/:id", fn).del(fn)

equals:
router.get("/a", ()=>{})
    .post("/a", ()=>{})
    .get("/a/:id", ()=>{})
    .delete("/a/:id", ()=>{})

```

### router.use((req, resp, next)=>{})

you can use this as middleware


```
router.use((req, resp, next)=>{console.log(1);next()})
router.get("/a",(req, resp, next)=>{console.log(2);next()})
router.use((req, resp, next)=>{console.log(3);next()})

// result log: 1, 2, 3

router.use((req, resp, next)=>{console.log(1);next()})
router.use((req, resp, next)=>{console.log(3);next()})
router.get("/a",(req, resp, next)=>{console.log(2);next()})

// result log: 1, 3, 2
```