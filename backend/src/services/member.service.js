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
  async updateMemberStatus(id, status) {
    const member = await memberRepository.findById(id);
    if (!member) {
      const error = new Error("Member not found");
      error.statusCode = 404;
      throw error;
    }
    await memberRepository.updateStatus(id, status);
    return await memberRepository.findById(id);
  }
  async updateMember(id, data) {
    const member = await memberRepository.findById(id);
    if (!member) {
      const error = new Error("Socio no encontrado");
      error.statusCode = 404;
      throw error;
    }

    // Si cambió el DNI, validar que no choque con otro socio
    if (data.dni && data.dni !== member.dni) {
      const existing = await memberRepository.findByDni(data.dni);
      if (existing && (existing.idmembers || existing.id) !== Number(id)) {
        const error = new Error("El DNI ya pertenece a otro socio");
        error.statusCode = 409;
        throw error;
      }
    }

    // Si cambió el N° de socio, validar colisión
    if (
      data.memberNumber &&
      Number(data.memberNumber) !== Number(member.member_number)
    ) {
      const existingNum = await memberRepository.findByMemberNumber(
        Number(data.memberNumber),
      );
      if (
        existingNum &&
        (existingNum.idmembers || existingNum.id) !== Number(id)
      ) {
        const error = new Error("El número de socio ya está asignado");
        error.statusCode = 409;
        throw error;
      }
    }

    await memberRepository.update(id, data);
    return await memberRepository.findById(id);
  }
}

module.exports = new MemberService();
