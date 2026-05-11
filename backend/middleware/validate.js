const Joi = require('joi');

function validateBody(schema) {
  return (req, res, next) => {
    const payload = req.body || {};
    const { error, value } = schema.validate(payload, { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map(d => ({ path: d.path.join('.'), message: d.message }));
      return res.status(400).json({ success: false, message: 'Validation failed', errors: details });
    }
    req.body = value; // sanitized
    return next();
  };
}

module.exports = { validateBody, Joi };
