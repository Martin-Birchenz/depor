const facilityService = require("../services/facility.service.js");
const { sendSuccess } = require("../middlewares/responseHandler.js");
const { ca } = require("zod/v4/locales");

class FacilityController {
  async getAll(req, res, next) {
    try {
      const { SportType, all } = req.query;
      const onlyActive = all !== "true";
      const facilities = await facilityService.getAllFacilities({
        SportType,
        onlyActive,
      });
      return sendSuccess(res, facilities, "Facilities found successfully", 200);
    } catch (error) {
      next(error);
    }
  }
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const facility = await facilityService.getFacilityById(id);
      return sendSuccess(res, facility, "Facility found successfully", 200);
    } catch (error) {
      next(error);
    }
  }
  async create(req, res, next) {
    try {
      const facility = await facilityService.createFacility(req.body);
      return sendSuccess(res, facility, "Facility created successfully", 201);
    } catch (error) {
      next(error);
    }
  }
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await facilityService.updateFacility(id, req.body);
      return sendSuccess(res, updated, "Facility updated successfully", 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FacilityController();
