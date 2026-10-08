// name, kcal, protein g, carbs g, fat g (per serving, approximate)
const RAW = [
["Roti (1)",100,3,18,2],["Rice cooked (1 cup)",205,4,45,0.4],["Dal (1 bowl)",150,9,20,4],["Paneer (100 g)",265,18,1,20],
["Egg boiled (1)",78,6,0.6,5],["Chicken curry (1 bowl)",240,22,6,14],["Chicken breast (100 g)",165,31,0,4],["Idli (1)",58,2,12,0.4],
["Dosa plain (1)",135,3,23,3],["Sambar (1 bowl)",130,6,18,4],["Paratha plain (1)",260,6,36,10],["Poha (1 plate)",250,5,45,6],
["Upma (1 plate)",220,5,33,8],["Samosa (1)",260,4,24,17],["Aloo sabzi (1 bowl)",180,3,28,7],["Rajma (1 bowl)",210,11,35,3],
["Chole (1 bowl)",270,12,40,8],["Curd (1 bowl)",100,6,8,5],["Milk (1 glass)",150,8,12,8],["Banana (1)",105,1,27,0.4],
["Apple (1)",95,0.5,25,0.3],["Chai with sugar (1 cup)",90,2,14,3],["Biryani (1 plate)",450,15,60,16],["Pizza slice (1)",285,12,36,10],
["Burger (1)",300,15,30,14],["Maggi (1 pack)",380,8,55,14],["Bread slice (1)",80,3,14,1],["Peanut butter (1 tbsp)",95,4,3,8],
["Oats (1 bowl)",150,5,27,3],["Almonds (10)",70,3,3,6],["Gulab jamun (1)",150,2,24,6],["Cold drink (1 can)",140,0,39,0],
["French fries (medium)",365,4,48,17],["Veg sandwich (1)",250,8,35,9]];
export const FOODS = RAW.map(([n, cal, p, c, f]) => ({ n, cal, p, c, f }));
