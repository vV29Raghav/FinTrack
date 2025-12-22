// Smart expense categorization helper
// This function suggests categories based on expense name/description

const categoryKeywords = {
  'Travel': ['flight', 'hotel', 'airbnb', 'taxi', 'uber', 'lyft', 'train', 'bus', 'parking', 'rental car', 'gas', 'fuel', 'toll'],
  'Meals & Entertainment': ['restaurant', 'food', 'lunch', 'dinner', 'breakfast', 'coffee', 'starbucks', 'cafe', 'bar', 'pizza', 'sushi', 'meal', 'drinks'],
  'Office Supplies': ['staples', 'paper', 'pens', 'pencils', 'notebook', 'printer', 'ink', 'toner', 'desk', 'chair', 'office'],
  'Software & Subscriptions': ['software', 'subscription', 'saas', 'license', 'adobe', 'microsoft', 'google', 'aws', 'cloud', 'hosting', 'domain'],
  'Utilities': ['electricity', 'water', 'gas', 'internet', 'phone', 'mobile', 'broadband', 'utility', 'bill'],
  'Marketing': ['ads', 'advertising', 'marketing', 'promotion', 'facebook ads', 'google ads', 'seo', 'social media'],
  'Equipment': ['computer', 'laptop', 'monitor', 'keyboard', 'mouse', 'headphones', 'camera', 'equipment', 'hardware'],
};

function suggestCategory(name, description = '') {
  const text = `${name} ${description}`.toLowerCase();
  
  let bestMatch = { category: 'Other', score: 0 };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    
    if (score > bestMatch.score) {
      bestMatch = { category, score };
    }
  }
  
  return bestMatch.category;
}

module.exports = { suggestCategory, categoryKeywords };
