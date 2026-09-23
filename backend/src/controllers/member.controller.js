const memberService = require("../services/member.services.js");
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
}

module.exports = new MemberController();
