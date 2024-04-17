function (element) {
  // @TODO: Subject should eventually come from the HTML element
  const subject = 'World'
  simplyApp.actions.sayHello(subject)
    .then((message) => {
    	alert(message)
    })
}