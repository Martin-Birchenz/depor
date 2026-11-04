const memberService = require("../services/member.service.js");
const { sendSuccess } = require("../middlewares/responseHandler.js");

class MemberController {
  async create(req, res, next) {
    try {
      const member = await memberService.registerMember(req.body);
      return sendSuccess(res, member, "Member created successfully", 201);
    } catch (error) {
      next(error);
    }
  }
  async getAll(req, res, next) {
    try {
      const { search, status } = req.query;
      const members = await memberService.getMembers({ search, status });
      return sendSuccess(res, members, "Members found successfully", 200);
    } catch (error) {
      next(error);
    }
  }
  async getByDni(req, res, next) {
    try {
      const { dni } = req.params;
      const member = await memberService.getMemberByDni(dni);
      return sendSuccess(res, member, "Member found successfully", 200);
    } catch (error) {
      next(error);
    }
  }
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await memberService.updateMemberStatus(id, status);
      return sendSuccess(
        res,
        updated,
        "Member status updated successfully",
        200,
      );
    } catch (error) {
      next(error);
    }
  }
  async applyPrepaidPlan(req, res, next) {
    try {
      const { id } = req.params;
      const { months, planName, amountPaid } = req.body;

      if (!months || months <= 0) {
        return res
          .status(400)
          .json({ message: "La cantidad de meses debe ser mayor a 0" });
      }

      const result = await memberRepository.applyPrepaidPlan(id, {
        months,
        planName,
        amountPaid,
      });
      return res.status(200).json({
        message: `Plan asignado con éxito. Cuota cubierta hasta ${result.paidUntil}`,
        paidUntil: result.paidUntil,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MemberController();
