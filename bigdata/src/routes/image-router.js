/**
 * Image routes based on example "Just Task It" in 1DV026 by Mats Loock
 *
 * @author Mia-Maria Galistel <mg223tj@student.lnu.se>
 * @version 1.0.0
 */

 import express from 'express'
 import { ImageController } from '../controllers/image-controller.js'
 
 export const router = express.Router()
 
 const controller = new ImageController()
 
 router.get('/', controller.process)