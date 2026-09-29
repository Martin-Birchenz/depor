const campRegistrationRepository = require("../repositories/campRegistration.js");

class CampRegistrationService {
  async register(data) {
    const newId = await campRegistrationRepository.create(data);
    return {
      id: newId,
      ...data,
      status: "pendiente",
    };
  }
  async getRegistrations(filters) {
    return await campRegistrationRepository.findAll(filters);
  }
  async updateStatus(id, status) {
    const registration = await campRegistrationRepository.findById(id);

    if (!registration) {
      const error = new Error("Registration not found");
      error.statusCode = 404;
      throw error;
    }

    await campRegistrationRepository.updateStatus(id, status);
    return await campRegistrationRepository.findById(id);
  }
}

module.exports = new CampRegistrationService();
