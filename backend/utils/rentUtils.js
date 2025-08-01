const getRentPeriodText = (period) => {
  switch(period) {
    case 1: return 'monthly';
    case 3: return 'for 3 months';
    case 6: return 'for 6 months ';
    case 12: return 'yearly';
    default: return 'monthly';
  }
};

module.exports = {
  getRentPeriodText
}; 