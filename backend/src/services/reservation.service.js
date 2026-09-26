const reservationRepository = require("../repositories/reservation.repository");
const facilityRepository = require("../repositories/facility.repository");
const memberRepository = require("../repositories/member.repository");

class ReservationService {
  async createReservation(data, userId) {
    const facility = await facilityRepository.findById(data.facilityId);

    if (!facility) {
      const error = new Error("Facility not found");
      error.statusCode = 404;
      throw error;
    }

    if (!facility.is_active) {
      const error = new Error("Facility is not active");
      error.statusCode = 400;
      throw error;
    }

    const overlapping = await reservationRepository.findOverlapping({
      facilityId: data.facilityId,
      reservationDate: data.reservationDate,
      startTime: data.startTime,
      endTime: data.endTime,
    });

    if (overlapping.length > 0) {
      const error = new Error("Reservation overlaps with another reservation");
      error.statusCode = 409;
      throw error;
    }

    let finalPrice = Number(facility.default_price);

    if (data.memberId) {
      const [members] = await memberRepository.findAll({
        search: null,
        status: null,
      });
      const member = member.find((m) => m.idmembers === data.memberId);

      if (member && member.status === "active") {
        const discountPercent = facility.member_discount_percent || 0;
        finalPrice = finalPrice - finalPrice * (discountPercent / 100);
      }
    }

    const reservationToSave = {
      ...data,
      userId,
      finalPrice,
      status: "confirmada",
    };

    const newId = await reservationRepository.create(reservationToSave);

    return {
      id: newId,
      ...reservationToSave,
    };
  }
  async getReservations(filters) {
    return reservationRepository.findByFilters(filters);
  }
  async updateReservationStatus(id, updateData) {
    const reservation = await reservationRepository.findById(id);

    if (!reservation) {
      const error = new Error("Reservation not found");
      error.statusCode = 404;
      throw error;
    }

    await reservationRepository.updateStatus(id, updateData);
    return await reservationRepository.findById(id);
  }
}

module.exports = new ReservationService();
