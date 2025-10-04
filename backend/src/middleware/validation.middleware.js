const Joi = require("joi");

/**
 * Validation Middleware
 * Uses Joi schemas to validate request data (body, params, query)
 */

// ============================================
// Validation Schemas
// ============================================

/**
 * User registration validation schema
 */
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 100 characters",
  }),

  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),

  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
  }),

  ethAddress: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{40}$/)
    .required()
    .messages({
      "string.empty": "Ethereum address is required",
      "string.pattern.base": "Invalid Ethereum address format",
    }),

  role: Joi.string().valid("admin", "voter").default("voter").messages({
    "any.only": "Role must be either admin or voter",
  }),
});

/**
 * User login validation schema
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

/**
 * Add candidate validation schema
 */
const addCandidateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Candidate name is required",
    "string.min": "Candidate name must be at least 2 characters long",
    "string.max": "Candidate name cannot exceed 100 characters",
  }),

  party: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Party name is required",
    "string.min": "Party name must be at least 2 characters long",
    "string.max": "Party name cannot exceed 100 characters",
  }),
});

/**
 * Register voter validation schema
 */
const registerVoterSchema = Joi.object({
  voterAddress: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{40}$/)
    .required()
    .messages({
      "string.empty": "Voter address is required",
      "string.pattern.base": "Invalid Ethereum address format",
    }),
});

/**
 * Register voters batch validation schema
 */
const registerVotersBatchSchema = Joi.object({
  voterAddresses: Joi.array()
    .items(
      Joi.string()
        .pattern(/^0x[a-fA-F0-9]{40}$/)
        .messages({
          "string.pattern.base": "Invalid Ethereum address format in the list",
        })
    )
    .min(1)
    .max(100)
    .required()
    .messages({
      "array.base": "Voter addresses must be an array",
      "array.empty": "At least one voter address is required",
      "array.min": "At least one voter address is required",
      "array.max": "Cannot register more than 100 voters at once",
    }),
});

/**
 * Cast vote validation schema
 */
const castVoteSchema = Joi.object({
  candidateId: Joi.number().integer().min(1).required().messages({
    "number.base": "Candidate ID must be a number",
    "number.empty": "Candidate ID is required",
    "number.min": "Candidate ID must be at least 1",
  }),

  voterPrivateKey: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{64}$/)
    .required()
    .messages({
      "string.empty": "Voter private key is required",
      "string.pattern.base": "Invalid private key format",
    }),
});

/**
 * Ethereum address parameter validation schema
 */
const ethAddressParamSchema = Joi.object({
  address: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{40}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid Ethereum address format",
    }),
});

/**
 * Candidate ID parameter validation schema
 */
const candidateIdParamSchema = Joi.object({
  candidateId: Joi.number().integer().min(1).required().messages({
    "number.base": "Candidate ID must be a number",
    "number.min": "Candidate ID must be at least 1",
  }),
});

/**
 * Update profile validation schema
 */
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 100 characters",
  }),

  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)
    .allow(null, "")
    .messages({
      "string.pattern.base": "Invalid phone number format",
    }),

  profilePicture: Joi.string().uri().allow(null, "").messages({
    "string.uri": "Profile picture must be a valid URL",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// ============================================
// Generic Validation Middleware
// ============================================

/**
 * Generic validation middleware factory
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} property - Property to validate ('body', 'params', 'query')
 * @returns {Function} Express middleware function
 */
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown keys from the validated data
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: "Validation failed",
        message: "Invalid request data",
        errors,
      });
    }

    // Replace request data with validated and sanitized data
    req[property] = value;
    next();
  };
};

// ============================================
// Specific Validation Middleware Exports
// ============================================

/**
 * Validate user registration data
 */
const validateRegister = validate(registerSchema, "body");

/**
 * Validate user login data
 */
const validateLogin = validate(loginSchema, "body");

/**
 * Validate add candidate data
 */
const validateAddCandidate = validate(addCandidateSchema, "body");

/**
 * Validate register voter data
 */
const validateRegisterVoter = validate(registerVoterSchema, "body");

/**
 * Validate register voters batch data
 */
const validateRegisterVotersBatch = validate(registerVotersBatchSchema, "body");

/**
 * Validate cast vote data
 */
const validateCastVote = validate(castVoteSchema, "body");

/**
 * Validate Ethereum address parameter
 */
const validateEthAddressParam = validate(ethAddressParamSchema, "params");

/**
 * Validate candidate ID parameter
 */
const validateCandidateIdParam = validate(candidateIdParamSchema, "params");

/**
 * Validate update profile data
 */
const validateUpdateProfile = validate(updateProfileSchema, "body");

// ============================================
// Export Validation Functions
// ============================================

module.exports = {
  // Generic validator
  validate,

  // Schemas (for custom use)
  schemas: {
    registerSchema,
    loginSchema,
    addCandidateSchema,
    registerVoterSchema,
    registerVotersBatchSchema,
    castVoteSchema,
    ethAddressParamSchema,
    candidateIdParamSchema,
    updateProfileSchema,
  },

  // Pre-configured validators
  validateRegister,
  validateLogin,
  validateAddCandidate,
  validateRegisterVoter,
  validateRegisterVotersBatch,
  validateCastVote,
  validateEthAddressParam,
  validateCandidateIdParam,
  validateUpdateProfile,
};
