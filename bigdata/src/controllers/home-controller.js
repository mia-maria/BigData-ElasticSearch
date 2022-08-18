/**
 * Home Controller.
 *
 * @author Mia-Maria Galistel <mg223tj@student.lnu.se>
 * @version 1.0.0
 */

/**
 * Represents a home-controller.
 */
 export class HomeController {
  /**
   * Renders a view. The rendered HTML string is sent as an HTTP response.
   * index GET.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async index (req, res, next) {
    res.render('home/index')
  } 
}

