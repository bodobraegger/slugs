function getColorCategory(color) {
    let cat1 = 0;
    let i = 0;
    for(i = 0; i < COLORCATS.length; i++) {
      if(color.h - COLORCATS[i] >= 0) {
        cat1 = i;
      } 
      // console.log(color.h - COLORCATS[i])
    }
    return cat1;
}

function sameColorCategory(color1, color2) { // color blindness: https://colororacle.org/?
    let cat1=-1; let cat2 = -1;
    let i = 0;
    for(i = 0; i < COLORCATS.length; i++) {
      if(color1.h - COLORCATS[i] >= 0) {
        cat1 = i//+1;
      } 
      if(color2.h - COLORCATS[i] >= 0) {
        cat2 = i//+1;
      }
    }
    let colorDiff = Math.min(Math.abs(color1.h - color2.h), Math.abs(COLORCATS[cat1] - color2.h), Math.abs(COLORCATS[cat2] - color1.h));
    let similarityBound = 0.2 * (color1.h + color2.h)/2
    console.log('color.h:', color1.h, color2.h,'| dff:', colorDiff, 'similarityBound:', similarityBound)
    console.log('cat:', COLORCATS_HR[cat1], COLORCATS_HR[cat2])
  
    if(cat1 == cat2 || colorDiff <= similarityBound) {
      return true;
    }
    else {
      return false;
    }
}  

function getRandomColorInCat(cat=-1) {
    let chosenCatIndex = Math.floor(Math.random()*COLORCATS.length)
    if(cat != -1) { chosenCatIndex = cat+1}
    let hue = -1;
    let padding = 0.03
    let rangeStart = COLORCATS.at(chosenCatIndex-1)+padding;
    let rangeEnd = COLORCATS.at(chosenCatIndex)-padding;
    hue = getRandomInclusive(rangeStart, rangeEnd)
    
    if(chosenCatIndex == 0 || chosenCatIndex == COLORCATS.length) {
      padding = 0.003
      if(Math.random() <= 2/3) {
        rangeStart = COLORCATS.at(-1)+padding
        rangeEnd = 1;
        hue = getRandomInclusive(rangeStart, rangeEnd)
      } else {
        rangeStart = 0;
        rangeEnd = COLORCATS[0]-padding
        hue = getRandomInclusive(rangeStart, rangeEnd)
      }
    }
    // console.log(chosenCatIndex, COLORCATS_HR[chosenCatIndex])
    let r = new Phaser.Display.Color();
    r.setFromHSV(hue, getRandomInclusive(0.85, 0.95), getRandomInclusive(0.8, 0.9))
    // hack to make hue saved on it...
    r.setTo(r.red, r.green, r.blue, r.alpha, true);
    
    // console.log(rangeEnd - rangeStart, chosenCatIndex == 0)
    console.log(rangeStart, rangeEnd, cat, r.h, getColorCategory(r), COLORCATS_HR[getColorCategory(r)])
    // console.log(rangeStart, hue, rangeEnd, COLORCATS_HR[getColorClass(r)], r)
    return r;
}