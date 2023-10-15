# maddy-dist

Use [maddy](http://maddy.email) as an npm module for tighter integration with node apps (e.g. test fixtures). See the maddy documentation for usage: https://maddy.email/.

## Usage

`npm install maddy-dist`

Put a `Corefile` in the current working directory.

```javascript
import maddy from "maddy-dist";
const server = await maddy();
// You can also pass in a custom environment
const server = await maddy({
  MY_VARIABLE: "www.example.org",
});

// And shut down when you are done
server.stop();
```
