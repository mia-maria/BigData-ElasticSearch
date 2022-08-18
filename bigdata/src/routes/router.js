/**
 * The routes based on example "Just Task It" in 1DV026 by Mats Loock.
 *
 * @author Mia-Maria Galistel <mg223tj@student.lnu.se>
 * @version 1.0.0
 */

 import express from 'express'
 import { router as homeRouter } from './home-router.js'
 import { router as imageRouter } from './image-router.js'
 
 export const router = express.Router()
 
 router.use('/', homeRouter)
 router.use('/funfact', imageRouter)
 
 router.use('*', (req, res, next) => {
   const error = new Error()
   error.status = 404
   error.message = 'Resource not found'
   next(error)
 })
