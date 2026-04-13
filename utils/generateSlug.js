let slugCounter = {};

module.exports = (title, source) => {
  // Reset counter daily
  const today = new Date().toDateString();
  if (slugCounter.date !== today) {
    slugCounter = { date: today, count: {} };
  }
  
  const cleanTitle = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 80); // Limit length
  
  const baseSlug = `${source}-${cleanTitle}`;
  
  // Ensure unique slug
  if (!slugCounter.count[baseSlug]) {
    slugCounter.count[baseSlug] = 0;
  }
  slugCounter.count[baseSlug]++;
  
  const count = slugCounter.count[baseSlug];
  return count > 1 ? `${baseSlug}-${count}` : baseSlug;
};
