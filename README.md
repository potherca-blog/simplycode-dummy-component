# Loading a SimplyCode component into a SimplyCode app

[SimplyEdit][1] is a Javascript library that makes it trivial to create webpages
that can be edited by non-technical users.

In a similar fashion, [SimplyCode][1] is an environment to allow users to create web applications.

An application in SimplyCode consists of components. Currently, (2024) these components can only be built in SimplyCode directly.

This project demonstrates how components can be loaded from a different source.

It consists of two parts:

1. [A dummy app][3]
2. [A dummy component][4]

The component is loaded into the app and displayed.

The generated app can be visited at: https://blog.pother.ca/simplycode-dummy-app/generated.html

To make this work, changes were made in both the component and the app.

## Component

The component was created in SimplyCode and then exported as a JS module.

The component can be found at: https://blog.pother.ca/simplycode-dummy-component/index.js

The component was created as follows:

1. <details><summary>A component was created with a command and an action</summary>

   - Action: 
     ```js
     function (subject) {
       return new Promise(function (resolve, reject) {
         resolve(`Hello ${subject}`)
       })
     }
     ```
   - Command:
     ```js
     function (element) {
       simplyApp.actions.sayHello('World').then(message => alert)
     }
     ```
   - Template:
     ```html
     <button data-simply-command="sayHello">Say Hello</button>
     ```
    </details>
2. <details><summary>A page was created with a route and HTML page</summary>

   - The hello HTML contains a `<simply-render rel="hello"></simply-render>`
   - The route for `/` was set to "hello"
   </details>
3. <details><summary>The page-frame was changed to output a JS Module</summary>

   ```handlebars
   export default {
           'componentCss': `
               {{componentCss}}
           `,
           'pageCss': `
               {{pageCss}}
           `,
           'headHtml': `
               {{headHtml}}
           `,
           'bodyHtml': `
               {{bodyHtml}}
           `,
           'footHtml': `
               {{footHtml}}
           `,
           'componentTemplates': `
               {{componentTemplates}}
           `,
           'pageTemplates': `
               {{pageTemplates}}
           `,
           'simplyRawApi': {
               {{rawApi}}
           },
           'simplyDataApi': {
               {{dataApi}}
           },
           'simplyApp': {
               'actions': {
                   {{actions}}
               },
               'commands': {
                   {{commands}}
               },
               'routes': {
                   {{routes}}
               }
           },
           'transformers': {
               {{transformers}}
           },
           'sorters': {
               {{sorters}}
           },
           'dataSources': undefined
               {{dataSources}}
       }
   ```
   </details>

This was all Simplycode compliant, thus a `generated.html` file was created.

As the component is to be [consumed as ESM][5], it was copied to `index.js`.

<details><summary>The final result</summary>

```js
export default {
  'componentCss': `
  `,
  'pageCss': `
  `,
  'headHtml': `
  `,
  'bodyHtml': `
  `,
  'footHtml': `
  `,
  'componentTemplates': `
    <template id="hello">
      <button data-simply-command="sayHello">Say Hello</button>
    </template>
  `,
  'pageTemplates': `
    <template data-simply-template="hello">
      <simply-render rel="hello"></simply-render>
    </template>
  `,
  'simplyRawApi': {},
  'simplyDataApi': {},
  'simplyApp': {
    'actions': {
      'sayHello': function (subject) {
        return new Promise(function (resolve, reject) {
          resolve(`Hello ${subject}`)
        })
      },
    },
    'commands': {
      'sayHello': function (element) {
        simplyApp.actions.sayHello('World').then(message => alert)
      },
    },
    'routes': {
      '/': function (params) {
        editor.pageData.page = 'hello'
      },
    },
  },
  'transformers': {},
  'sorters': {},
  'dataSources': undefined,
}
```

</details>

At this point, the repository looks like this:

```
.
├── components
│   └── hello
│       ├── actions
│       │   └── sayHello.js
│       ├── commands
│       │   └── sayHello.js
│       ├── componentTemplates
│       │   └── hello.html
│       └── meta.json
├── page-frame
│   ├── componentPreview.html
│   ├── fullApp.html          <-- This was changed to output a JS module
│   └── pagePreview.html
├── pages
│   └── hello
│       ├── meta.json
│       ├── pageTemplates
│       │   └── hello.html
│       └── routes
│           ├── home.js
│           └── home.json
├── generated.html
├── index.js                    <-- This is the generated JS module
└── README.md
```

### App

The app was created in SimplyCode.

The app can be found at: https://blog.pother.ca/simplycode-dummy-app/generated.html

The app was created as follows:

1. <details><summary>A page was created with a route and HTML page</summary>

   - The hello HTML contains a `<h1>This is an App</h1>`
   - The route for `/` was set to "home"
   </details>
2. <details><summary>The page-frame was changed to allow us to prevent SimplyEdit from loading.</summary>

   This was done by (ab)using the `data-simply-storage` attribute.
   An event listener was added for a custom `simply-import-fired` event.
   This event is to be fired once the component is loaded.
   ```html
   <script>
       window.waitForImport = {
           connect: () => true,
           disconnect: () => true,
           init: () => true,
           load: callback => window.addEventListener('simply-import-fired', () => callback('{}')),
           save: () => true,
       }
   </script>
   <script src="js/simply-edit.js" data-api-key="muze" data-simply-storage="waitForImport"></script>
   ```
    </details>
3. <details><summary>Import logic was added to the foot HTML of the application.</summary>

   It imports the component and adds the component's templates, actions, and commands to the app.
   It then fires the `simply-import-fired` event so SimplyEdit can continue loading.
   ```html
   <script type="module">
     import dc from 'https://blog.pother.ca/simplycode-dummy-component/index.js'

     document.body.insertAdjacentHTML('beforeend', dc.componentTemplates)
     document.body.querySelector("[data-simply-field=page]").insertAdjacentHTML('beforeend', dc.pageTemplates);

     window.addEventListener("simply-content-loaded", () => {
       Object.entries(dc.simplyApp.actions).forEach(([index,action]) => {
         simplyApp.actions[index] = action
       })

       Object.entries(dc.simplyApp.commands).forEach(([index,command]) => {
         simplyApp.commands[index] = command
       })
     })

     // @CHECKME: Should we fire at the window or at the document? Why?
     editor.fireEvent('simply-import-fired', window)
   </script>
   ```
    </details>

After this, the app route was changed from `home` to `hello` to load the component.

<details><summary>The final result</summary>

```html
<!DOCTYPE HTML>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <script>
      var simplyDataApi = {};
      var simplyApp = {};
      window.addEventListener("simply-content-loaded", function() {
        simply.bind = false;
        var simplyRawApi = {};
        simplyDataApi = {};
        simplyApp = simply.app({
          actions: {},
          commands: {},
          routes: {
            "/" : function (params) {
              editor.pageData.page = 'hello'
            }
          }
        });
      });
    </script>
  </head>
  <body>
    <div class="main" data-simply-field="page" data-simply-content="template">
    <template data-simply-template="home">
      <h1>This is an App</h1>
    </template>
    </div>
    <script src="js/simply.everything.js"></script>
    <script>
      window.waitForImport = {
        init : () => true,
        save : () => true,
        load : function(callback) {
          window.addEventListener("simply-import-fired", () => {
            callback("{}");
          })
        },
        connect: () => true,
        disconnect: () => true
      }
    </script>
    <script src="js/simply-edit.js" data-api-key="muze" data-simply-storage="waitForImport"></script>
    <script type="module">
      import dc from 'https://blog.pother.ca/simplycode-dummy-component/index.js'
    
      document.body.insertAdjacentHTML('beforeend', dc.componentTemplates)
      document.body.querySelector("[data-simply-field=page]").insertAdjacentHTML('beforeend', dc.pageTemplates);
    
      window.addEventListener("simply-content-loaded", () => {
          Object.entries(dc.simplyApp.actions).forEach(([index,action]) => {
              simplyApp.actions[index] = action
          })

          Object.entries(dc.simplyApp.commands).forEach(([index,command]) => {
              simplyApp.commands[index] = command
          })
      })
    
      editor.fireEvent('simply-import-fired', window)
    </script>
  </body>
</html>
```

</details>

At this point, the repository looks like this:

```
.
├── base-components
│   └── import
│       ├── footHtml
│       │   └── importFoot.html   <-- This was changed to import the component
│       └── meta.json
├── generated.html
├── page-frame
│   ├── componentPreview.html     <-- This was changed to prevent SimplyEdit from loading
│   ├── fullApp.html
│   └── pagePreview.html
├── pages
│   └── home
│       ├── meta.json
│       ├── pageTemplates
│       │   └── home.html
│       └── routes
│           ├── home.js
│           └── home.json
└── README.md
```

[1]: https://simplyedit.io/
[2]: https://github.com/SimplyEdit/simplycode
[3]: https://github.com/potherca-blog/simplycode-dummy-app
[4]: https://github.com/potherca-blog/simplycode-dummy-component
[5]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#importing_features_into_your_script
[6]: https://blog.pother.ca/simplycode-dummy-component/index.js
[7]: https://blog.pother.ca/simplycode-dummy-app/generated.html
