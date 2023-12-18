const express = require("express")
require("dotenv").config()

const router = express.Router()
const swaggerUi = require("swagger-ui-express")

const swaggerDocument = require("../swagger.json")
const { launchBrowserTo, closeBrowser } = require("../utils")

router.use("/docs", swaggerUi.serve)
router.get("/docs", swaggerUi.setup(swaggerDocument))

router.get("/", (_req, res) => {
  res.send("Hello Asksuite World!")
})

router.post("/search", async (req, res) => {
  const { checkin, checkout } = req.body
  let { adults, children } = req.body

  const checkinDate = new Date(checkin)
  const checkoutDate = new Date(checkout)

  // basic validation
  if (!checkin || !checkout) {
    return res.status(400).send("Missing check-in or check-out date")
  }

  if (checkinDate >= checkoutDate) {
    return res.status(400).send("Check-in date must be before checkout date")
  }

  // default values if no optional parameters are passed
  if (!adults) {
    adults = process.env.ADULTS_NUMBER
  }

  if (!children) {
    children = process.env.CHILDREN_NUMBER
  }

  // URL building
  const url = `${process.env.BASE_URL}&${process.env.CHECKIN_QUERY_PARAM}=${checkin}&${process.env.CHECKOUT_QUERY_PARAM}=${checkout}&${process.env.ADULTS_NUMBER_QUERY_PARAM}=${adults}&${process.env.CHILDREN_NUMBER_QUERY_PARAM}=${children}`

  const { browser, page, resultRequestInterception } = await launchBrowserTo({
    url,
    dumpio: true,
    debug: true,
    waitForLoad: true,
    selectorForLoad: "div.q-carousel__slide",
    requestInterception: process.env.SHOULD_INTERCEPT_REQUESTS === "true",
    requestInterceptionURL: "consulta-disponibilidade",
  }).catch(() => {
    return res.status(404).send("No rooms available for the given parameters")
  })

  const resultRequestInterceptionData = await resultRequestInterception

  if (resultRequestInterceptionData) {
    await closeBrowser(browser)

    if (!resultRequestInterceptionData.length) {
      return res.status(404).send("No rooms available for the given parameters")
    }

    const rooms = resultRequestInterceptionData.map((room) => {
      return {
        name: room.nome,
        description: room.descricao,
        price: room.tarifas[0].valorMedioDiariaComDesconto.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        image: room.imagemPrincipal,
      }
    })

    return res.status(200).json(rooms)
  }

  const rooms = await page.evaluate(async () => {
    const nameArray = document.querySelectorAll("div.room-option-title.desktop-only > h3")
    const priceArray = document.querySelectorAll(
      "div.room-rates-wrapper > div.room-rates-price > div.daily-price > p.daily-price--total > strong span.term"
    )
    const photoArray = document.querySelectorAll(
      "div.lb-carousel.room-option--carousel > span > div > div.q-carousel__slides-container > div > div"
    )
    const descriptionArrayToOpen = document.querySelectorAll(
      "div.room-infos > div.room-infos-guests-block > div.room-option-title.desktop-only > p"
    )

    if (!nameArray.length || !priceArray.length || !photoArray.length || !descriptionArrayToOpen.length) {
      return null
    }

    const getDescriptionArray = async () => {
      const descriptionArrayInner = []

      for (let i = 0; i < descriptionArrayToOpen.length; i++) {
        descriptionArrayToOpen[i].click()
        // a small delay to wait for the modal to open, we just need to wait for the DOM to be updated,
        // so we can use the 0 as a timeout so it will be executed in the next tick of the event loop
        await new Promise((resolve) => setTimeout(resolve, 0))
        const description = document.querySelectorAll("div.modal-gallery--description > div > p")[0].innerText
        descriptionArrayInner.push(description)
        document.querySelectorAll("div.modal-gallery-content > button.modal-gallery--close")[0].click()
      }

      return descriptionArrayInner
    }

    const descriptionArray = await getDescriptionArray()

    const name = [...nameArray].map((element) => element.innerText)
    const price = [...priceArray].map((element) => element.innerText)
    const photo = [...photoArray].map((element) => element.style.backgroundImage.slice(5, -2))
    const description = descriptionArray

    const roomsInner = []

    for (let i = 0; i < name.length; i++) {
      roomsInner.push({
        name: name[i],
        description: description[i],
        price: price[i],
        image: photo[i],
      })
    }

    return roomsInner
  })

  await closeBrowser(browser)

  if (!rooms) {
    return res.status(404).send("No rooms available for the given parameters")
  }

  return res.status(200).json(rooms)
})

module.exports = router
