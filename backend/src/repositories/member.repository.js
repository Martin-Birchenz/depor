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
      SELECT idmembers, dni, cuit, birth_date, first_name, last_name, phone, address, email, photo_url, 
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
      SELECT idmembers, dni, cuit, birth_date, first_name, last_name, phone, address, email, photo_url, 
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
      SELECT idmembers, dni, cuit, birth_date, first_name, last_name, phone, address, email, photo_url, 
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
    const paidUntil = data.paidUntil || null;

    const query = `
      INSERT INTO members (
        dni, cuit, birth_date, first_name, last_name, phone, address, email, photo_url, 
        status, paid_until, prepaid_plan, category, tutor_info, family_members, member_number, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    let createdAtFormatted;
    if (data.createdAt) {
      const datePart = data.createdAt.split("T")[0];
      createdAtFormatted = `${datePart} 12:00:00`;
    } else {
      const now = new Date();
      createdAtFormatted = now.toISOString().slice(0, 19).replace("T", " ");
    }

    const birthDate = data.birthDate ? data.birthDate.split("T")[0] : null;

    const params = [
      data.dni ?? null,
      data.cuit ?? null,
      birthDate,
      data.firstName ?? data.first_name ?? null,
      data.lastName ?? data.last_name ?? null,
      data.phone ?? null,
      data.address ?? null,
      data.email ?? null,
      data.photoUrl ?? data.photo_url ?? null,
      data.status ?? "active",
      paidUntil,
      data.prepaidPlan ? JSON.stringify(data.prepaidPlan) : null,
      data.category ?? "general",
      data.tutorInfo ? JSON.stringify(data.tutorInfo) : null,
      data.familyMembers ? JSON.stringify(data.familyMembers) : null,
      memberNum,
      createdAtFormatted,
    ];

    const [result] = await pool.execute(query, params);
    return { insertId: result.insertId, memberNumber: memberNum };
  }

  async findAll({ search, status, category }) {
    let query = `
      SELECT idmembers, dni, cuit, birth_date, first_name, last_name, phone, address, email, photo_url, 
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
      query += ` AND (dni LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR cuit LIKE ? OR phone LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async update(id, data) {
    const fields = [];
    const params = [];

    if (data.dni !== undefined) {
      fields.push("dni = ?");
      params.push(data.dni);
    }
    if (data.cuit !== undefined) {
      fields.push("cuit = ?");
      params.push(data.cuit || null);
    }
    if (data.birthDate !== undefined || data.birth_date !== undefined) {
      fields.push("birth_date = ?");
      const bDate = data.birthDate || data.birth_date;
      params.push(bDate ? bDate.split("T")[0] : null);
    }
    if (data.firstName !== undefined || data.first_name !== undefined) {
      fields.push("first_name = ?");
      params.push(data.firstName || data.first_name);
    }
    if (data.lastName !== undefined || data.last_name !== undefined) {
      fields.push("last_name = ?");
      params.push(data.lastName || data.last_name);
    }
    if (data.phone !== undefined) {
      fields.push("phone = ?");
      params.push(data.phone);
    }
    if (data.address !== undefined) {
      fields.push("address = ?");
      params.push(data.address || null);
    }
    if (data.email !== undefined) {
      fields.push("email = ?");
      params.push(data.email || null);
    }
    if (data.photoUrl !== undefined || data.photo_url !== undefined) {
      fields.push("photo_url = ?");
      params.push(data.photoUrl || data.photo_url || null);
    }
    if (data.category !== undefined) {
      fields.push("category = ?");
      params.push(data.category);
    }
    if (data.memberNumber !== undefined) {
      fields.push("member_number = ?");
      params.push(Number(data.memberNumber));
    }
    if (data.createdAt !== undefined || data.created_at !== undefined) {
      const cDate = (data.createdAt || data.created_at).split("T")[0];
      fields.push("created_at = ?");
      params.push(`${cDate} 12:00:00`);
    }
    if (data.paidUntil !== undefined || data.paid_until !== undefined) {
      fields.push("paid_until = ?");
      params.push(data.paidUntil || data.paid_until || null);
    }
    if (data.tutorInfo !== undefined) {
      fields.push("tutor_info = ?");
      params.push(data.tutorInfo ? JSON.stringify(data.tutorInfo) : null);
    }
    if (data.familyMembers !== undefined) {
      fields.push("family_members = ?");
      params.push(
        data.familyMembers ? JSON.stringify(data.familyMembers) : null,
      );
    }

    if (fields.length === 0) return true;

    params.push(id);
    const query = `UPDATE members SET ${fields.join(", ")} WHERE idmembers = ?`;
    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  }

  async updateStatus(id, status) {
    const query = `UPDATE members SET status = ? WHERE idmembers = ?`;
    const [result] = await pool.execute(query, [status, id]);
    return result.affectedRows > 0;
  }

  async applyPrepaidPlan(id, { months, planName, amountPaid }) {
    const member = await this.findById(id);
    if (!member) throw new Error("Socio no encontrado");

    const now = new Date();
    let baseDate =
      member.paid_until && new Date(member.paid_until) > now
        ? new Date(member.paid_until)
        : now;

    baseDate.setMonth(baseDate.getMonth() + Number(months));
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
