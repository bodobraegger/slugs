function getColorCategory(color) {
    let cat1 = 0;
    let i = 0;
    for(i = 0; i < COLORCATS.length; i++) {
      if(color.h - COLORCATS[i] >= 0) {
        cat1 = i;
      } 
    }
    return (cat1==7? 0:cat1);
}

function sameColorCategory(color1, color2) { // color blindness: https://colororacle.org/?
    let cat1=-1; let cat2 = -1;
    /*let i = 0;
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
    */
    cat1 = getColorCategory(color1); 
    cat2 = getColorCategory(color2);
    if(cat1 == cat2) { // || colorDiff <= similarityBound
      return true;
    }
    else {
      return false;
    }
}  

function getRandomColorInCat(cat) {
  if(cat instanceof Color) {
    cat = getColorCategory(cat);
  }
    let chosenCatIndex;
    if(Array.isArray(cat)) {
        let v = Math.floor(Math.random()*(cat.length))
        chosenCatIndex = COLORCATS.indexOf(cat[v])+1
    } else if(typeof cat == 'number') { 
        chosenCatIndex = cat+1
        //console.log(cat, Array.isArray(cat), chosenCatIndex, COLORCATS_HR[chosenCatIndex])
    } else {
        chosenCatIndex = Math.floor(Math.random()*(COLORCATS.length-1))
    }
    
    let hue = -1;
    let padding = 0.03
    let rangeStart = COLORCATS.at(chosenCatIndex-1)+padding;
    let rangeEnd = COLORCATS.at(chosenCatIndex)-padding;
    hue = FloatBetween(rangeStart, rangeEnd)
    
    if(chosenCatIndex == 0 || chosenCatIndex == COLORCATS.length) {
      padding = 0.003
      if(Math.random() <= 2/3) {
        rangeStart = COLORCATS.at(-1)+padding < 1 ? COLORCATS.at(-1)+padding : COLORCATS.at(-1)
        rangeEnd = 1;
        hue = FloatBetween(rangeStart, rangeEnd)
      } else {
        rangeStart = 0;
        rangeEnd = COLORCATS[0]-padding
        hue = FloatBetween(rangeStart, rangeEnd)
      }
    }
    let r = new Phaser.Display.Color();
    r.setFromHSV(hue, FloatBetween(0.85, 0.95), FloatBetween(0.8, 0.9))
    // hack to make hue saved on it...
    r.setTo(r.red, r.green, r.blue, r.alpha, true);
    
    return r;
}