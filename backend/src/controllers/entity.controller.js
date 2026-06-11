const entityRepo = require('../repositories/entity.repository');

const VALID_ENTITY_TYPES = ['Student', 'Staff', 'Supplier', 'Visitor', 'School_Vehicle'];

/**
 * POST /api/entities
 * Manually register a new entity (student, staff, visitor, etc.).
 */
const createEntity = async (req, res) => {
  try {
    const { entity_type, name, phone, national_id, license_plate, company_name, academic_bridge_student_id } = req.body;

    if (!entity_type || !name) {
      return res.status(400).json({
        success: false,
        message: 'Fields entity_type and name are required.',
      });
    }

    if (!VALID_ENTITY_TYPES.includes(entity_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid entity_type. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}.`,
      });
    }

   // Fix this block inside your controller (createEntity)
const entity = await entityRepo.createEntity({
  entityType: entity_type,
  name,
  phone,
  nationalId: national_id,
  licensePlate: license_plate,
  companyName: company_name,
  academicBridgeStudentId: academic_bridge_student_id, // Match the repository's camelCase expectation!
});

    return res.status(201).json({
      success: true,
      message: `Entity '${entity.name}' registered successfully.`,
      data: entity,
    });
  } catch (err) {
    // Handle duplicate national_id
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'An entity with this national_id or academic_bridge_student_id already exists.',
      });
    }
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Internal server error.',
    });
  }
};

/**
 * GET /api/entities
 * List all entities, optionally filter by ?type=Student
 */
const getEntities = async (req, res) => {
  try {
    const { type } = req.query;
    const entities = await entityRepo.findAll(type || null);
    return res.status(200).json({
      success: true,
      count: entities.length,
      data: entities,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error.',
    });
  }
};

/**
 * GET /api/entities/:id
 * Fetch a single entity by ID.
 */
const getEntityById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid entity ID.' });
    }

    const entity = await entityRepo.findById(id);
    if (!entity) {
      return res.status(404).json({ success: false, message: `Entity with ID ${id} not found.` });
    }

    return res.status(200).json({ success: true, data: entity });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error.',
    });
  }
};

module.exports = { createEntity, getEntities, getEntityById };
