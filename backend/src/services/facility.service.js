const facilityRepository = require("../repositories/facility.repository.js");

class FacilityService {
  async getAllFacilities(filters) {
    return await facilityRepository.findAll(filters);
  }
  async getFacilityById(id) {
    const facility = await facilityRepository.findById(id);

    if (!facility) {
      const error = new Error("Facility not found");
      error.statusCode = 404;
      throw error;
    }

    return facility;
  }
  async createFacility(data) {
    const newId = await facilityRepository.create(data);

    return {
      id: newId,
      ...data,
    };
  }
  async updateFacility(id, data) {
    await this.getFacilityById(id);
    await facilityRepository.update(id, data);
    return await facilityRepository.findById(id);
  }
}

module.exports = new FacilityService();
