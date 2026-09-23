const memberRepository = require("../repositories/member.repository.js");

class MemberService {
  async registerMember(data) {
    const existingDni = await memberRepository.findByDni(data.dni);

    if (existingDni) {
      const error = new Error("DNI already exists");
      error.statusCode = 409;
      throw error;
    }

    if (data.memberNumber) {
      const existingNumber = await memberRepository.findByMemberNumber(
        data.memberNumber,
      );

      if (existingNumber) {
        const error = new Error("Member number already exists");
        error.statusCode = 409;
        throw error;
      }
    }

    const newId = await memberRepository.create(data);

    return {
      id: newId,
      ...data,
    };
  }
  async getMembers(filters) {
    return await memberRepository.findAll(filters);
  }
  async getMemberByDni(dni) {
    const member = await memberRepository.findByDni(dni);

    if (!member) {
      const error = new Error("Member not found");
      error.statusCode = 404;
      throw error;
    }

    return member;
  }
}

module.exports = new MemberService();
