import slugify from "slugify";

/**
 * Generates a URL-friendly slug from a text string.
 * @param {string} text - The input text to slugify.
 * @returns {string} The generated slug.
 */
export const generateSlug = (text) => {
  if (!text) return "";
  return slugify(text, {
    lower: true,      // convert to lower case
    strict: true,     // strip special characters except replacement
    trim: true,       // trim leading and trailing replacement chars
  });
};

export default generateSlug;
