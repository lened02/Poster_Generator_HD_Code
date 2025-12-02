// font families to randomly choose from
const fontFamilies = [
'Arial, sans-serif', 
'Arial Black, sans-serif', 
'Arial Narrow, sans-serif', 
'Arial Rounded MT Bold, sans-serif', 
'Arial Unicode MS, sans-serif', 

];

function randomFont() {
  return fontFamilies[Math.floor(Math.random() * fontFamilies.length)];
}