// Meilin's stance and attacks share one authored sheet and its fixed camera scale.
(() => {
  const previousGinga = drawGinga;
  drawGinga = function drawMeilinGinga(p) {
    if (p.id !== 7) return previousGinga(p);
    drawRedesignFrame(p, 0);
  };
})();
