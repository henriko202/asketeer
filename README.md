# Instructions

The API is located on the url: https://asketeer.onrender.com

The OpenAPI specification is located on the url: https://asketeer.onrender.com/docs

Heads up: The API is hosted on a free tier on Render, so it might take a few seconds to start up if it's not being used for a while.

Or you can access it on `localhost:8080/docs` if you run the application locally.

# Explanation

Since this is probably a mockup of a Serverless API, the only new libraries that I've added are:

- `Swagger-UI-Express`: To serve the OpenAPI specification on the `/docs` endpoint
- `prettier`: To format the code
- `eslint`: To enforce code style
  - and it's respective plugins to work with prettier

I've kept the same structure of the boilerplate, but I've added a `utils` folder to write some of the logic that I've used on the `search` endpoint.

To document the code, I've used JSDoc comments, and you can see the documentation on the Swagger UI.

# How to run

It's a simple NodeJS application, so you can run it with the following commands:

```bash
npm install
npm run start
```

# Test Dev Asksuite

Hey! Glad you're here.
I'm going to explain exactly what you'll have to implement in this test and what we expect as outcome.

First of all, we have this nice express.js boilerplate project to assist you so you don't have to create everything from scratch.

## Briefing

The traveller comes to our bot and asks for "Price quotation". Then the bot asks for the dates the traveller wants to
stay at the bot's hotel.
At the moment the traveller fills the requested information the bot needs to search the prices for each room available in the check-in/check-out
timeframe.

You will have to implement the API responsible for doing the searching part.
The necessary information for the crawler is under the [Assets](#assets) session

## What you'll need to do:

- Create a POST endpoint "/search"

  - The expected payload is:

      <pre>
      {
          "checkin": "YYYY-MM-DD", // Check-in date
          "checkout": "YYYY-MM-DD" // Check-out date
      }
      </pre>

    Example

      <pre>
      {
          "checkin": "2021-07-01", 
          "checkout": "2021-07-03"
      }
      </pre>

  - The expected result is an array of rooms:

      <pre>
      [{
          "name": string, // Room name
          "description": string,  // Room description
          "price": string, // Room daily price
          "image": string, // Room main photo
      }]
      </pre>

    Example

      <pre>
      [{
          "name": "STUDIO CASAL",
          "description": "Apartamentos localizados no prÃ©dio principal do Resort, prÃ³ximos a recepÃ§Ã£o e a Ã¡rea de convivÃªncia, com vista para Ã¡rea de estacionamento nÃ£o possuem varanda. Acomoda atÃ© 1 adulto e 1 crianÃ§a ou 2 adultos", 
          "price": "R$ 1.092,00",
          "image": "https://letsimage.s3.amazonaws.com/letsbook/193/quartos/30/fotoprincipal.jpg"
      },
      {
          "name": "CABANA",
          "description": "Apartamentos espalhados pelos jardins do Resort, com vista jardim possuem varanda. Acomoda atÃ© 4 adultos ou 3 adultos e 1 crianÃ§a ou 2 adultos e 2 crianÃ§a ou 1 adulto e 3 crianÃ§as, em duas camas casal.", 
          "price": "R$ 1.321,00",
          "image": "https://letsimage.s3.amazonaws.com/letsbook/193/quartos/32/fotoprincipal.jpg"
      }]
      </pre>

To achieve this result you may:

- With puppeteer, go to the [given URL](#assets)
- Retrieve the needed information to assemble the payload using web crawling methods

## Environment

- Node 10+
- Dotenv setup

Already installed: `express` `puppeteer` `dotenv`

**_Feel free to add any lib you find relevant to your test._**

## Running

- Install dependencies with: `npm install`
- Run as dev: `npm run dev`

Default port is set to `8080`

## Assets

- Crawl URL sample (change dates):
<pre>https://pratagy.letsbook.com.br/D/Reserva?checkin=21%2F06%2F2022&checkout=25%2F06%2F2022&cidade=&hotel=12&adultos=2&criancas=&destino=Pratagy+Beach+Resort+All+Inclusive&promocode=&tarifa=&mesCalendario=6%2F14%2F2022</pre>
- Help images:
  ![sample_1](assets/sample_1.png)

## Test rating

What do we evaluate with this test?

- Dev's capacity of:
  - Self-learning
  - Working with node
  - Understanding an existent project
- Dev's code quality:
  - Clear and maintainable code
  - Coding structure
  - Changes that don't break easily
