// Retorna o ponto na borda do círculo de destino na direção de origem
export function pontoNaBorda(origem, destino, raio) {
  const dx = destino.x - origem.x;
  const dy = destino.y - origem.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return destino;
  return {
    x: destino.x - (dx / dist) * raio,
    y: destino.y - (dy / dist) * raio,
  };
}

// Retorna o ponto de controle da curva de Bezier entre dois pontos
export function calcularCurvaBezier(origem, destino, curvatura) {
  const mx = (origem.x + destino.x) / 2;
  const my = (origem.y + destino.y) / 2;
  const dx = destino.x - origem.x;
  const dy = destino.y - origem.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return { x: mx, y: my };
  // perpendicular normalizado (rotação 90° anti-horária)
  const px = -dy / dist;
  const py = dx / dist;
  return {
    x: mx + px * curvatura,
    y: my + py * curvatura,
  };
}

// Retorna os pontos da cubic Bezier para desenhar um self-loop acima do estado
export function pontosSelfLoop(centro, raio) {
  const { x, y } = centro;
  return [
    x - raio * 0.87, y - raio * 0.5,  // início (borda superior-esquerda)
    x - raio * 2.5,  y - raio * 3.2,  // cp1
    x + raio * 2.5,  y - raio * 3.2,  // cp2
    x + raio * 0.87, y - raio * 0.5,  // fim (borda superior-direita)
  ];
}

// Verifica se há transição nos dois sentidos entre origem e destino
export function ehBidirecional(afd, origem, destino) {
  if (origem === destino) return false;
  const temDireto = Object.values(afd.transicoes[origem] ?? {}).includes(destino);
  const temInverso = Object.values(afd.transicoes[destino] ?? {}).includes(origem);
  return temDireto && temInverso;
}
