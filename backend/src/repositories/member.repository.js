const pool = require("../config/db.js");

class MemberRepository {
  async getNextMemberNumber() {
    const query = `SELECT MAX(member_number) as maxNumber FROM members`;
    const [rows] = await pool.execute(query);
    const maxNum = rows[0]?.maxNumber;
    return maxNum ? Number(maxNum) + 1 : 1;
  }

  async findByDni(dni) {
    const query = `
      SELECT idmembers, dni, cuit, first_name, last_name, phone, email, photo_url, 
             status, paid_until, prepaid_plan, category, tutor_info, family_members, 
             member_number, created_at 
      FROM members 
      WHERE dni = ? 
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [dni]);
    return rows[0] || null;
  }

  async findByMemberNumber(memberNumber) {
    const query = `
      SELECT idmembers, dni, cuit, first_name, last_name, phone, email, photo_url, 
             status, paid_until, prepaid_plan, category, tutor_info, family_members, 
             member_number, created_at 
      FROM members 
      WHERE member_number = ? 
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [memberNumber]);
    return rows[0] || null;
  }

  async findById(id) {
    const query = `
      SELECT idmembers, dni, cuit, first_name, last_name, phone, email, photo_url, 
             status, paid_until, prepaid_plan, category, tutor_info, family_members, 
             member_number, created_at 
      FROM members 
      WHERE idmembers = ? 
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  async create(data) {
    const memberNum = data.memberNumber ?? (await this.getNextMemberNumber());

    // Si al registrarse ya se le asigna fecha de pago, se usa; de lo contrario null
    const paidUntil = data.paidUntil || null;

    const query = `
      INSERT INTO members (
        dni, cuit, first_name, last_name, phone, email, photo_url, 
        status, paid_until, prepaid_plan, category, tutor_info, family_members, member_number, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const createdAt = data.createdAt ? new Date(data.createdAt) : new Date();

    const params = [
      data.dni ?? null,
      data.cuit ?? null,
      data.firstName ?? data.first_name ?? null,
      data.lastName ?? data.last_name ?? null,
      data.phone ?? null,
      data.email ?? null,
      data.photoUrl ?? data.photo_url ?? null,
      data.status ?? "active",
      paidUntil,
      data.prepaidPlan ? JSON.stringify(data.prepaidPlan) : null,
      data.category ?? "general",
      data.tutorInfo ? JSON.stringify(data.tutorInfo) : null,
      data.familyMembers ? JSON.stringify(data.familyMembers) : null,
      memberNum,
      createdAt,
    ];

    const [result] = await pool.execute(query, params);
    return { insertId: result.insertId, memberNumber: memberNum };
  }

  async findAll({ search, status, category }) {
    let query = `
      SELECT idmembers, dni, cuit, first_name, last_name, phone, email, photo_url, 
             status, paid_until, prepaid_plan, category, tutor_info, family_members, 
             member_number, created_at 
      FROM members 
      WHERE 1=1 `;

    const params = [];

    if (status && status !== "todos") {
      query += ` AND status = ?`;
      params.push(status);
    }

    if (category && category !== "todas") {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (search) {
      query += ` AND (dni LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR cuit LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async updateStatus(id, status) {
    const query = `UPDATE members SET status = ? WHERE idmembers = ?`;
    const [result] = await pool.execute(query, [status, id]);
    return result.affectedRows > 0;
  }

  // Registrar un plan adelantado / obra
  async applyPrepaidPlan(id, { months, planName, amountPaid }) {
    const member = await this.findById(id);
    if (!member) throw new Error("Socio no encontrado");

    const now = new Date();
    let baseDate =
      member.paid_until && new Date(member.paid_until) > now
        ? new Date(member.paid_until)
        : now;

    // Sumar meses
    baseDate.setMonth(baseDate.getMonth() + Number(months));

    // Formato YYYY-MM-DD estricto para MySQL DATE
    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, "0");
    const day = String(baseDate.getDate()).padStart(2, "0");
    const newPaidUntil = `${year}-${month}-${day}`;

    const planDetail = {
      planName: planName || "Plan Adelantado de Obras",
      monthsPrepaid: Number(months),
      amountPaid: Number(amountPaid) || 0,
      appliedAt: new Date().toISOString(),
      paidUntil: newPaidUntil,
    };

    const query = `
    UPDATE members 
    SET status = 'active', 
        paid_until = ?, 
        prepaid_plan = ? 
    WHERE idmembers = ?
  `;

    const [result] = await pool.execute(query, [
      newPaidUntil,
      JSON.stringify(planDetail),
      id,
    ]);
    return { success: result.affectedRows > 0, paidUntil: newPaidUntil };
  }

  // Extender 1 mes regular tras pago en Mercado Pago
  async extendRegularMonth(id) {
    const member = await this.findById(id);
    if (!member) return false;

    const now = new Date();
    let baseDate =
      member.paid_until && new Date(member.paid_until) > now
        ? new Date(member.paid_until)
        : now;

    baseDate.setMonth(baseDate.getMonth() + 1);
    const newPaidUntil = baseDate.toISOString().split("T")[0];

    const query = `
      UPDATE members 
      SET status = 'active', 
          paid_until = ? 
      WHERE idmembers = ?
    `;
    const [result] = await pool.execute(query, [newPaidUntil, id]);
    return result.affectedRows > 0;
  }

  // Revisión masiva de vencimientos (para el cronjob)
  async updateExpiredMemberships() {
    const today = new Date().toISOString().split("T")[0];
    const query = `
      UPDATE members 
      SET status = 'debtor' 
      WHERE category != 'honorario' 
        AND status = 'active' 
        AND paid_until IS NOT NULL 
        AND paid_until < ?
    `;
    const [result] = await pool.execute(query, [today]);
    return result.affectedRows;
  }

  async extendMonths(id, months = 1) {
    const member = await this.findById(id);
    if (!member) return false;

    const now = new Date();
    let baseDate =
      member.paid_until && new Date(member.paid_until) > now
        ? new Date(member.paid_until)
        : now;

    baseDate.setMonth(baseDate.getMonth() + Number(months));
    const newPaidUntil = baseDate.toISOString().split("T")[0];

    const query = `
    UPDATE members 
    SET status = 'active', 
        paid_until = ? 
    WHERE idmembers = ?
  `;
    const [result] = await pool.execute(query, [newPaidUntil, id]);
    return result.affectedRows > 0;
  }
}

module.exports = new MemberRepository();
