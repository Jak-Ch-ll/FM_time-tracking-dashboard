import { createNode } from "../utils/createNode"
import { TaskTracker } from "./TaskTracker"

const template = document.createElement("template")

enum TemplateIds {
  component = "component",
}

enum TemplateClasses {
  changeTimeframeBtn = "change-timeframe-btn",
  active = "active",
}

enum TemplateAttributes {
  dataTimeframe = "data-timeframe",
}

enum Timeframes {
  daily = "daily",
  weekly = "weekly",
  monthly = "monthly",
}

template.innerHTML = `<style>
  * {
    box-sizing: border-box;
  }

  .component {
    margin: 0 auto;
    max-width: 25rem;

    padding: 4rem 1rem;

    display: grid;
    gap: 1rem;
  }

  .header-container {
    background-color: var(--clr-neutral-dark);
    border-radius: 1rem;
  }

  .header {
    background-color: var(--clr-primary);
    border-radius: 1rem;
    padding: 2rem;

    display: flex;
    align-items: center;
  }

  .header-image {
    max-width: 3.5rem;
    border: 0.2rem solid white;
    border-radius: 50%;
    margin-right: 1rem;
  }

  .header-title {
    color: var(--clr-neutral-very-light);
    margin: 0;
    font-weight: 400;
    font-size: 0.9rem;
  }

  .username {
    color: white;
    font-weight: 300;
    font-size: 1.5rem;
    margin-top: 0.2rem;
  }

  .change-timeframe-container {
    padding: 1.7rem 2rem;
    display: flex;
    justify-content: space-between;
  }

  .change-timeframe-btn {
    all: unset;
    cursor: pointer;
    opacity: 0.4;
  }

  .active, .change-timeframe-btn:hover {
    opacity: 1;
  }

  @media (min-width: 35em) {
    .component {
      grid-template-columns: repeat(auto-fit, 15rem);
      justify-content: center;
      gap: 1.5rem;
      max-width: 70rem;
    }

    .header-container {
      height: 100%;
      grid-row: span 2;

      display: flex;
      flex-direction: column;
    }

    .header {
      height: 100%;
      flex-direction: column;
      align-items: flex-start;
      gap: 2.5rem;
    }
    
    .header-image {
      max-width: 5rem;
    }

    .username {
      font-size: 2.3rem;
    }

    .change-timeframe-container {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>
<link rel="stylesheet" href="style.css" />

<div class="component" id="${TemplateIds.component}">
  <div class="header-container">
    <div class="header">
      <img class="header-image" src="/imgs/image-jeremy.png" alt="" />
      <h1 class="header-title">
        Report for
        <div class="username">Jeremy Robson</div>
      </h1>
    </div>
    <div class="change-timeframe-container">
      <button
        class="${TemplateClasses.changeTimeframeBtn}"
        ${TemplateAttributes.dataTimeframe}="${Timeframes.daily}"
      >
        Daily
      </button>
      <button
        class="${TemplateClasses.changeTimeframeBtn} ${TemplateClasses.active}"
        ${TemplateAttributes.dataTimeframe}="${Timeframes.weekly}"
      >
        Weekly
      </button>
      <button
        class="${TemplateClasses.changeTimeframeBtn}"
        ${TemplateAttributes.dataTimeframe}="${Timeframes.monthly}"
      >
        Monthly
      </button>
    </div>
  </div>
</div>
`

type Timeframe = "daily" | "weekly" | "monthly"

interface TimeframeData {
  current: number
  previous: number
}

interface TaskData {
  title: string
  color: string
  iconFilename: string
  timeframes: {
    daily: TimeframeData
    weekly: TimeframeData
    monthly: TimeframeData
  }
}

export class MainAppClass extends HTMLElement {
  timeframe: Timeframe = "weekly"
  changeTimeframeBtns?: NodeListOf<HTMLButtonElement>
  trackerData?: TaskData[]
  trackerEls: HTMLElement[] = []

  constructor() {
    super()

    // create Shadow DOM and get Buttons
    this.attachShadow({ mode: "open" })
    if (this.shadowRoot) {
      this.shadowRoot.appendChild(template.content.cloneNode(true))
      this.changeTimeframeBtns = this.shadowRoot.querySelectorAll(
        `.${TemplateClasses.changeTimeframeBtn}`
      )
    }
  }

  private changeTimeframe(button: HTMLButtonElement) {
    // change active state of buttons
    this.changeTimeframeBtns?.forEach((btn) =>
      btn.classList.remove(TemplateClasses.active)
    )
    button.classList.add(TemplateClasses.active)

    // update timeframe and trackers
    this.timeframe = button.getAttribute(
      TemplateAttributes.dataTimeframe
    ) as Timeframe
    this.setTrackerSlots()
  }

  private renderTrackers() {
    const trackerListEl = this.shadowRoot?.getElementById(TemplateIds.component)

    if (trackerListEl && this.trackerData) {
      this.trackerData.forEach((task) => {
        // create element
        const taskEl = TaskTracker()

        // add it to variable for later update
        this.trackerEls.push(taskEl)

        // set attributes and Slots
        taskEl.setAttribute("timeframe", this.timeframe)
        taskEl.setAttribute("color", task.color)
        taskEl.setAttribute("icon-src", `/icons/${task.iconFilename}`)
        this.setTrackerSlots()

        // add element to DOM
        trackerListEl?.appendChild(taskEl)
      })
    }
  }

  private setTrackerSlots() {
    if (this.trackerData) {
      const { trackerData } = this
      this.trackerEls.forEach((trackerEl, idx) => {
        const data = trackerData[idx]

        trackerEl.innerHTML = `
            <span slot="title">${data.title}</span >
            <span slot="time-current">${
              data.timeframes[this.timeframe].current
            }</span>
            <span slot="time-previous">${
              data.timeframes[this.timeframe].previous
            }</span >
          `
      })
    }
  }

  // lifecycle method - called when element is moved in DOM
  public async connectedCallback() {
    // add event listeners
    this.changeTimeframeBtns?.forEach((btn) => {
      btn.addEventListener("click", () => this.changeTimeframe(btn))
    })

    const res = await fetch("../data.json")
    this.trackerData = (await res.json()) as TaskData[]
    this.renderTrackers()
  }

  public disconnectedCallback() {
    this.changeTimeframeBtns?.forEach((btn) => {
      btn.removeEventListener("click", () => this.changeTimeframe(btn))
    })
  }
}

export const MainApp = createNode("main-app", MainAppClass)
