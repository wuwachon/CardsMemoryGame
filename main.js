const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchFailed: 'CardMatchFailed',
  CardMatched: 'CardMatched',
  GameFinished: 'GameFinished'
}
const Symbol = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]
const view = {
  getCardElement(index) {
    return `<div class="card back" data-index="${index}"></div>`
  },
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbol[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}">
      <p>${number}</p>
    `
  },
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  transformNumber(number) {
    switch(number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  flipCard(... cards) {
    cards.map(card => {
      if (card.matches('.back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(card.dataset.index)
        return
      }
      card.classList.add('back')
      card.innerHTML = ''
    })
  },
  pairedCard(... cards) {
    cards.map(card => card.classList.add('paired'))
  },
  renderScore(score) {
    document.querySelector('#score').innerText = score
  },
  renderTryTime(tryTimes) {
    document.querySelector('#try-time').innerText = tryTimes
  },
  wrongPairAnimation(... cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', () => card.classList.remove('wrong'), {once: true})
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.className = 'completed'
    div.innerHTML = `
    <p>Complete！</p>
    <p>Score：${model.score}</p>
    <p>You've tried：${model.tryTimes}</p>
    `
    document.querySelector('#header').before(div)
  }
}
const utilities = {
  FsiherYates_Shuffle(count) {
    const number = Array.from(Array(count).keys())
    for (let index = count - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * count)
      ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}
const model = {
  revealedCard: [],
  isRevealedCardMatched() {
    return this.revealedCard[0].dataset.index % 13 === this.revealedCard[1].dataset.index % 13
  },
  score: 0,
  tryTimes: 0
}
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utilities.FsiherYates_Shuffle(52))
  },
  dispatchCardAction(card) {
    if (!card.matches('.back')) {
      return
    }

    switch(this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        this.storeCard(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        this.storeCard(card)
        view.renderTryTime(++ model.tryTimes)
        // 判斷兩張牌數字是否一致
        // 配對成功
        if (model.isRevealedCardMatched()) {
          view.pairedCard(... model.revealedCard)
          model.revealedCard = []
          this.currentState = GAME_STATE.FirstCardAwaits
          view.renderScore(model.score += 10)
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
        } else {
        // 配對失敗
          this.currentState = GAME_STATE.CardMatchFailed
          view.wrongPairAnimation(...model.revealedCard)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
  },
  resetCards() {
    view.flipCard(... model.revealedCard)
    model.revealedCard = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
  storeCard(card) {
    model.revealedCard.push(card)
    view.flipCard(card)
  },
  resetGame() {
    controller.currentState = GAME_STATE.FirstCardAwaits
    model.revealedCard = []
    model.score = 0
    model.tryTimes = 0
    view.renderScore(model.score)
    view.renderTryTime(model.tryTimes)
    controller.generateCards()
  }
}

controller.generateCards()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})
document.querySelector('#reset-game').addEventListener('click', controller.resetGame)