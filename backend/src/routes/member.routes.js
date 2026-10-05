const { Router } = require("express");
const memberController = require("../controllers/member.controller.js");
const validate = require("../middlewares/validate.middleware.js");
const authenticate = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/role.middleware.js");
const {
  createMemberSchema,
  updateMemberSchema,
  updateMemberStatusSchema,
} = require("../schemas/member.schema.js");

const router = Router();

router.post("/", validate(createMemberSchema), (req, res, next) =>
  memberController.create(req, res, next),
);

router.use(authenticate);
router.use(authorize(["adminBirchenz", "secretaria"]));

router.get("/", (req, res, next) => memberController.getAll(req, res, next));
router.get("/:id", (req, res, next) =>
  memberController.getById(req, res, next),
);
router.put("/:id", validate(updateMemberSchema), (req, res, next) =>
  memberController.update(req, res, next),
);
router.patch(
  "/:id/status",
  validate(updateMemberStatusSchema),
  (req, res, next) => memberController.updateStatus(req, res, next),
);

module.exports = router;
