module.exports = (title, source) => {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  
  return `${source}-${cleanTitle}`;
};
