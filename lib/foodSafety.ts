export type Verdict = 'safe' | 'caution' | 'avoid';

export type FoodItem = {
  name: string;
  verdict: Verdict;
  category: string;
  reason: string;
  keywords: string[];
};

export const FOODS: FoodItem[] = [
  // ───────────────────────── FRUITS ─────────────────────────
  { name: 'Pineapple', verdict: 'safe', category: 'Fruits', reason: 'Safe in normal amounts. The myth that bromelain triggers labor isn\u2019t supported by evidence \u2014 the amount in the flesh is tiny, and most bromelain sits in the core, which you don\u2019t eat. A good source of vitamin C.', keywords: ['pineapple', 'ananas', 'bromelain'] },
  { name: 'Ripe papaya', verdict: 'safe', category: 'Fruits', reason: 'Ripe (yellow-skinned) papaya is safe and nutritious \u2014 rich in vitamins A and C, folate and fiber. It can even help with digestion and morning sickness.', keywords: ['papaya', 'pawpaw', 'ripe papaya'] },
  { name: 'Unripe papaya', verdict: 'avoid', category: 'Fruits', reason: 'Green or semi-ripe papaya contains latex (papain) that can act like labor hormones and may trigger uterine contractions. Avoid unripe; ripe yellow papaya is fine.', keywords: ['unripe papaya', 'green papaya', 'papain'] },
  { name: 'Grapes', verdict: 'safe', category: 'Fruits', reason: 'Safe to eat \u2014 the \u201cavoid grapes\u201d idea is a myth. Just wash them thoroughly first and eat in normal amounts.', keywords: ['grapes', 'grape'] },
  { name: 'Banana', verdict: 'safe', category: 'Fruits', reason: 'Safe and a great source of potassium and quick energy. Often helps settle nausea in early pregnancy.', keywords: ['banana', 'bananas'] },
  { name: 'Apple', verdict: 'safe', category: 'Fruits', reason: 'Safe and nutritious \u2014 fiber and vitamin C. Wash the skin well before eating.', keywords: ['apple', 'apples'] },
  { name: 'Mango', verdict: 'safe', category: 'Fruits', reason: 'Safe and rich in vitamins A and C. Wash the skin before cutting.', keywords: ['mango', 'mangoes'] },
  { name: 'Strawberries', verdict: 'safe', category: 'Fruits', reason: 'Safe \u2014 wash thoroughly to remove any soil or residue. The same goes for other berries.', keywords: ['strawberries', 'strawberry', 'berries', 'blueberries', 'raspberries'] },
  { name: 'Watermelon', verdict: 'safe', category: 'Fruits', reason: 'Safe and hydrating. Eat it freshly cut rather than pre-cut fruit that\u2019s been sitting out.', keywords: ['watermelon', 'melon'] },
  { name: 'Oranges', verdict: 'safe', category: 'Fruits', reason: 'Safe and high in vitamin C and folate. Citrus fruits are a great pregnancy snack.', keywords: ['oranges', 'orange', 'citrus', 'clementine'] },
  { name: 'Avocado', verdict: 'safe', category: 'Fruits', reason: 'Safe and excellent \u2014 packed with healthy fats, folate and potassium.', keywords: ['avocado', 'avocados', 'guacamole'] },
  { name: 'Dates', verdict: 'safe', category: 'Fruits', reason: 'Safe and a nutritious, iron-rich snack. Some studies suggest dates in late pregnancy may support cervical readiness, but evidence is limited \u2014 enjoy them either way.', keywords: ['dates', 'date'] },
  { name: 'Pre-cut fruit', verdict: 'caution', category: 'Fruits', reason: 'Pre-cut or pre-packaged fruit that\u2019s been stored can harbour listeria. Safer to cut it fresh yourself and eat soon after.', keywords: ['pre-cut fruit', 'cut fruit', 'fruit salad'] },

  // ───────────────────────── VEGETABLES ─────────────────────────
  { name: 'Spinach', verdict: 'safe', category: 'Vegetables', reason: 'Safe and rich in folate and iron. Wash thoroughly to remove any soil before eating raw.', keywords: ['spinach', 'leafy greens', 'greens'] },
  { name: 'Broccoli', verdict: 'safe', category: 'Vegetables', reason: 'Safe and packed with folate, fiber and vitamin C. Great cooked or raw (washed).', keywords: ['broccoli'] },
  { name: 'Carrots', verdict: 'safe', category: 'Vegetables', reason: 'Safe and rich in beta-carotene. Wash or peel before eating.', keywords: ['carrots', 'carrot'] },
  { name: 'Tomatoes', verdict: 'safe', category: 'Vegetables', reason: 'Safe \u2014 a good source of vitamin C and lycopene. Wash well before eating raw.', keywords: ['tomatoes', 'tomato'] },
  { name: 'Potatoes', verdict: 'safe', category: 'Vegetables', reason: 'Safe when cooked. Avoid green or sprouting potatoes, which contain higher levels of solanine.', keywords: ['potatoes', 'potato'] },
  { name: 'Raw sprouts', verdict: 'avoid', category: 'Vegetables', reason: 'Raw sprouts (alfalfa, mung bean, etc.) can harbour salmonella and E. coli deep inside in a way washing can\u2019t fix. Eat them only if thoroughly cooked.', keywords: ['sprouts', 'alfalfa', 'bean sprouts', 'raw sprouts'] },
  { name: 'Pre-packaged salad', verdict: 'caution', category: 'Vegetables', reason: 'Bagged or pre-made salads carry a higher listeria risk the longer they sit. Safer to wash and prepare salad fresh at home.', keywords: ['salad', 'bagged salad', 'pre-packaged salad', 'store salad'] },
  { name: 'Unwashed vegetables', verdict: 'caution', category: 'Vegetables', reason: 'Always wash raw produce well. Unwashed veg can carry toxoplasma, listeria or soil bacteria.', keywords: ['unwashed vegetables', 'unwashed veg', 'raw vegetables'] },

  // ───────────────────────── CHEESE & DAIRY ─────────────────────────
  { name: 'Mozzarella', verdict: 'safe', category: 'Cheese & dairy', reason: 'Safe if made from pasteurized milk (most is) \u2014 fine cooked or fresh. Just check the label says pasteurized.', keywords: ['mozzarella', 'cheese'] },
  { name: 'Cheddar', verdict: 'safe', category: 'Cheese & dairy', reason: 'A hard cheese \u2014 safe to eat, even if unpasteurized, because hard cheeses are low-risk for listeria.', keywords: ['cheddar', 'hard cheese', 'cheese'] },
  { name: 'Parmesan', verdict: 'safe', category: 'Cheese & dairy', reason: 'A hard cheese \u2014 safe. Grate it over pasta freely.', keywords: ['parmesan', 'parmigiano', 'hard cheese', 'cheese'] },
  { name: 'Feta', verdict: 'safe', category: 'Cheese & dairy', reason: 'Safe if made from pasteurized milk. Its salt and acidic brine also help keep bacteria down. Check the label.', keywords: ['feta', 'cheese'] },
  { name: 'Halloumi', verdict: 'safe', category: 'Cheese & dairy', reason: 'Safe, especially grilled or fried until hot. Choose a pasteurized version.', keywords: ['halloumi', 'cheese'] },
  { name: 'Paneer', verdict: 'safe', category: 'Cheese & dairy', reason: 'Safe when made from pasteurized milk and cooked, as it usually is in curries and dishes.', keywords: ['paneer', 'cheese'] },
  { name: 'Cream cheese', verdict: 'safe', category: 'Cheese & dairy', reason: 'Safe \u2014 it\u2019s made from pasteurized milk (e.g. Philadelphia, all varieties). Fine on bagels or in baking.', keywords: ['cream cheese', 'philadelphia', 'cheese'] },
  { name: 'Cottage cheese', verdict: 'safe', category: 'Cheese & dairy', reason: 'Safe and a good protein source. Made from pasteurized milk.', keywords: ['cottage cheese', 'cheese'] },
  { name: 'Ricotta', verdict: 'safe', category: 'Cheese & dairy', reason: 'Safe when pasteurized. Keep it refrigerated and eat fresh.', keywords: ['ricotta', 'cheese'] },
  { name: 'Brie & Camembert', verdict: 'caution', category: 'Cheese & dairy', reason: 'Soft mold-ripened cheeses \u2014 avoid unless cooked until steaming hot, which kills listeria. The white rind is the concern, even when pasteurized.', keywords: ['brie', 'camembert', 'soft cheese', 'cheese'] },
  { name: 'Blue cheese', verdict: 'caution', category: 'Cheese & dairy', reason: 'Soft blue cheeses (gorgonzola, roquefort, danish blue) \u2014 avoid unless cooked until steaming hot.', keywords: ['blue cheese', 'gorgonzola', 'roquefort', 'stilton', 'cheese'] },
  { name: 'Soft goat cheese', verdict: 'caution', category: 'Cheese & dairy', reason: 'Soft goat\u2019s cheese with a white rind \u2014 avoid unless cooked. Hard goat\u2019s cheese is fine.', keywords: ['goat cheese', 'chevre', 'goats cheese', 'cheese'] },
  { name: 'Unpasteurized milk', verdict: 'avoid', category: 'Cheese & dairy', reason: 'Raw/unpasteurized milk \u2014 and any cheese made from it \u2014 can carry listeria and other bacteria. Stick to pasteurized.', keywords: ['unpasteurized milk', 'raw milk', 'milk'] },
  { name: 'Yogurt', verdict: 'safe', category: 'Cheese & dairy', reason: 'Safe \u2014 all varieties made from pasteurized milk, including live and probiotic. A great source of calcium.', keywords: ['yogurt', 'yogurt', 'probiotic'] },
  { name: 'Soft serve ice cream', verdict: 'caution', category: 'Cheese & dairy', reason: 'Machine soft-serve can carry listeria if the machine isn\u2019t cleaned well. Packaged, shop-bought ice cream is safer.', keywords: ['soft serve', 'ice cream', 'soft-serve'] },

  // ───────────────────────── SEAFOOD ─────────────────────────
  { name: 'Salmon', verdict: 'safe', category: 'Seafood', reason: 'Safe and recommended \u2014 low in mercury and high in omega-3. Cook it thoroughly; avoid raw or cold-smoked unless it\u2019s in a hot cooked dish.', keywords: ['salmon', 'fish'] },
  { name: 'Cooked shrimp', verdict: 'safe', category: 'Seafood', reason: 'Safe when fully cooked \u2014 low in mercury and a good source of protein. The same goes for other thoroughly cooked shellfish.', keywords: ['shrimp', 'prawns', 'prawn', 'shellfish'] },
  { name: 'Canned tuna', verdict: 'caution', category: 'Seafood', reason: 'Limit to a couple of servings a week because of mercury. Light canned tuna is lower in mercury than albacore/\u201cwhite\u201d tuna.', keywords: ['canned tuna', 'tuna', 'tinned tuna'] },
  { name: 'Sushi', verdict: 'caution', category: 'Seafood', reason: 'Raw-fish sushi: avoid. Cooked rolls (cooked fish, veg, or surimi crab stick) are fine \u2014 the rice and seaweed aren\u2019t the issue, raw fish is.', keywords: ['sushi', 'sashimi', 'raw fish', 'maki'] },
  { name: 'High-mercury fish', verdict: 'avoid', category: 'Seafood', reason: 'Avoid shark, swordfish, king mackerel, marlin, bigeye tuna and orange roughy \u2014 their mercury can harm baby\u2019s developing nervous system.', keywords: ['shark', 'swordfish', 'marlin', 'king mackerel', 'mercury', 'orange roughy'] },
  { name: 'Raw oysters', verdict: 'avoid', category: 'Seafood', reason: 'Raw shellfish (oysters, clams, mussels, scallops) can carry harmful bacteria and viruses. Eat them only when fully cooked.', keywords: ['oysters', 'raw oysters', 'clams', 'mussels', 'raw shellfish', 'scallops'] },
  { name: 'Smoked salmon', verdict: 'caution', category: 'Seafood', reason: 'Cold-smoked or cured fish (lox, nova) carries a small listeria risk. It\u2019s safe if cooked into a hot dish.', keywords: ['smoked salmon', 'lox', 'nova'] },

  // ───────────────────────── MEAT & EGGS ─────────────────────────
  { name: 'Cooked chicken', verdict: 'safe', category: 'Meat & eggs', reason: 'Safe when cooked all the way through (165\u00b0F / 74\u00b0C, no pink). Reheat cold pre-cooked chicken until steaming before eating.', keywords: ['chicken', 'poultry', 'cooked chicken'] },
  { name: 'Deli meat', verdict: 'caution', category: 'Meat & eggs', reason: 'Cold cuts, ham and hot dogs can carry listeria, which grows even in the fridge. Safe if heated until steaming hot just before eating.', keywords: ['deli meat', 'cold cuts', 'lunch meat', 'ham', 'salami', 'hot dogs', 'prosciutto'] },
  { name: 'Undercooked meat', verdict: 'avoid', category: 'Meat & eggs', reason: 'Raw or rare meat risks toxoplasma, salmonella and E. coli. Cook to safe temperatures: 145\u00b0F whole cuts, 160\u00b0F ground meat, 165\u00b0F poultry.', keywords: ['undercooked meat', 'rare steak', 'raw meat', 'rare', 'steak'] },
  { name: 'P\u00e2t\u00e9', verdict: 'avoid', category: 'Meat & eggs', reason: 'Refrigerated p\u00e2t\u00e9 and meat spreads (including vegetable p\u00e2t\u00e9) can carry listeria. Canned/shelf-stable versions are okay.', keywords: ['pate', 'p\u00e2t\u00e9', 'meat spread'] },
  { name: 'Liver', verdict: 'avoid', category: 'Meat & eggs', reason: 'Very high in vitamin A, which can harm the baby in large amounts. Avoid liver and liver products like liver p\u00e2t\u00e9.', keywords: ['liver', 'liver pate', 'offal'] },
  { name: 'Cooked eggs', verdict: 'safe', category: 'Meat & eggs', reason: 'Safe when the yolk and white are firm. Aim for over-well or a firm scramble.', keywords: ['cooked eggs', 'egg', 'eggs'] },
  { name: 'Runny / raw eggs', verdict: 'caution', category: 'Meat & eggs', reason: 'Soft/runny eggs and raw-egg foods (homemade mayo, raw cookie dough, Caesar dressing) can carry salmonella. Pasteurized or fully-cooked eggs are safe.', keywords: ['runny eggs', 'raw egg', 'soft eggs', 'cookie dough', 'mayonnaise', 'caesar'] },
  { name: 'Bacon', verdict: 'safe', category: 'Meat & eggs', reason: 'Safe when cooked thoroughly until crisp and hot.', keywords: ['bacon'] },

  // ───────────────────────── DRINKS ─────────────────────────
  { name: 'Coffee', verdict: 'caution', category: 'Drinks', reason: 'Keep caffeine under 200mg a day \u2014 roughly one 12oz coffee. Remember tea, cola and chocolate add to the total.', keywords: ['coffee', 'caffeine', 'espresso', 'latte'] },
  { name: 'Tea', verdict: 'safe', category: 'Drinks', reason: 'Black and green tea are fine within the 200mg/day caffeine limit. Be a bit more careful with herbal teas (see Herbal tea).', keywords: ['tea', 'black tea'] },
  { name: 'Green tea', verdict: 'caution', category: 'Drinks', reason: 'Fine in moderation, but it counts toward your daily caffeine limit and very large amounts may affect folate absorption.', keywords: ['green tea', 'matcha'] },
  { name: 'Herbal tea', verdict: 'caution', category: 'Drinks', reason: 'Not all herbal teas are well studied in pregnancy. Stick to known-safe ones like ginger or peppermint in moderation, and check with your provider.', keywords: ['herbal tea', 'ginger tea', 'peppermint tea'] },
  { name: 'Alcohol', verdict: 'avoid', category: 'Drinks', reason: 'No amount is known to be safe in pregnancy. The advice is to avoid alcohol entirely.', keywords: ['alcohol', 'wine', 'beer', 'spirits', 'cocktail'] },
  { name: 'Fresh juice', verdict: 'caution', category: 'Drinks', reason: 'Freshly-squeezed or unpasteurized juice (juice bars, farm stands) can carry bacteria. Pasteurized boxed/bottled juice is safe.', keywords: ['fresh juice', 'juice', 'unpasteurized juice'] },

  // ───────────────────────── OTHER / CROSS-CUISINE ─────────────────────────
  { name: 'Hummus', verdict: 'safe', category: 'Other', reason: 'Safe \u2014 shop-bought is fine. If homemade, keep it refrigerated and eat it fresh.', keywords: ['hummus', 'houmous', 'chickpea dip'] },
  { name: 'Curry', verdict: 'safe', category: 'Other', reason: 'Safe when freshly cooked and served hot. The usual rules apply to its ingredients \u2014 paneer pasteurized, meat cooked through.', keywords: ['curry', 'masala'] },
  { name: 'Kimchi', verdict: 'caution', category: 'Other', reason: 'Fermented foods are generally fine if commercially made and refrigerated. Check it\u2019s from pasteurized production and eat it fresh.', keywords: ['kimchi', 'fermented', 'sauerkraut'] },
  { name: 'Tofu', verdict: 'safe', category: 'Other', reason: 'Safe and a good source of protein and calcium.', keywords: ['tofu', 'soy', 'bean curd'] },
  { name: 'Honey', verdict: 'safe', category: 'Other', reason: 'Safe for you during pregnancy. (The infant-botulism warning only applies to babies under 12 months.)', keywords: ['honey'] },
  { name: 'Peanuts', verdict: 'safe', category: 'Other', reason: 'Safe unless you have a nut allergy \u2014 eating them doesn\u2019t raise your baby\u2019s allergy risk. A good source of protein.', keywords: ['peanuts', 'peanut', 'nuts', 'peanut butter'] },
  { name: 'Spicy food', verdict: 'safe', category: 'Other', reason: 'Safe. It may cause heartburn for you, but it doesn\u2019t harm the baby.', keywords: ['spicy food', 'spicy', 'chilli', 'hot food'] },
  { name: 'Chocolate', verdict: 'safe', category: 'Other', reason: 'Safe in moderation \u2014 just note it contains some caffeine that counts toward your daily limit.', keywords: ['chocolate', 'cocoa'] },
  { name: 'Olives', verdict: 'safe', category: 'Other', reason: 'Safe \u2014 jarred and canned olives are fine.', keywords: ['olives', 'olive'] },
  { name: 'Raw flour / batter', verdict: 'avoid', category: 'Other', reason: 'Raw flour and uncooked batter or dough can carry E. coli and salmonella, even without eggs. Bake or cook it fully first.', keywords: ['raw flour', 'batter', 'cake batter', 'dough', 'cookie dough'] },
];

export function searchFood(query: string): FoodItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return FOODS.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.keywords.some((k) => k.includes(q) || q.includes(k))
  );
}

export const FOOD_CATEGORIES = Array.from(new Set(FOODS.map((f) => f.category)));