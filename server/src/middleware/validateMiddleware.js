export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    const error = new Error(result.error.issues.map((issue) => issue.message).join(", "));
    error.statusCode = 400;
    return next(error);
  }

  req.body = result.data.body;
  req.params = result.data.params;
  Object.defineProperty(req, "query", {
    value: result.data.query,
    configurable: true,
    enumerable: true,
    writable: true,
  });
  next();
};
