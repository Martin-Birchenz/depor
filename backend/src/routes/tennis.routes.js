const { Router } = require("express");
const {
  getTennisCourts,
  getTennisReservations,
  createTennisReservation,
  updateReservationStatus,
  getTennisGroups,
  createTennisGroup,
  getStudentsByGroup,
  addStudentToGroup,
  updateStudentStatus,
} = require("../controllers/tennis.controller.js");

const authMiddleware = require("../middlewares/auth.middleware.js");
const { authorizeRoles } = require("../middlewares/role.middleware.js");

const router = Router();

router.use(authMiddleware);
router.use(authorizeRoles("tenis"));

router.get("/courts", getTennisCourts);
router.get("/reservations", getTennisReservations);
router.post("/reservations", createTennisReservation);
router.patch("/reservations/:id/status", updateReservationStatus);

router.get("/groups", getTennisGroups);
router.post("/groups", createTennisGroup);
router.get("/groups/:groupId/students", getStudentsByGroup);
router.post("/students", addStudentToGroup);
router.patch("/students/:id/status", updateStudentStatus);

module.exports = router;
