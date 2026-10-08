const campRegistrationService = require("../services/campRegistration.service");
const { sendSuccess } = require("../middlewares/responseHandler");

class CampRegistrationController {
  async create(req, res, next) {
    try {
      const registration = await campRegistrationService.register(req.body);
      return sendSuccess(
        res,
        registration,
        "Registration created successfully",
        201,
      );
    } catch (error) {
      next(error);
    }
  }
  async getAll(req, res, next) {
    try {
      const { status, search } = req.query;
      const registrations = await campRegistrationService.getRegistrations({
        status,
        search,
      });
      return sendSuccess(
        res,
        registrations,
        "Registrations found successfully",
        200,
      );
    } catch (error) {
      next(error);
    }
  }
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await campRegistrationService.updateStatus(id, status);
      return sendSucces(
        res,
        updated,
        "Registration status updated successfully",
        200,
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CampRegistrationController();
