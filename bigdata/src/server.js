/**
 * The starting point of the application based on example "Just Task It" in 1DV026 by Mats Loock.
 *
 * @author Mia-Maria Galistel <mg223tj@student.lnu.se>
 * @version 1.0.0
 */

 import express from 'express'
 import hbs from 'express-hbs'
 import session from 'express-session'
 import { dirname, join } from 'path'
 import { fileURLToPath } from 'url'
 import { router } from './routes/router.js'
 import helmet from 'helmet'
 import logger from 'morgan'
 
 /**
  * The main function of the application.
  */
 const main = async () => {
   const app = express()
   const directoryFullName = dirname(fileURLToPath(import.meta.url))
 
   const baseURL = process.env.BASE_URL || '/'

   // Add security to the application by setting various HTTP headers.

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'default-src': ["'self'"],
          'script-src': ["'self'", 'code.jquery.com', 'cdn.jsdelivr.net', 'pro.fontawesome.com'],
          'img-src': ["'self'", 'cdn.jsdelivr.net']
        }
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false
    })
  )
 
   // Log HTTP requests and show status and response time.
   app.use(logger('dev'))
 
   // Setup engine.
   app.engine('hbs', hbs.express4({
     defaultLayout: join(directoryFullName, 'views', 'layouts', 'default'),
     partialsDir: join(directoryFullName, 'views', 'partials')
   }))
   app.set('view engine', 'hbs')
   app.set('views', join(directoryFullName, 'views'))
 
   // Parse requests which are of the content type application/x-www-form-urlencoded.
   // The request object is populated with a body object (req.body).
   app.use(express.urlencoded({ extended: false }))
 
   // Enable body parsing of application/json
   // Populates the request object with a body object (req.body).
   app.use(express.json())
 
   // Provide static files.
   app.use(express.static(join(directoryFullName, '..', 'public')))
 
   // Setup session middleware.
   const sessionOptions = {
     name: process.env.SESSION_NAME,
     secret: process.env.SESSION_SECRET,
     resave: false, // Resave even if a request is not changing the session.
     saveUninitialized: false, // Don't save a created but not modified session.
     state: '',
     cookie: {
       maxAge: 1000 * 60 * 60 * 24 // 1 day
     }
   }
 
   if (app.get('env') === 'production') {
     app.set('trust proxy', 1)
     sessionOptions.cookie.secure = true
   }
 
   // Use session middleware.
   app.use(session(sessionOptions))
 
   // Middleware that is executed before the routes.
   app.use((req, res, next) => {
     // Flash messages - survives only a round trip.
     if (req.session.flash) {
       res.locals.flash = req.session.flash
       delete req.session.flash
     }
 
     // The base URL is passed to the views.
     res.locals.baseURL = baseURL
 
     next()
   })
 
   // List routes.
   app.use('/', router)
 
   // Handle errors.
   app.use(function (err, req, res, next) {
     // 404 Not Found.
     if (err.status === 404) {
       return res
         .status(404)
         .sendFile(join(directoryFullName, 'views', 'errors', '404.html'))
       // 403 Forbidden.
     } else if (err.status === 500) {
       return res
         .status(500)
         .sendFile(join(directoryFullName, 'views', 'errors', '500.html'))
     }
 
     // 500 Internal Server Error. All other errors send this response in production.
     if (req.app.get('env') !== 'development') {
       return res
         .status(500)
         .sendFile(join(directoryFullName, 'views', 'errors', '500.html'))
     }
 
     // Detailed error is only provided in development.
     // The error page is rendered.
     res
       .status(err.status || 500)
       .render('errors/error', { error: err })
   })
 
   // Start the HTTP server which listens for connections.
 
   app.listen(process.env.PORT, () => {
     console.log(`Server running at http://localhost:${process.env.PORT}`)
     console.log('Press Ctrl-C to terminate...')
   })
 }
 
 main().catch(console.error)