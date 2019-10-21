const CUISINES_MAP = [
  {
    slugs: ['afghan'],
    name: 'Afghan',
  },
  {
    slugs: ['african'],
    name: 'African',
  },
  {
    slugs: ['albanian'],
    name: 'Albanian',
  },
  {
    slugs: ['algerian'],
    name: 'Algerian',
  },
  {
    slugs: ['alsatian'],
    name: 'Alsatian',
  },
  {
    slugs: ['american'],
    name: 'American',
  },
  {
    slugs: ['arabic'],
    name: 'Arabic',
  },
  {
    slugs: ['armenian'],
    name: 'Armenian',
  },
  {
    slugs: ['argentine'],
    name: 'Argentine',
  },
  {
    slugs: ['asian'],
    name: 'Asian',
  },
  {
    slugs: ['australian'],
    name: 'Australian',
  },
  {
    slugs: ['austrian'],
    name: 'Austrian',
  },
  {
    slugs: ['auvergne'],
    name: 'Auvergne',
  },
  {
    slugs: ['bagels'],
    name: 'Bagels',
  },
  {
    slugs: ['bakery'],
    name: 'Bakery',
  },
  {
    slugs: ['bangladeshi'],
    name: 'Bangladeshi',
  },
  {
    slugs: ['barbecue'],
    name: 'Barbecue',
  },
  {
    slugs: ['belgian'],
    name: 'Belgian',
  },
  {
    slugs: ['bistro'],
    name: 'Bistro',
  },
  {
    slugs: ['brazilian'],
    name: 'Brazilian',
  },
  {
    slugs: ['british'],
    name: 'British',
  },
  {
    slugs: ['burgers'],
    name: 'Burgers',
  },
  {
    slugs: ['burgundy'],
    name: 'Burgundy',
  },
  {
    slugs: ['burmese'],
    name: 'Burmese',
  },
  {
    slugs: ['cafe'],
    name: 'Cafe',
  },
  {
    slugs: ['cajun'],
    name: 'Cajun',
  },
  {
    slugs: ['californian'],
    name: 'Californian',
  },
  {
    slugs: ['calzones'],
    name: 'Calzones',
  },
  {
    slugs: ['cambodian'],
    name: 'Cambodian',
  },
  {
    slugs: ['caribbean'],
    name: 'Caribbean',
  },
  {
    slugs: ['cheesesteaks'],
    name: 'Cheesesteaks',
  },
  {
    slugs: ['chicken'],
    name: 'Chicken',
  },
  {
    slugs: ['chilean'],
    name: 'Chilean',
  },
  {
    slugs: ['chinese'],
    name: 'Chinese',
  },
  {
    slugs: ['chowder'],
    name: 'Chowder',
  },
  {
    slugs: ['coffee'],
    name: 'Coffee',
  },
  {
    slugs: ['colombian'],
    name: 'Colombian',
  },
  {
    slugs: ['contemporary'],
    name: 'Contemporary',
  },
  {
    slugs: ['continental'],
    name: 'Continental',
  },
  {
    slugs: ['corsica'],
    name: 'Corsica',
  },
  {
    slugs: ['creole'],
    name: 'Creole',
  },
  {
    slugs: ['crepes'],
    name: 'Crepes',
  },
  {
    slugs: ['cuban'],
    name: 'Cuban',
  },
  {
    slugs: ['cuban'],
    name: 'Cuban',
  },
  {
    slugs: ['czech'],
    name: 'Czech',
  },
  {
    slugs: ['deli'],
    name: 'Deli',
  },
  {
    slugs: ['dim-sum'],
    name: 'Dim Sum',
  },
  {
    slugs: ['diner'],
    name: 'Diner',
  },
  {
    slugs: ['dominican'],
    name: 'Dominican',
  },
  {
    slugs: ['donuts'],
    name: 'Donuts',
  },
  {
    slugs: ['dutch'],
    name: 'Dutch',
  },
  {
    slugs: ['eastern-european'],
    name: 'Eastern European',
  },
  {
    slugs: ['eclectic'],
    name: 'Eclectic',
  },
  {
    slugs: ['egyptian'],
    name: 'Egyptian',
  },
  {
    slugs: ['english'],
    name: 'English',
  },
  {
    slugs: ['ethiopian'],
    name: 'Ethiopian',
  },
  {
    slugs: ['ecuadorean'],
    name: 'Ecuadorean',
  },
  {
    slugs: ['european'],
    name: 'European',
  },
  {
    slugs: ['fastfood'],
    name: 'FastFood',
  },
  {
    slugs: ['filipino'],
    name: 'Filipino',
  },
  {
    slugs: ['fish-and-chips'],
    name: 'Fish and Chips',
  },
  {
    slugs: ['fondue'],
    name: 'Fondue',
  },
  {
    slugs: ['french'],
    name: 'French',
  },
  {
    slugs: ['frozen-yogurt'],
    name: 'Frozen Yogurt',
  },
  {
    slugs: ['fusion'],
    name: 'Fusion',
  },
  {
    slugs: ['gastropub'],
    name: 'Gastropub',
  },
  {
    slugs: ['german'],
    name: 'German',
  },
  {
    slugs: ['greek'],
    name: 'Greek',
  },
  {
    slugs: ['grill', 'grills'],
    name: 'Grill',
  },
  {
    slugs: ['gyros', 'gyro'],
    name: 'Gyros',
  },
  {
    slugs: ['haitian'],
    name: 'Haitian',
  },
  {
    slugs: ['halal'],
    name: 'Halal',
  },
  {
    slugs: ['hawaiian'],
    name: 'Hawaiian',
  },
  {
    slugs: ['healthy'],
    name: 'Healthy',
  },
  {
    slugs: ['ice-cream'],
    name: 'Ice Cream',
  },
  {
    slugs: ['indian'],
    name: 'Indian',
  },
  {
    slugs: ['indonesian'],
    name: 'Indonesian',
  },
  {
    slugs: ['international'],
    name: 'International',
  },
  {
    slugs: ['irish'],
    name: 'Irish',
  },
  {
    slugs: ['israeli'],
    name: 'Israeli',
  },
  {
    slugs: ['italian'],
    name: 'Italian',
  },
  {
    slugs: ['jamaican'],
    name: 'Jamaican',
  },
  {
    slugs: ['japanese'],
    name: 'Japanese',
  },
  {
    slugs: ['juices'],
    name: 'Juices',
  },
  {
    slugs: ['korean'],
    name: 'Korean',
  },
  {
    slugs: ['korean-barbeque'],
    name: 'Korean Barbeque',
  },
  {
    slugs: ['kosher'],
    name: 'Kosher',
  },
  {
    slugs: ['latin'],
    name: 'Latin',
  },
  {
    slugs: ['latin-american'],
    name: 'Latin American',
  },
  {
    slugs: ['lebanese'],
    name: 'Lebanese',
  },
  {
    slugs: ['lyonnais'],
    name: 'Lyonnais',
  },
  {
    slugs: ['malaysian'],
    name: 'Malaysian',
  },
  {
    slugs: ['mediterranean'],
    name: 'Mediterranean',
  },
  {
    slugs: ['mexican'],
    name: 'Mexican',
  },
  {
    slugs: ['middle-eastern'],
    name: 'Middle Eastern',
  },
  {
    slugs: ['mongolian'],
    name: 'Mongolian',
  },
  {
    slugs: ['moroccan'],
    name: 'Moroccan',
  },
  {
    slugs: ['nepalese'],
    name: 'Nepalese',
  },
  {
    slugs: ['noodle-bar'],
    name: 'Noodle Bar',
  },
  {
    slugs: ['norwegian'],
    name: 'Norwegian',
  },
  {
    slugs: ['organic'],
    name: 'Organic',
  },
  {
    slugs: ['oysters'],
    name: 'Oysters',
  },
  {
    slugs: ['pacific-rim'],
    name: 'Pacific Rim',
  },
  {
    slugs: ['pakistani'],
    name: 'Pakistani',
  },
  {
    slugs: ['panasian'],
    name: 'PanAsian',
  },
  {
    slugs: ['pasta'],
    name: 'Pasta',
  },
  {
    slugs: ['pastries'],
    name: 'Pastries',
  },
  {
    slugs: ['persian'],
    name: 'Persian',
  },
  {
    slugs: ['peruvian'],
    name: 'Peruvian',
  },
  {
    slugs: ['pho'],
    name: 'Pho',
  },
  {
    slugs: ['pizza'],
    name: 'Pizza',
  },
  {
    slugs: ['polish'],
    name: 'Polish',
  },
  {
    slugs: ['polynesian'],
    name: 'Polynesian',
  },
  {
    slugs: ['portuguese'],
    name: 'Portuguese',
  },
  {
    slugs: ['provencal'],
    name: 'Provençal',
  },
  {
    slugs: ['pub-food'],
    name: 'Pub Food',
  },
  {
    slugs: ['puerto-rican'],
    name: 'Puerto Rican',
  },
  {
    slugs: ['raw'],
    name: 'Raw',
  },
  {
    slugs: ['ribs'],
    name: 'Ribs',
  },
  {
    slugs: ['russian'],
    name: 'Russian',
  },
  {
    slugs: ['salad', 'salads'],
    name: 'Salad',
  },
  {
    slugs: ['salvadoran'],
    name: 'Salvadoran',
  },
  {
    slugs: ['sandwiches'],
    name: 'Sandwiches',
  },
  {
    slugs: ['savoy'],
    name: 'Savoy',
  },
  {
    slugs: ['scandinavian'],
    name: 'Scandinavian',
  },
  {
    slugs: ['seafood'],
    name: 'Seafood',
  },
  {
    slugs: ['senegalese'],
    name: 'Senegalese',
  },
  {
    slugs: ['singaporean'],
    name: 'Singaporean',
  },
  {
    slugs: ['soulfood'],
    name: 'SoulFood',
  },
  {
    slugs: ['soup'],
    name: 'Soup',
  },
  {
    slugs: ['south-american'],
    name: 'South American',
  },
  {
    slugs: ['south-african'],
    name: 'South African',
  },
  {
    slugs: ['south-pacific'],
    name: 'South Pacific',
  },
  {
    slugs: ['southern'],
    name: 'Southern',
  },
  {
    slugs: ['southwestern'],
    name: 'Southwestern',
  },
  {
    slugs: ['spanish'],
    name: 'Spanish',
  },
  {
    slugs: ['steak'],
    name: 'Steak',
  },
  {
    slugs: ['steakhouse'],
    name: 'Steakhouse',
  },
  {
    slugs: ['subs'],
    name: 'Subs',
  },
  {
    slugs: ['sushi'],
    name: 'Sushi',
  },
  {
    slugs: ['taiwanese'],
    name: 'Taiwanese',
  },
  {
    slugs: ['tapas'],
    name: 'Tapas',
  },
  {
    slugs: ['tea'],
    name: 'Tea',
  },
  {
    slugs: ['tex-mex'],
    name: 'Tex Mex',
  },
  {
    slugs: ['thai'],
    name: 'Thai',
  },
  {
    slugs: ['tibetan'],
    name: 'Tibetan',
  },
  {
    slugs: ['traditional'],
    name: 'Traditional',
  },
  {
    slugs: ['tunisian'],
    name: 'Tunisian',
  },
  {
    slugs: ['turkish'],
    name: 'Turkish',
  },
  {
    slugs: ['ukrainian'],
    name: 'Ukrainian',
  },
  {
    slugs: ['vegan'],
    name: 'Vegan',
  },
  {
    slugs: ['vegetarian'],
    name: 'Vegetarian',
  },
  {
    slugs: ['venezuelan'],
    name: 'Venezuelan',
  },
  {
    slugs: ['vietnamese'],
    name: 'Vietnamese',
  },
  {
    slugs: ['wings'],
    name: 'Wings',
  },
  {
    slugs: ['wraps'],
    name: 'Wraps',
  },
  {
    slugs: ['confectionery'],
    name: 'Confectionery',
  },
  {
    slugs: ['goan'],
    name: 'Goan',
  },
  {
    slugs: ['continental'],
    name: 'Continental',
  },
  {
    slugs: ['arabian'],
    name: 'Arabian',
  },
  {
    slugs: ['oriental'],
    name: 'Oriental',
  },
  {
    slugs: ['sandwiches'],
    name: 'Sandwiches',
  },
  {
    slugs: ['chettinad'],
    name: 'Chettinad',
  },
  {
    slugs: ['belgian'],
    name: 'Belgian',
  },
  {
    slugs: ['dessert'],
    name: 'Dessert',
  },
  {
    slugs: ['middle-eastern'],
    name: 'Middle Eastern',
  },
  {
    slugs: ['french'],
    name: 'French',
  },
  {
    slugs: ['street-food'],
    name: 'Street Food',
  },
  {
    slugs: ['south-indian'],
    name: 'South Indian',
  },
  {
    slugs: ['western'],
    name: 'Western',
  },
  {
    slugs: ['rose-bowl'],
    name: 'Rose Bowl',
  },
  {
    slugs: ['birthday-cake'],
    name: 'Birthday Cake',
  },
  {
    slugs: ['grocery'],
    name: 'Grocery',
  },
  {
    slugs: ['filipino'],
    name: 'Filipino',
  },
  {
    slugs: ['iranian'],
    name: 'Iranian',
  },
  {
    slugs: ['dairy-free'],
    name: 'Dairy-free',
  },
  {
    slugs: ['bakery'],
    name: 'Bakery',
  },
  {
    slugs: ['bao'],
    name: 'Bao',
  },
  {
    slugs: ['steak'],
    name: 'Steak',
  },
  {
    slugs: ['ice-cream'],
    name: 'Ice Cream',
  },
  {
    slugs: ['italian'],
    name: 'Italian',
  },
  {
    slugs: ['shawarma-and-doner'],
    name: 'Shawarma & Doner',
  },
  {
    slugs: ['mediterranean'],
    name: 'Mediterranean',
  },
  {
    slugs: ['moroccan'],
    name: 'Moroccan',
  },
  {
    slugs: ['desserts'],
    name: 'Desserts',
  },
  {
    slugs: ['fish-and-chips'],
    name: 'Fish and chips',
  },
  {
    slugs: ['nepalese'],
    name: 'Nepalese',
  },
  {
    slugs: ['falafel'],
    name: 'Falafel',
  },
  {
    slugs: ['sushi'],
    name: 'Sushi',
  },
  {
    slugs: ['breakfast'],
    name: 'Breakfast',
  },
  {
    slugs: ['noodles'],
    name: 'Noodles',
  },
  {
    slugs: ['parsi'],
    name: 'Parsi',
  },
  {
    slugs: ['south-american'],
    name: 'South American',
  },
  {
    slugs: ['kuwaiti'],
    name: 'Kuwaiti',
  },
  {
    slugs: ['the-salad-jar'],
    name: 'The Salad Jar',
  },
  {
    slugs: ['street-food'],
    name: 'Street food',
  },
  {
    slugs: ['wok'],
    name: 'Wok',
  },
  {
    slugs: ['couscous'],
    name: 'Couscous',
  },
  {
    slugs: ['international'],
    name: 'International',
  },
  {
    slugs: ['rice'],
    name: 'Rice',
  },
  {
    slugs: ['mandi'],
    name: 'Mandi',
  },
  {
    slugs: ['coffee'],
    name: 'Coffee',
  },
  {
    slugs: ['sweet-treats'],
    name: 'Sweet treats',
  },
  {
    slugs: ['hawaiian'],
    name: 'Hawaiian',
  },
  {
    slugs: ['south-indian'],
    name: 'South indian',
  },
  {
    slugs: ['beverages'],
    name: 'Beverages',
  },
  {
    slugs: ['milkshakes'],
    name: 'Milkshakes',
  },
  {
    slugs: ['thai'],
    name: 'Thai',
  },
  {
    slugs: ['european'],
    name: 'European',
  },
  {
    slugs: ['uzbek'],
    name: 'Uzbek',
  },
  {
    slugs: ['finger-food'],
    name: 'Finger Food',
  },
  {
    slugs: ['sri-lankan'],
    name: 'Sri Lankan',
  },
  {
    slugs: ['roti'],
    name: 'Roti',
  },
  {
    slugs: ['greek'],
    name: 'Greek',
  },
  {
    slugs: ['jamaican'],
    name: 'Jamaican',
  },
  {
    slugs: ['african'],
    name: 'African',
  },
  {
    slugs: ['hyderabadi'],
    name: 'Hyderabadi',
  },
  {
    slugs: ['curry'],
    name: 'Curry',
  },
  {
    slugs: ['singaporean'],
    name: 'Singaporean',
  },
  {
    slugs: ['chinese'],
    name: 'Chinese',
  },
  {
    slugs: ['burgers'],
    name: 'Burgers',
  },
  {
    slugs: ['fish'],
    name: 'Fish',
  },
  {
    slugs: ['ethiopian'],
    name: 'Ethiopian',
  },
  {
    slugs: ['tex-mex'],
    name: 'Tex-Mex',
  },
  {
    slugs: ['burger'],
    name: 'Burger',
  },
  {
    slugs: ['yemeni'],
    name: 'Yemeni',
  },
  {
    slugs: ['juices'],
    name: 'Juices',
  },
  {
    slugs: ['arabic'],
    name: 'Arabic',
  },
  {
    slugs: ['cafe'],
    name: 'Cafe',
  },
  {
    slugs: ['syrian'],
    name: 'Syrian',
  },
  {
    slugs: ['drinks'],
    name: 'Drinks',
  },
  {
    slugs: ['wraps'],
    name: 'Wraps',
  },
  {
    slugs: ['poke'],
    name: 'Poke',
  },
  {
    slugs: ['turkish'],
    name: 'Turkish',
  },
  {
    slugs: ['dim-sum'],
    name: 'Dim sum',
  },
  {
    slugs: ['mezze'],
    name: 'Mezze',
  },
  {
    slugs: ['middle-eastern'],
    name: 'Middle Eastern',
  },
  {
    slugs: ['bangladeshi'],
    name: 'Bangladeshi',
  },
  {
    slugs: ['gujarati'],
    name: 'Gujarati',
  },
  {
    slugs: ['indian'],
    name: 'Indian',
  },
  {
    slugs: ['emirati'],
    name: 'Emirati',
  },
  {
    slugs: ['latin-american'],
    name: 'Latin American',
  },
  {
    slugs: ['brazilian'],
    name: 'Brazilian',
  },
  {
    slugs: ['specialty-store'],
    name: 'Specialty Store',
  },
  {
    slugs: ['korean'],
    name: 'Korean',
  },
  {
    slugs: ['pakistani'],
    name: 'Pakistani',
  },
  {
    slugs: ['pancakes'],
    name: 'Pancakes',
  },
  {
    slugs: ['tacos'],
    name: 'Tacos',
  },
  {
    slugs: ['go-healthy'],
    name: 'Go! Healthy',
  },
  {
    slugs: ['russian'],
    name: 'Russian',
  },
  {
    slugs: ['ramen'],
    name: 'Ramen',
  },
  {
    slugs: ['wings'],
    name: 'Wings',
  },
  {
    slugs: ['bengali'],
    name: 'Bengali',
  },
  {
    slugs: ['roastery'],
    name: 'Roastery',
  },
  {
    slugs: ['vegetarian'],
    name: 'Vegetarian',
  },
  {
    slugs: ['malaysian'],
    name: 'Malaysian',
  },
  {
    slugs: ['frozen-yogurt'],
    name: 'Frozen Yogurt',
  },
  {
    slugs: ['american'],
    name: 'American',
  },
  {
    slugs: ['rajasthani'],
    name: 'Rajasthani',
  },
  {
    slugs: ['bbq'],
    name: 'BBQ',
  },
  {
    slugs: ['afghan'],
    name: 'Afghan',
  },
  {
    slugs: ['kebab'],
    name: 'Kebab',
  },
  {
    slugs: ['fried-chicken'],
    name: 'Fried chicken',
  },
  {
    slugs: ['dumplings'],
    name: 'Dumplings',
  },
  {
    slugs: ['tea'],
    name: 'Tea',
  },
  {
    slugs: ['bowls'],
    name: 'Bowls',
  },
  {
    slugs: ['burritos'],
    name: 'Burritos',
  },
  {
    slugs: ['persian'],
    name: 'Persian',
  },
  {
    slugs: ['north-indian'],
    name: 'North Indian',
  },
  {
    slugs: ['ice-cream'],
    name: 'Ice cream',
  },
  {
    slugs: ['indian-malabar'],
    name: 'Indian Malabar',
  },
  {
    slugs: ['german'],
    name: 'German',
  },
  {
    slugs: ['plant-based'],
    name: 'Plant-Based',
  },
  {
    slugs: ['vietnamese'],
    name: 'Vietnamese',
  },
  {
    slugs: ['smoothie', 'smoothies'],
    name: 'Smoothie',
  },
  {
    slugs: ['healthy-food'],
    name: 'Healthy Food',
  },
  {
    slugs: ['bagels'],
    name: 'Bagels',
  },
  {
    slugs: ['fast-food'],
    name: 'Fast Food',
  },
  {
    slugs: ['waffles'],
    name: 'Waffles',
  },
  {
    slugs: ['kerala'],
    name: 'Kerala',
  },
  {
    slugs: ['biryani'],
    name: 'Biryani',
  },
  {
    slugs: ['new'],
    name: 'New',
  },
  {
    slugs: ['australian'],
    name: 'Australian',
  },
  {
    slugs: ['pizza', 'pizzas'],
    name: 'Pizza',
  },
  {
    slugs: ['salad'],
    name: 'Salad',
  },
  {
    slugs: ['egyptian'],
    name: 'Egyptian',
  },
  {
    slugs: ['canadian'],
    name: 'Canadian',
  },
  {
    slugs: ['brunch'],
    name: 'Brunch',
  },
  {
    slugs: ['lebanese'],
    name: 'Lebanese',
  },
  {
    slugs: ['hot-dog', 'hotdogs', 'hotdog'],
    name: 'Hot dog',
  },
  {
    slugs: ['seafood'],
    name: 'Seafood',
  },
  {
    slugs: ['indonesian'],
    name: 'Indonesian',
  },
  {
    slugs: ['british'],
    name: 'British',
  },
  {
    slugs: ['soup'],
    name: 'Soup',
  },
  {
    slugs: ['shawarma'],
    name: 'Shawarma',
  },
  {
    slugs: ['portuguese'],
    name: 'Portuguese',
  },
  {
    slugs: ['mexican'],
    name: 'Mexican',
  },
  {
    slugs: ['snacks'],
    name: 'Snacks',
  },
  {
    slugs: ['peruvian'],
    name: 'Peruvian',
  },
  {
    slugs: ['mughlai'],
    name: 'Mughlai',
  },
  {
    slugs: ['japanese'],
    name: 'Japanese',
  },
  {
    slugs: ['acai'],
    name: 'Acai',
  },
  {
    slugs: ['asian'],
    name: 'Asian',
  },
  {
    slugs: ['spanish'],
    name: 'Spanish',
  },
  {
    slugs: ['chicken'],
    name: 'Chicken',
  },
  {
    slugs: ['cafeteria'],
    name: 'Cafeteria',
  },
];

module.exports = {
  CUISINES_MAP,
};
