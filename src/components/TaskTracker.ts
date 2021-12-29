import { createNode } from "../utils/createNode"

enum templateIDs {
  backgroundColor = "background-color",
  backgroundImg = "background-img",
  previousTimeframeText = "previous-timeframe-text",
}

// create template
const template = document.createElement("template")
template.innerHTML = `<style>
  .component {
    padding-top: 2rem;
    border-radius: 1rem;

    position: relative;
    overflow: hidden;
    z-index: 0;
  }

  #background-color {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 50%;
    z-index: -1;
  }

  #background-img {
    position: absolute;
    top: -0.5rem;
    right: 1rem;
    height: 4.5rem;
  }

  .title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 500;
  }

  .content {
    background-color: var(--clr-neutral-dark);
    border-radius: 1rem;
    padding: 1.5rem;

    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 0.5rem;

    cursor: pointer;
  }

  .content:hover {
    background-color: var(--clr-neutral-light);
  }

  .btn-more {
    all: unset;
    justify-self: end;
  }

  .btn-more::before {
    content: url("/icons/icon-ellipsis.svg");
  }

  .btn-more:hover {
    filter: brightness(200%)
  }

  .time-current {
    font-size: 1.75rem;
    font-weight: 300;
  }

  .time-previous {
    font-size: 0.75rem;
    font-weight: 400;
    justify-self: end;
    color: var(--clr-neutral-very-light);
  }

@media (min-width: 35em) {
    .component {
      width: auto;
      padding-top: 2.5rem;
    }

    .content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      padding: 2rem;
    }

    .time-current {
      grid-column: span 2;
      margin-top: 1rem;
      font-size: 3rem;
    }

    .time-previous {
      grid-column: span 2;
      justify-self: start;
    }
  }
</style>

<div class="component">
  <div id="${templateIDs.backgroundColor}">
    <img id="${templateIDs.backgroundImg}" src="" alt="" />
  </div>
  <div class="content">
    <h2 class="title"><slot name="title"></slot></h2>
    <button class="btn-more" aria-label="Open more menu"></button>
    <div class="time-current"><slot name="time-current"></slot>hrs</div>
    <div class="time-previous">
      <span id="${templateIDs.previousTimeframeText}"></span> -
      <slot name="time-previous"></slot>hrs
    </div>
  </div>
</div>
`

// create custom element
class TaskTrackerConstructor extends HTMLElement {
  constructor() {
    super()

    // create shadow root and add template
    this.attachShadow({ mode: "open" })
    this.shadowRoot?.appendChild(template.content.cloneNode(true))
  }

  // watch the following attributes for changes
  static get observedAttributes() {
    return ["timeframe", "color", "icon-src"] as const
  }

  attributeChangedCallback(
    key: typeof TaskTrackerConstructor.observedAttributes[number],
    __: any,
    newValue: any
  ) {
    // set text for previous time
    if (key === "timeframe") {
      const lastTimeframeTextEl = this.shadowRoot?.getElementById(
        templateIDs.previousTimeframeText
      )

      if (!lastTimeframeTextEl) return

      switch (newValue) {
        case "daily":
          lastTimeframeTextEl.innerText = "Yesterday"
          break
        case "weekly":
          lastTimeframeTextEl.innerText = "Last week"
          break
        case "monthly":
          lastTimeframeTextEl.innerText = "Last month"
      }
    }

    // set background color
    else if (key === "color") {
      const containerEl = this.shadowRoot?.getElementById("background-color")
      containerEl?.style.setProperty(templateIDs.backgroundColor, newValue)
    }

    // set img
    else if (key === "icon-src") {
      const backgroundImgEl = this.shadowRoot?.getElementById(
        templateIDs.backgroundImg
      )
      backgroundImgEl?.setAttribute("src", newValue)
    }
  }
}

export const TaskTracker = createNode("task-tracker", TaskTrackerConstructor)
