// Single hidden container for all sprites
const spriteContainer = document.createElement('div');
spriteContainer.style.display = 'none';
document.body.appendChild(spriteContainer);

export function loadSvgSprite(url) {
  return fetch(url)
  .then(res => res.text())
  .then(svg => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = svg;
    const svgElement = tempDiv.querySelector('svg');
    if (svgElement) {
      spriteContainer.appendChild(svgElement);
    }

    return svgElement;
  })
  .catch(err => console.error(err))
}
