// controllers/studentController.js
const db = require('../config/db'); 

exports.registerStudent = async (req, res) => {
  const { name, combination, class_level, rfid_card_number } = req.body;

  if (!name || !combination || !class_level) {
    return res.status(400).json({ 
      message: 'Uzuza ibisabwa byose! Amazina, Ishami, n\'Urwego rw\'ishuri ntibishobora gusigara bwasaho.' 
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query('SELECT COUNT(*) as total FROM students');
    const nextSequence = 1000 + rows[0].total + 1;
    const generatedStudentId = `MIPC-2026-${nextSequence}`;

    const finalRfid = rfid_card_number && rfid_card_number.trim() !== ''
      ? rfid_card_number.trim()
      : Math.floor(10000000 + Math.random() * 90000000).toString();

    // ── FIXED: Changed identity_type to entity_type ──
    const entitySql = `
      INSERT INTO entities (entity_type, name, phone, national_id, license_plate, company_name, academic_bridge_student_id)
      VALUES ('Student', ?, NULL, NULL, NULL, NULL, NULL)
    `;
    const [entityResult] = await connection.query(entitySql, [name]);
    const generatedEntityId = entityResult.insertId;

    const studentSql = `
      INSERT INTO students (id, student_id, name, combination, class_level, discipline_marks, card_status, rfid_card_number)
      VALUES (?, ?, ?, ?, ?, 100, 'ACTIVE', ?)
    `;
    
    await connection.query(studentSql, [
      generatedEntityId, 
      generatedStudentId, 
      name, 
      combination, 
      class_level, 
      finalRfid
    ]);

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Umunyeshuri mushya yanditswe neza muri Sisitemu zombi.',
      student: { 
        id: generatedEntityId,
        student_id: generatedStudentId, 
        name, 
        combination, 
        class_level, 
        rfid_card_number: finalRfid 
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Database Transaction Failure:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Iri karita rya RFID ryafashwe n\'undi munyeshuri.' });
    }
    return res.status(500).json({ message: 'Hagaragaye ikibazo mu kubika amakuru kuri Server.' });
  } finally {
    connection.release();
  }
};

// 2. ADDED: Get All Students
exports.getAllStudents = async (req, res) => {
  try {
    const [students] = await db.query('SELECT * FROM students ORDER BY name ASC');
    return res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. ADDED: Update Student
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, combination, class_level, rfid_card_number, card_status } = req.body;
    
    await db.query(
      `UPDATE students SET name = ?, combination = ?, class_level = ?, rfid_card_number = ?, card_status = ? WHERE id = ?`,
      [name, combination, class_level, rfid_card_number, card_status, id]
    );
    
    return res.status(200).json({ success: true, message: 'Amakuru y\'umunyeshuri yavuguruwe neza.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. ADDED: Delete Student
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM students WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Umunyeshuri yakuwemo neza.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};