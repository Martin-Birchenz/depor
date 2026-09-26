const reservationService = require("../services/reservation.service");
const { sendSuccess } = require("../middlewares/responseHandler");

class ReservationController {
  async create(req, res, next) {
    try {
      const userId = req.user.idusers;
      const reservation = await reservationService.createReservation(
        req.body,
        userId,
      );
      return sendSuccess(
        res,
        reservation,
        "Reservation created successfully",
        201,
      );
    } catch (error) {
      next(error);
    }
  }
  async getAll(req, res, next) {
    try {
      const { facilityId, date, status } = req.query;
      const reservations = await reservationService.getReservations({
        facilityId: facilityId ? Number(facilityId) : null,
        date,
        status,
      });
      return sendSuccess(
        res,
        reservations,
        "Reservations retrieved successfully",
        200,
      );
    } catch (error) {
      next(error);
    }
  }
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await reservationService.updateReservationStatus(
        id,
        req.body,
      );
      return sendSuccess(
        res,
        updated,
        "Reservation status updated successfully",
        200,
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReservationController();
