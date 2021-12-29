export type CustomElementTagName = `${string}-${string}`

export function createNode(
  elementTagName: CustomElementTagName,
  elementClass: CustomElementConstructor
) {
  // define the custom element in the DOM so it can be used
  window.customElements.define(elementTagName, elementClass)

  // return a function to create an instance of the custom element
  return () => document.createElement(elementTagName)
}
